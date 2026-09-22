# Professor Outreach V2 — n8n workflow bundle

Import the JSON files in this order:

1. `01-candidate-intake.json`
2. `02-professor-discovery.json`
3. `03-draft-preparation.json`
4. `04-approved-dispatch.json`
5. `05-recipient-review.json`
6. `06-campaign-actions.json`

These workflows intentionally contain no credential IDs or secrets. After import, reconnect every node marked `CONFIGURE`.

## Required environment variables

```text
OUTREACH_INTERNAL_API_KEY=<long-random-value>
OUTREACH_OBJECT_STORE_UPLOAD_URL=https://your-file-service.example/v1/upload
OUTREACH_DISCOVERY_API_URL=https://your-discovery-service.example/v1/professors/search
OUTREACH_ENRICHMENT_API_URL=https://your-retrieval-service.example/v1/professors/enrich
OUTREACH_GENERATION_API_URL=https://your-llm-gateway.example/v1/outreach/generate
OUTREACH_LATEX_API_URL=https://your-compiler.example/v1/compile/pdf
OUTREACH_REVIEW_BASE_URL=https://your-app.example/campaigns
OUTREACH_DEFAULT_OWNER_ID=<development-owner-uuid-only>
```

Use n8n credentials for authentication wherever possible. Environment variables should contain service locations and non-secret configuration. If your n8n configuration blocks `$env`, replace those expressions with n8n Variables or credential-backed HTTP authentication.

## Required Postgres schema

Create the tables and enum types from `../n8n-professor-outreach-v2-review.md`. Add these operational tables:

```sql
create table webhook_events (
  provider text not null,
  event_id text not null,
  received_at timestamptz not null default now(),
  primary key (provider, event_id)
);

create table global_suppressions (
  normalized_email text primary key,
  reason text not null,
  created_at timestamptz not null default now()
);
```

The templates assume the `recipients` table also has these columns:

```sql
alter table recipients
  add column if not exists research_interest text,
  add column if not exists evidence_json jsonb,
  add column if not exists approved_subject text,
  add column if not exists approved_html_body text,
  add column if not exists approved_cv_object_key text,
  add column if not exists approved_transcript_object_key text;
```

## External service contracts

### Object upload

Request: binary field `data`, plus `candidate_id` and `kind` form fields.

Response:

```json
{"object_key":"candidates/.../base-cv.tex","sha256":"..."}
```

### Discovery

Request:

```json
{"domain":"power electronics","countries":["US"],"limit":25}
```

Response:

```json
{
  "professors": [
    {
      "name":"Jane Doe",
      "email":"jane.doe@university.edu",
      "university":"Example University",
      "profile_url":"https://university.edu/faculty/jane-doe",
      "research_interest":"converter control",
      "source_urls":["https://university.edu/faculty/jane-doe"]
    }
  ]
}
```

### Enrichment

Request contains `recipient_id`, identity fields, and the canonical profile URL. Response must contain an `evidence` array whose claims are backed by authoritative URLs.

### Generation

The generation endpoint receives the candidate CV, recipient identity, and evidence. It must return:

```json
{
  "subject":"...",
  "html_body":"<p>...</p>",
  "cv_summary":"...",
  "professor_claims":[{"claim":"...","source_url":"https://..."}],
  "candidate_claims":[{"claim":"...","cv_quote":"..."}],
  "model":"...",
  "prompt_version":"outreach-v2"
}
```

### LaTeX compilation

Request body: `{ "tex": "..." }`. Response must be a PDF binary body in property `data`.

## Required credential connections

- All Postgres nodes: one least-privilege application credential.
- Internal HTTP nodes: header-auth credentials. Do not hard-code keys in node parameters.
- Gmail node: candidate-owned OAuth where possible. Configure HTML email and attachment field `cv_pdf`.
- Review notification Gmail node: an operations credential, or replace it with your product notification system.

## Review API (workflow 05)

Backend-first human approval interface — no frontend required to use it. All three endpoints authenticate the caller via an `x-owner-id` header, which must match the `owner_id` on the candidate that owns the recipient being acted on (falls back to `OUTREACH_DEFAULT_OWNER_ID` for local testing). This is the same pattern workflow 02 already uses.

### List pending drafts

```
GET /webhook/v2-reviews-list?candidate_id=<uuid>
GET /webhook/v2-reviews-list?campaign_id=<uuid>
x-owner-id: <uuid>
```

Returns every recipient currently in `REVIEW_REQUIRED` for that candidate or campaign, including the exact draft subject/body/CV key that would be sent if approved unchanged.

### Approve

```
POST /webhook/v2-reviews-approve
x-owner-id: <uuid>
{ "recipient_id": "<uuid>", "edited_subject": "<optional>", "edited_html_body": "<optional>" }
```

Atomically transitions `REVIEW_REQUIRED -> APPROVED`. Omit `edited_subject`/`edited_html_body` to approve the draft as generated; supply either to overwrite it first — edits are validated with the same subject/HTML rules workflow 03 enforces on generation, so a reviewer can't introduce a header-injection newline or unsafe HTML. Returns 409 if the recipient doesn't exist, isn't owned by the caller, or isn't in `REVIEW_REQUIRED` (already approved, rejected, or still enriching).

### Reject

```
POST /webhook/v2-reviews-reject
x-owner-id: <uuid>
{ "recipient_id": "<uuid>", "reason": "<optional>" }
```

Atomically transitions `REVIEW_REQUIRED -> DO_NOT_CONTACT` and records the reason in `last_error_code`/`last_error_message`. Same 409 semantics as approve.

## Campaign Actions API (workflow 06)

Closes the two remaining gaps between "the pipeline works when you drive it by hand" and "the pipeline works from a real client": nothing previously moved a campaign out of `DRAFT`, and nothing previously moved a discovered recipient into `SELECTED`. Same `x-owner-id` auth pattern as workflow 05.

### Activate a campaign

```
POST /webhook/v2-campaigns-activate
x-owner-id: <uuid>
{ "campaign_id": "<uuid>" }
```

Atomically transitions `DRAFT` or `PAUSED` → `ACTIVE`. Workflow 04 will not claim any recipient in a campaign that isn't `ACTIVE`, so this must be called at least once before dispatch can send anything for a campaign created via workflow 02 (which always inserts as `DRAFT`). Returns 409 if the campaign doesn't exist, isn't owned by the caller, or is already `ACTIVE`/`COMPLETED`/`CANCELLED`.

### Select recipients to contact

```
POST /webhook/v2-recipients-select
x-owner-id: <uuid>
{ "campaign_id": "<uuid>", "recipient_ids": ["<uuid>", "<uuid>", ...] }
```

Bulk-transitions up to 100 recipients per call from `DISCOVERED` → `SELECTED`, scoped to the given campaign and caller ownership. This is the "aspirant picks which discovered professors to actually contact" step from the review doc — workflow 03 only enriches/drafts `SELECTED` recipients, so nothing reaches review without this call. Unlike approve/reject, this is a bulk operation with partial-success semantics: it always returns 200 with `{ requested_count, selected_count, selected_recipient_ids }` — IDs that were already selected, didn't belong to the campaign/owner, or didn't exist are silently excluded from the count rather than failing the whole batch.

## Activation order

Keep `04-approved-dispatch` inactive until all acceptance tests pass. Start with draft preparation and review. Approve a test recipient, execute dispatch manually, verify the recipient, attachment hash, subject, and body, then enable the schedule with a low daily limit.

