# Review Queue dashboard

Vite + React + TypeScript + Tailwind, styled in the trigger.dev school of restrained dark UI. Read [CLAUDE.md](./CLAUDE.md) before adding to this — it governs the design system and the rules for talking to the backend.

## Run it

```
npm install
npm run dev
```

Opens on `http://localhost:5173`.

## What's here right now

Only the **Review Queue** screen — the highest-priority piece from CLAUDE.md. It's currently wired to sample data in `src/data/mock-recipients.ts`, shaped exactly like the real `GET /v2-reviews-list` response from [`../workflows/05-recipient-review.json`](../workflows/05-recipient-review.json). Approve/Reject currently update local state only — see the `TODO(auth)` comment in `src/components/review/review-queue.tsx` for exactly what needs to change once real authentication exists (do not wire the real endpoints with a hardcoded `x-owner-id` in the meantime — that's an explicit rule in CLAUDE.md, not an oversight).

The sidebar's other nav items (Campaigns, Pipeline, Recipients) are visual only — no routing is wired yet, since there's only one screen built so far.

## Stack

- Vite + React + TypeScript
- Tailwind CSS, configured with a small set of semantic HSL design tokens in `src/index.css` (background/card/border/accent/success/warning/destructive) rather than one-off colors in components
- A handful of shadcn-pattern primitives (`Button`, `Badge`, `Card`, `Separator`) hand-authored in `src/components/ui/` rather than pulled via the shadcn CLI — same conventions (`cva`, `cn`, Radix `Slot`), so any component added later through the CLI will drop in cleanly
- `lucide-react` for icons — one consistent set, used sparingly
