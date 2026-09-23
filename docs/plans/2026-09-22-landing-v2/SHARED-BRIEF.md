# Shared brief for the V2 direction builds

Read with `../2026-09-22-landing-v2-directions.md` (the three directions) and `../landing-v3/voice.md` (voice).

## Product truth (what the page may say)

Sylph: a company writes its spend policy once (or answers a dozen questions and Sylph writes it); Sylph compiles
it into rules a person approves; from then on every card charge is checked as it happens, on the cards and banks
the company already has. Receipts arrive by upload, email or text and find their own charge. Matching gates
enforcement. Every verdict names the rule, the threshold and the amount (Cleared / Needs a note / Blocked, where
Blocked means kept off the reimbursable total, never a declined card). Deterministic: no model in the decision,
same charge same answer. Currency normalized at the rate on the receipt date. Duplicates flagged. At month end the
report is assembled, audit-grade PDF, XLSX, GL journal CSV; QuickBooks Online posting only where
`QBO_LIVE` (from `@/components/custom/site/sample-data`) is true. Pricing is public: $30 per active employee a
month (Small business, up to 100). Security line allowed verbatim in spirit: policies and receipts are encrypted in
transit and at rest and never used to train models. Setup: at most "same-day".

Roadmap, only if labelled "In build, not yet available": card controls at the terminal (Visa first, no partnership
implied), the receipt rebuilt from card line items.

## Off limits

Customer logos or names, testimonials, metrics or percentages, savings claims, SOC 2/GDPR badges or any
certification, competitor names, "first/only/#1", "live" or "real-time" booking, AI chat, "tamper-evident", setup
faster than same-day, anything implying a Visa partnership. No em or en dashes and no middots anywhere (copy,
comments, docs). Never a question as a headline. Banned adjectives: powerful, seamless, effortless, intelligent,
smooth, elegant, beautiful, modern. Every panel showing numbers carries a "Sample data" chip. Sample merchants and
people are invented (reuse `ENGINE_ROWS` in `site/sample-data.ts` freely).

## Taste

Motion is caused, never ambient: something moves because it demonstrates something, and everything that crosses
the page lands. Reduced motion renders the settled end state, fully readable. Rejected before: glow orbs,
gradient blobs, eyebrow-label tropes, vortex backgrounds, "bland" safe SaaS. Banned faces: Inter, Space Grotesk,
Geist, Satoshi, and avoid the over-used display serifs (Instrument Serif, Fraunces, Playfair). Green `#0ecc83`
means cleared or in policy, never a decorative fill; amber for exceptions, oxblood for blocked. Rendered objects
(transparent WebP, `@/components/custom/site/obj` `Obj`): policy, receipt, envelope, phone, tray, boarding-pass,
card, terminal, report. Loops in `public/site/video/lab/` (air-trio, policy-fan, receipt-lift, terminal-tap).
The Sylph bird: `Mark` in `@/components/custom/site/mark`.

## Repo mechanics

App in `sylph-product-site/` (Next.js 16.1, React 19.2, Tailwind 4 available but the landing uses plain scoped CSS,
pnpm, `@/*` alias, kebab-case files). The dev server is already running on http://localhost:3200 with hot reload
(do not start another, do not run `pnpm build`: the lead runs the build once all directions land). Checks you run:
`pnpm typecheck` and `pnpm exec eslint <your paths>`. Visual evidence: `node scripts/shot.mjs '<json>'` (real-time
headless Chrome over CDP; see the header comment in the script; `mobile:true` with `w:390`; `reduce:true`; `eval`
to scroll, the page may use Lenis: `window.scrollTo` works when your page does not mount SmoothScroll). The Browser
pane cannot judge motion (it does not paint while hidden). Do not commit; the lead commits.
