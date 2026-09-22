# Professor Outreach Automation — Production Review and V2 Design

## Executive assessment

The prototype proves the happy path, but it is not safe to expose as a multi-user product. Its primary correctness risk is positional item joining: professor rows, research results, generated CVs, PDFs, subjects, and messages are repeatedly matched by array index. If one API call drops, retries differently, or returns no result, a CV or email can be associated with the wrong professor. The current count checks detect some drops, but they do not prove identity.

The production invariant should be:

> Every artifact and state transition is keyed by an immutable `campaign_id` and `recipient_id`; no recipient-specific data is ever joined by item position.

The product should be implemented as four workflows:

1. **Candidate intake** — validates consent and uploaded files, stores the immutable base CV/transcript, and creates a candidate record.
2. **Professor discovery** — discovers candidates from authoritative university sources, captures source URLs and timestamps, deduplicates them, and asks the aspirant to select recipients.
3. **Draft preparation** — enriches selected recipients, generates a CV summary and email as structured data, validates every claim, compiles the PDF, and places the result in `REVIEW_REQUIRED`.
4. **Approved dispatch** — claims one approved recipient atomically, sends at a controlled rate, records the Gmail message ID, and transitions the recipient to `SENT` or a retry/dead-letter state.

Do not combine these into one large execution. Separating workflows gives bounded retries, resumability, clearer ownership, and smaller failure domains.

## Critical findings in the supplied workflow

### P0 — address before any further testing

- **Secrets and personal data are exported.** The compiler API key is hard-coded. Pin data contains a signed Tally download URL, access token, applicant name, phone, email, CV, and webhook details. Rotate the compiler key, invalidate/recreate exposed signed URLs where possible, remove all pin data, replace the webhook path, and delete/redact shared exports and execution history.
- **The two trigger branches do not share runtime state.** A webhook execution extracts a CV while a schedule/manual execution loads professors. Expressions such as `$('Prof Profile Info SerpAPI1').all()` do not create durable cross-execution storage. The apparent integration depends on pinned/test data.
- **Positional joins can misaddress email.** `combineByPosition`, `$itemIndex`, and references to `.item` assume all branches keep identical order and cardinality. That assumption breaks on an empty search result, partial LLM failure, retry, filtering, or future concurrency.
- **Sending has no human approval gate.** An LLM can hallucinate a professor's paper or alter a candidate claim, after which Gmail sends it automatically. For academic outreach, drafts should require candidate approval at least until the system has strong measured quality.
- **There is no atomic claim/idempotency mechanism.** Two schedule executions can both read the same non-mailed row and send duplicates. Marking `Mailed` only after send leaves an unavoidable crash window unless a provider idempotency strategy and reconciliation job are used.

### P1 — required for a production launch

- `status !== 'mailed'` treats `FAILED`, `PROCESSING`, `DO_NOT_CONTACT`, and malformed rows as sendable. Use an explicit state machine.
- Google Sheets is being used as both queue and database. It does not provide the row-locking and conditional update semantics required for reliable concurrent workers. Use Postgres/Supabase for production. Sheets can remain an operator view.
- Only `organic_results[0].snippet` is used. A search snippet is neither sufficient evidence nor necessarily about the correct person. Require identity matching and authoritative sources, retain URLs, and refuse unsupported claims.
- The LLM rewrites the entire LaTeX document. This increases cost and allows unrelated facts/layout to drift. Generate only a structured summary, validate it, then replace the summary deterministically.
- The workflow asks a second LLM to “humanize” the first LLM. This adds latency and another hallucination surface. Use one structured generation call plus deterministic validators.
- The Gmail node reads the body from `Email Writer`, not `Email Fixer`, so the final edit may never be sent. The subject and body are also rejoined indirectly.
- The attachment configuration has an empty binary field entry. Set the attachment input field explicitly, for example `cv_pdf,transcript_pdf`.
- The filename is based on `Candidate Name` even though the comment implies a professor-specific file. Sanitize filenames and include `recipient_id`, not personal data where avoidable.
- The Google Sheets update contains `row_number: 0`; matching by a mutable/display serial number is weak. Use a UUID.
- Search, model, compilation, and Gmail failures all share generic retries. Retries need exponential backoff with jitter, classification of retryable versus permanent errors, and a maximum attempt count.
- No bounce, reply, unsubscribe/opt-out, complaint, or invalid-address lifecycle exists.
- No cost quota, per-user quota, domain limit, or global rate limit exists.
- No structured logs or correlation IDs exist. It is hard to answer “what happened to recipient X?”
- The workflow contains mojibake (`â€`, `Ã‚Â°`), so UTF-8 handling is already inconsistent.

## V2 data model

Use Postgres as the source of truth. Store binary documents in object storage and keep only object keys in the database.

```sql
create type campaign_status as enum ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');
create type recipient_status as enum (
  'DISCOVERED', 'SELECTED', 'ENRICHING', 'REVIEW_REQUIRED',
  'APPROVED', 'PROCESSING', 'SENT', 'REPLIED', 'BOUNCED',
  'RETRYABLE_FAILED', 'PERMANENT_FAILED', 'DO_NOT_CONTACT'
);

create table candidates (
  id uuid primary key,
  owner_id uuid not null,
  full_name text not null,
  email text not null,
  consent_at timestamptz not null,
  base_cv_object_key text not null,
  transcript_object_key text,
  created_at timestamptz not null default now()
);

create table campaigns (
  id uuid primary key,
  candidate_id uuid not null references candidates(id),
  domain text not null,
  status campaign_status not null default 'DRAFT',
  daily_limit integer not null default 10 check (daily_limit between 1 and 25),
  created_at timestamptz not null default now()
);

create table recipients (
  id uuid primary key,
  campaign_id uuid not null references campaigns(id),
  professor_name text not null,
  professor_email text not null,
  university text not null,
  canonical_profile_url text not null,
  status recipient_status not null default 'DISCOVERED',
  attempt_count integer not null default 0,
  next_attempt_at timestamptz,
  claimed_at timestamptz,
  sent_at timestamptz,
  provider_message_id text,
  last_error_code text,
  last_error_message text,
  unique (campaign_id, professor_email)
);

create table artifacts (
  id uuid primary key,
  recipient_id uuid not null references recipients(id),
  kind text not null,
  object_key text,
  content text,
  sha256 text not null,
  model text,
  prompt_version text,
  created_at timestamptz not null default now()
);

create table evidence (
  id uuid primary key,
  recipient_id uuid not null references recipients(id),
  source_url text not null,
  source_title text,
  publisher text,
  published_at date,
  retrieved_at timestamptz not null default now(),
  excerpt text,
  unique (recipient_id, source_url)
);
```

## State machine

Only the following transitions are legal:

```text
DISCOVERED -> SELECTED -> ENRICHING -> REVIEW_REQUIRED -> APPROVED
APPROVED -> PROCESSING -> SENT
PROCESSING -> RETRYABLE_FAILED -> PROCESSING
PROCESSING -> PERMANENT_FAILED
any non-SENT state -> DO_NOT_CONTACT
SENT -> REPLIED | BOUNCED
```

The dispatch worker must claim work with one atomic query:

```sql
with next_recipient as (
  select id
  from recipients
  where status in ('APPROVED', 'RETRYABLE_FAILED')
    and coalesce(next_attempt_at, now()) <= now()
  order by coalesce(next_attempt_at, '-infinity'), id
  for update skip locked
  limit 1
)
update recipients r
set status = 'PROCESSING', claimed_at = now(), attempt_count = attempt_count + 1
from next_recipient n
where r.id = n.id
returning r.*;
```

This is the concurrency boundary. A schedule trigger may start multiple workers, but only one can claim a row.

## Updated workflow specification

### Workflow A — Candidate Intake

```text
Webhook (POST /v2/candidates)
  -> Verify webhook signature and event ID
  -> Validate schema, MIME type, extension, and file-size ceiling
  -> Deduplicate on provider event ID
  -> Malware scan / quarantine
  -> Store immutable CV and optional transcript in object storage
  -> Insert candidate + consent timestamp
  -> Respond 202 with candidate_id
```

Implementation rules:

- Find Tally fields by stable field key, never `fields[2]`.
- Allow only expected formats. A `.tex` file served as `application/octet-stream` needs extension and content validation.
- Reject unexpected redirects and restrict download hosts to an allowlist to prevent SSRF.
- Do not log signed URLs or file contents.
- Store `sha256` so identical uploads can be deduplicated and audited.

### Workflow B — Discovery and selection

```text
POST /v2/campaigns { candidate_id, domain, countries?, universities? }
  -> Validate ownership and quota
  -> Discover faculty candidates
  -> Normalize names, email, university, profile URL
  -> Verify email domain belongs to institution
  -> Deduplicate
  -> Store evidence URLs and confidence scores
  -> Present list to aspirant
  -> Aspirant selects recipients
```

Treat discovery as retrieval, not generation. Prefer official faculty pages, lab pages, ORCID, Crossref/OpenAlex, and publication landing pages. Search snippets may help locate sources but must not be presented as verified professor facts.

### Workflow C — Draft preparation

```text
Selected recipient
  -> Atomic transition SELECTED -> ENRICHING
  -> Fetch authoritative pages with bounded timeout
  -> Extract evidence records
  -> Generate strict JSON draft
  -> Validate citations and candidate claims
  -> Generate only replacement CV summary
  -> Deterministically patch LaTeX
  -> Compile in isolated service
  -> Check PDF magic bytes, MIME type, size, and page count
  -> Store artifacts and hashes
  -> Transition to REVIEW_REQUIRED
```

Use a structured LLM response such as:

```json
{
  "subject": "Prospective PhD applicant — power-quality classification",
  "html_body": "<p>...</p>",
  "cv_summary": "...",
  "professor_claims": [
    {"claim": "...", "source_url": "https://...", "source_excerpt": "..."}
  ],
  "candidate_claims": [
    {"claim": "...", "cv_quote": "..."}
  ]
}
```

Reject output when JSON parsing fails, a cited URL is not in the retrieved evidence set, a candidate claim cannot be found in the base CV, the subject contains a newline, the email is outside the configured word range, forbidden HTML appears, or the CV summary contains a proper noun not present in the candidate CV.

Patch LaTeX deterministically in a Code node:

```javascript
const input = $json;
const cv = input.base_cv;
const summary = input.generated.cv_summary.trim();
const section = /\\section\{SUMMARY\}[\s\S]*?(?=\\section\{EXPERIENCE\})/;

if (!section.test(cv)) throw new Error('CV_SUMMARY_SECTION_NOT_FOUND');
if (!summary || summary.length > 900) throw new Error('CV_SUMMARY_INVALID');

return [{
  json: {
    ...input,
    tailored_cv: cv.replace(section, `\\section{SUMMARY}\n${summary}\n\n`),
  },
  pairedItem: { item: 0 },
}];
```

Do not run regex “repair” over an entire LLM-generated LaTeX document. A repair can silently change valid commands and still produce the wrong CV.

### Workflow D — approved dispatch

```text
Schedule (every 5 minutes)
  -> Check campaign/user/global daily quotas
  -> Atomically claim one APPROVED row
  -> Re-check DO_NOT_CONTACT and prior provider_message_id
  -> Load immutable approved artifacts by recipient_id
  -> Gmail send (HTML; attachment fields `cv_pdf,transcript_pdf`)
  -> Persist provider message ID and SENT timestamp
  -> Wait/rate-limit with jitter
  -> Loop
```

All Gmail expressions should read from the current item only:

```text
To:         {{ $json.professor_email }}
Subject:    {{ $json.approved_subject }}
HTML body:  {{ $json.approved_html_body }}
Attachments: cv_pdf,transcript_pdf
```

Never use `$('Some earlier node').item` for recipient identity at send time. The current dispatch item must already contain the complete, validated send envelope.

On a retryable Gmail error (429 or transient 5xx), set `RETRYABLE_FAILED` and compute exponential backoff with jitter. On invalid recipient/auth/policy errors, set `PERMANENT_FAILED`. If Gmail accepts the send but the database update fails, reconcile using a unique marker stored in an internal header or the sent-mail record before retrying.

## Operational controls

- Default to **draft/review mode**. Let the aspirant edit and explicitly approve each first-contact email.
- Start with 5–10 messages per user per day and a several-minute gap. Make limits configurable and enforce them server-side.
- Stop a campaign automatically on elevated bounces, complaints, authentication failure, or abnormal provider responses.
- Implement `DO_NOT_CONTACT` globally by normalized email, not only per campaign.
- Do not use open-tracking pixels by default. Track operational delivery events and replies instead.
- Configure SPF, DKIM, and DMARC for the sending domain. Do not impersonate the aspirant from an unrelated domain.
- Store the exact approved subject/body/CV hashes. Never regenerate content between approval and send.
- Retain only the minimum personal data and give users export/delete controls. Define retention for source documents, generated artifacts, logs, and failed executions.
- Run an n8n security audit, disable risky/community nodes that are not required, use separate dev/staging/prod credentials, and restrict workflow/editor access.

## Observability and service objectives

Every log/event should include `execution_id`, `candidate_id`, `campaign_id`, `recipient_id`, `workflow_version`, `prompt_version`, `attempt`, `latency_ms`, and a stable error code. Do not log raw CVs, email bodies, access tokens, or signed URLs.

Recommended initial metrics:

- discovery precision after human review;
- draft approval and edit rates;
- compilation success rate;
- duplicate-send count (target: zero);
- misaddressed-artifact count (target: zero);
- bounce and reply rates;
- p50/p95 latency and cost per prepared recipient;
- retry/dead-letter volume by dependency.

Use an error workflow to alert on P0/P1 failures and place exhausted retries into a dead-letter queue. Provide an operator replay action that re-enters from a named state rather than rerunning the whole campaign.

## Migration plan from the prototype

1. Immediately deactivate sending and rotate the exposed compiler key and webhook path. Remove pin data and purge/redact sensitive execution records.
2. Add UUIDs and the explicit state machine. Stop treating every non-`Mailed` row as pending.
3. Move CV/transcript files to object storage and recipient/campaign state to Postgres.
4. Split the workflow into intake, discovery, draft preparation, and dispatch.
5. Replace every positional merge and cross-node `.item` lookup with current-item fields keyed by `recipient_id`.
6. Replace full-document CV generation with structured summary generation plus deterministic patching.
7. Add evidence-based claim validation and mandatory human approval.
8. Add atomic claims, quotas, bounded retries, dead-letter handling, reconciliation, and bounce/reply processing.
9. Test in shadow mode, then draft-only mode, then a tightly limited sending pilot.

## Acceptance tests

- Two workers race for one approved recipient; exactly one Gmail call occurs.
- The second professor enrichment fails; the first and third artifacts still retain the correct `recipient_id` and nobody receives another person's CV.
- A schedule reruns after Gmail success but before database acknowledgement; reconciliation prevents a duplicate.
- A search result names a different professor with the same surname; identity validation rejects it.
- The model invents a paper, score, or candidate skill; validation blocks review and send.
- The compiler returns HTML with HTTP 200; magic-byte/MIME validation rejects it.
- An applicant revokes consent or a professor is marked `DO_NOT_CONTACT`; queued sends are blocked.
- A malicious upload, oversized file, unexpected redirect, invalid email, newline in subject, and unsafe HTML are rejected.
- UTF-8 names and degree symbols survive intake, generation, compilation, review, and email.
- API 429/5xx responses back off; permanent 4xx responses enter `PERMANENT_FAILED` without looping.

## Release recommendation

The prototype should be classified as a proof of concept. A reasonable first production release is a **research-and-draft assistant with human approval**, not an autonomous cold-email sender. Automatic dispatch can be enabled later per user only after duplicate rate, claim accuracy, bounce rate, and approval-edit metrics demonstrate that the pipeline is controlled.
