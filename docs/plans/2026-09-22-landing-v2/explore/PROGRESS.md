# Explore run progress (2026-09-22)

Brief: `/Users/benfaib/Janus/Sylph/docs/prompts/2026-09-22-opus55-landing-explore.md`. Branch
`explore/landing-directions-2026-09-22` (local, cut from `landing-two-sides` at `cb87be9`), worktree
`sylph-product-page-v2`, dev server :3200 (launch.json `product-page-v2`).

## Shared pieces (lead)

- `src/app/lab/layout.tsx`: noindex for every route under /lab.
- `src/app/lab/page.tsx` + `directions.ts` + `lab.css`: the index; edit `directions.ts` to change a row.
- `scripts/explore-check.mjs <url>`: console, exceptions, failed requests and horizontal overflow at 1440, 390
  and 1440 reduced motion. Exit 0 means clean.

## Directions

Each owns `src/app/lab/<slug>/`, `src/components/custom/lab/<slug>/`, `public/lab/<slug>/` and
captures in `explore/<slug>/` here (with a NOTES.md).

| Slug | Kind | gen-image cap | Status |
|---|---|---|---|
| receipt | Departure: the receipt narrates, the page is the receipt | $1.50 | landed 8fb3ce0 (spent ~$0.52) |
| compiler | Departure: the policy editor, visitor edits and charges re-verdict | $0.50 | landed 4136f8e (spent $0) |
| pile | Departure: the sample month as a data story that sorts itself | $0.50 | landed 7df4877 (spent $0) |
| janus | Push: split page, Priya and Dana face each other the whole way down | $2.50 | landed 8ec00fe (spent $0) |
| comic | Push: the cast as graphic-novel protagonists | $6.00 | landed 0084833 (spent ~$1.75) |
| drop | Push: the charge as a toy dropped through rule gates, deterministic | $1.50 | landed 7afa2ae (spent $0) |

## State

Done and shipped at `/lab` on branch `lab/landing-directions` (cut from `origin/staging`; routes, components and
public assets renamed from `explore` to `lab`, per-frame captures cut to one sheet per direction). The local branch
`explore/landing-directions-2026-09-22` keeps the original `/explore` build and every full-size frame. Open for
Ben: the compiler's draft-preview claim.
