# Professor Outreach — Review Dashboard (Frontend)

You are a senior UI designer and frontend developer. Every screen you build in this directory must read as a **premium, dark-themed interface** — the kind a well-funded B2B SaaS product ships, not a scaffolded admin panel. Use subtle animation, deliberate spacing, and clear visual hierarchy to do the work that decoration usually does. Restraint is the aesthetic: fewer, better-considered elements beat more of them.

This file governs everything built in `frontend/`. Read it before writing any component. If a rule here conflicts with a one-off request in conversation, ask before breaking it — these rules exist so the product stays coherent across many separate sessions of work, not just the current one.

## What this product actually is

This dashboard is the human-facing layer on top of the n8n backend in [`../workflows/`](../workflows/). It does not replace that backend — it calls it. Read [`../workflows/README.md`](../workflows/README.md) before building any data-fetching logic; it is the source of truth for every endpoint contract, request/response shape, and status code this frontend will consume. Do not invent an API shape that isn't documented there — if something the UI needs doesn't exist as an endpoint yet, that's a backend gap to flag, not something to mock permanently and forget about.

The dashboard's core job, in priority order:

1. **Review queue** — surface recipients in `REVIEW_REQUIRED`, let a human read the generated subject/body/CV, edit if needed, and approve or reject. This is the highest-stakes screen: a mistake here sends a real email to a real professor. Design and build it with that weight in mind — no dense, cluttered table; give each draft room to actually be read.
2. **Campaign setup and selection** — create a campaign, review discovered professors, select which to contact, activate the campaign.
3. **Pipeline visibility** — where is each recipient in the state machine (`DISCOVERED → SELECTED → ENRICHING → REVIEW_REQUIRED → APPROVED → PROCESSING → SENT`, or `DO_NOT_CONTACT`/`RETRYABLE_FAILED`/`PERMANENT_FAILED`), and what needs the candidate's attention right now.

Everything else is secondary. Don't build screens for backend capabilities that don't exist yet (bounce/reply handling, suppression-list management — see the open gaps in the backend README) — build clear empty/disabled states instead, and note the gap rather than faking data.

## Visual design system

**Palette.** Define a small set of semantic tokens, not ad-hoc hex values scattered through components: a near-black background (not pure `#000`), two or three elevated surface tones for layering cards over the base, a single restrained accent color used sparingly for primary actions and active states, and text tones for primary/secondary/disabled content with contrast ratios that pass WCAG AA at minimum. Depth comes from subtle surface-tone shifts and hairline borders, not drop shadows stacked on gradients.

**No generic gradients.** No default purple-to-blue hero gradients, no rainbow blur blobs, no gradient text. If a gradient is used at all, it must be a deliberate, near-monochrome one-or-two-stop shift used for a specific reason (e.g., a subtle surface elevation cue), never as decoration filling empty space.

**No emoji icons.** Use a single consistent icon set (outline or duotone, not mixed styles) for all iconography. Every icon needs a reason to exist — don't add one just to fill a slot next to a label.

**No inline styles.** All styling goes through a consistent system — pick one (CSS Modules, Tailwind, or a styled-system) at the start of implementation and use it exclusively. No `style={{ ... }}` props, no inline `style=""` attributes, anywhere.

**Typography.** One typeface family, a deliberate type scale (not just "heading, body, small"), and real hierarchy — size, weight, and color/opacity all doing distinct jobs, not size alone. Line length and line height matter more than usual on the review screen, since reviewers are reading full email bodies.

**Spacing.** Use a consistent spacing scale (e.g., a 4px or 8px base unit) applied deliberately — generous whitespace around high-stakes content (the review screen) and tighter, denser spacing for scanning content (pipeline/status tables). Don't let spacing be an afterthought of whatever the component library defaults to.

**Motion.** Subtle and purposeful only: state transitions, loading states, and focus/hover feedback. No bouncy easing, no decorative motion, no animation that exists just to look alive. Respect `prefers-reduced-motion` — every animation needs a reduced-motion fallback that's either instant or a simple opacity fade. Keep durations short (roughly 120–250ms for UI feedback); anything slower needs a specific reason.

**Avoid the generic "AI-built app" look.** Concretely, that means: no glassmorphism/backdrop-blur cards stacked everywhere, no default shadcn hero-with-gradient-orbs pattern, no pill-shaped buttons on every single element, no low-contrast gray-on-gray text passed off as "minimal," no stock Inter-at-default-weights with no hierarchy. If a design decision would look identical in a hundred other AI-generated dashboards, reconsider it.

## Code conventions

- Componentize by what the UI actually needs, not preemptively — don't build a generic design-system library before there are at least two real consumers of a pattern.
- No inline styles (restated because it's a hard rule, not a preference).
- No unused abstractions, no speculative props "for future flexibility." Build what the current screen needs.
- Keep data-fetching, validation, and presentation separated — a component that renders the review queue shouldn't also own the fetch/retry/error logic inline; extract that.
- Match the backend's own validation rules on the client where it matters for UX (e.g., the same subject-newline and HTML-shape checks workflow 03/05 enforce) so a reviewer gets an immediate inline error instead of a failed request — but never treat client-side validation as the security boundary; the backend re-validates regardless, and that's correct.

## API integration rules

- Every write action (approve, reject, select, activate) is calling an **atomic, idempotent** backend endpoint — see the read of [`../workflows/README.md`](../workflows/README.md) for exact semantics. Handle the documented conflict responses (409 on approve/reject/activate; `selected_count: 0` on a no-op select) as real, expected states with real UI feedback — not as generic errors. A reviewer double-clicking "Approve" should see "already handled," not a raw error toast.
- **`x-owner-id` is a known, unresolved security gap in the backend** (documented in prior project history): it is currently a trusted header, not verified authentication. Do not hardcode a real owner UUID anywhere in frontend source or bundle it into client-side code. Treat wiring this up as blocked on the backend actually implementing real session/token auth — flag it rather than working around it with a hardcoded value that would ship to production.
- Never embed a Supabase service-role key, n8n credential, or any backend secret in frontend code — this app talks to n8n webhook endpoints only, never directly to Postgres or Supabase Storage with privileged credentials.
- Design every data-fetching surface with explicit loading, empty, and error states from the start — not as an afterthought. The review queue being empty ("nothing pending review") is a normal, common state, not an error; design it deliberately.

## Hostinger deployment

Before scaffolding a framework, confirm which Hostinger plan/hosting type this is deploying to — shared/static hosting versus Node.js or VPS hosting determines whether this must build to a static export (a static SPA, or a statically-exported Next.js build) or can run a persistent Node server. Don't assume; ask if it isn't already established. Keep environment-specific config (API base URL, ngrok/tunnel URL during development vs. the real backend URL in production) in environment variables, never hardcoded — the backend's public URL will change once it moves off an ngrok tunnel to a real host.

## Accessibility

Non-negotiable, not a stretch goal, particularly because the review screen gates real emails going to real people: keyboard-navigable approve/reject actions, visible focus states (styled to match the design system, never removed), sufficient color contrast, and semantic HTML (real `<button>`s, real form controls) under whatever component system is chosen.
