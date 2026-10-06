# CLAUDE.md

Orientation for anyone (engineer or agent) working in `sylph-product-page`.

## What this repo is

The single marketing surface for Sylph, served at https://sylph-product.com. Since 2026-09-03 it is the design source for the landing page: `application-v2` no longer carries the landing, and there is no sync back. Landing changes are made here and only here.

## Layout

The Next.js app lives in `sylph-product-site/`. Run every package command from inside that directory. The repo root holds `README.md`, this file, `.env.example`, and `docs/`.

```
sylph-product-site/
  src/app/                          file routes (see Routes)
  src/app/hooks/useServerActions.ts demo-form submit hook
  src/components/custom/landing/    the landing at / (2026-10-05 redesign): landing.tsx composes it; bento/ holds the seven feature tiles, app-ui/ the recreated product screens (sample data), iso.ts the "How it works" drawings
  src/components/custom/landing/sub.css  /pricing and /demo on the landing's system (same nav and footer)
  src/components/custom/v2-sides/   the 2026-09-22 "Two sides" parts the /v2 routes still use (nav, sound, sound audition, styles)
  src/components/custom/site/       what remains of the v3 library (sample-data.ts, anchors.ts, fonts.ts, mark.tsx), used by the landing and the /v2 routes
  src/components/custom/sylph-identity/  brand marks, incl. sylph-bird-path.ts (see Invariant)
  src/app/legacy-fonts.ts           Satoshi and IBM Plex Mono, loaded only by /terms through its layout
  public/site/                      film (the launch-film stills the landing uses), characters (the Priya and Dana cast), sound, clip (the social clip), video
  scripts/                          shot.mjs (frame capture), explore-check.mjs (console and overflow check), clip/ (clip renderer)
  next.config.ts                    image formats + the /privacy redirect and the retired-route redirects
  pnpm-workspace.yaml               allowBuilds (see below)
```

## Stack

Next.js 16.1.6, React 19.2.3, Tailwind 4, pnpm 11, node 26. The site uses no motion library (small hooks in `landing/hooks.ts`); `gsap` and `@gsap/react` stay in package.json but nothing imports them since 2026-10-06. Tests run on vitest (`--passWithNoTests`, since no tests exist yet).

## Commands

| Command | What it does |
|---|---|
| `pnpm install --frozen-lockfile` | install; must not change `pnpm-lock.yaml` |
| `pnpm dev` | dev server on :3000 |
| `pnpm build` / `pnpm start` | production build / serve it |
| `pnpm lint` | eslint (eslint-config-next) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | `vitest run --passWithNoTests` |

All four gates (`typecheck`, `lint`, `test`, `build`) must exit 0 before a push.

`pnpm-workspace.yaml` carries `allowBuilds` entries for `sharp` and `unrs-resolver`. pnpm 11 refuses to install a package with a postinstall build script unless a build decision is recorded, and those two (Next image optimisation and the eslint resolver) need theirs. Do not remove the entries; add to them only when pnpm asks.

## Branch model

- `staging` is the working branch. Cut feature work from it and merge back into it.
- `staging` into `main` is the deploy. Vercel builds `main` through its git integration; there is no workflow file in this repo.
- Every other pushed branch gets a Vercel preview URL automatically.
- The landing at `/` is the 2026-10-05 redesign (`docs/plans/2026-10-05-landing-redesign.md`). It replaced Mock B ("Two sides, upgraded", 2026-09-25), which lives in git history.

## Environment variables

Two variables, both `NEXT_PUBLIC_*`, so they bake into the bundle at build time. They are set in the Vercel dashboard; changing one needs a redeploy. Locally, copy `.env.example` at the repo root to `sylph-product-site/.env.local` (gitignored).

| Variable | Used by |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `src/app/page.tsx` metadataBase, canonical link, OG image URLs. Fallback is `https://sylph-product.com`. |
| `NEXT_PUBLIC_EMAIL_API_URL` | `useServerActions.ts`, the demo-form POST target. No fallback; the form fails without it. |

## Routes

| Route | Notes |
|---|---|
| `/` | the landing (`src/app/page.tsx` renders `landing/landing.tsx`: hero, problem, how it works, features bento, try it, questions, close), carries site metadata and JSON-LD |
| `/pricing` | pricing page (the landing's nav, footer and `sub.css`) |
| `/demo` | demo request page: the wired `demo-form.tsx` posts through `useServerActions` to the email worker, or "Or pick a time now" opens Atharva's Calendly (`DEMO`) |
| `/terms` | stub page, stays until a terms document is published |
| `/privacy` | no page; `next.config.ts` issues a 308 to `https://legal.januslabsinc.com/sylph/v1/privacy` |
| `/fresh`, `/fresh/demo`, `/fresh/pricing` | 308 to `/`, `/demo`, `/pricing` (the preview was promoted 2026-09-08) |
| `/api/demo` | stub that returns `{ok:true}`; NOT the real submit path, the form never calls it |
| `/v2`, `/v2/sides`, `/v2/ledger` | 307 to `/` (the V2 exploration; the other directions live in git history) |
| `/v2/sounds` | noindex sound audition: a visitor's pick per slot is remembered and replaces that slot's file in `v2-sides/sound.ts`; the landing has played no sound since the 2026-10-05 redesign |
| `/v2/clip` | noindex composition route the clip renderer (`scripts/clip/`) captures; the clips are in `public/site/clip/` |
| `/mock/*`, `/lab/*`, `/fresh/lab/*`, `/launching-soon` | 307 to `/`: the landing mockups, the 2026-09-22 directions, Ben's v3 lab boards and the pre-launch page are retired and live in git history (the July v5 landing and its `/dev/hero` lab too, removed 2026-09-30). `node scripts/explore-check.mjs <url>` still checks any page for console errors and overflow at 1440, 390 and reduced motion |
| `opengraph-image.jpg`, `twitter-image.jpg` | static social card under `src/app/` (the night-flight hero with the headline, 2026-10-06), with `.alt.txt` files |

## Cross-host link contract

- The only links from this site to the app are `https://app.sylph-product.com/login` (`APP_LOGIN` in `site/anchors.ts`, used by `landing/nav.tsx` and `landing/footer.tsx` on `/`, `/pricing` and `/demo`, and by `v2-sides/nav.tsx` on `/v2/sounds`). The app never links back to this site.
- Legal documents live on `https://legal.januslabsinc.com/sylph/v1/` and are never rendered here. `/privacy` redirects there; `/terms` keeps a stub because no terms document is published yet.

## Demo-lead path

`src/app/demo/demo-form.tsx` calls `src/app/hooks/useServerActions.ts`, which does `axios.post(NEXT_PUBLIC_EMAIL_API_URL, ...)`. That URL is the Cloudflare `email-worker` in `sylph-infra/cloudflare/workers/email-worker/`, which sends through SES to sales. The Worker runs in a different Cloudflare account and is never changed from this repo; if lead delivery breaks, look there.

## Invariant

`src/components/custom/sylph-identity/sylph-bird-path.ts` must stay byte-identical to application-v2's copy. It is the one shared brand asset; change it in both repos in the same session or not at all.

## Conventions

- File names are kebab-case, matching the existing files. Components are PascalCase. Import with the `@/*` alias.
- Commit messages: `{Action}: {Description}`, e.g. `Added:`, `Fixed:`, `Removed:`.
- No em dashes anywhere, in copy or in docs. Use commas, colons, or full stops.
- Never edit `demo-form.tsx` as part of a landing sync; it is the wired form and differs from any upstream copy by design.

## Non-goals (for now)

- No SEO files (`robots.ts`, `sitemap.ts`, per-route metadata).
- No analytics beyond Vercel Web Analytics (`<Analytics />` in the root layout, PR #7).
- No legal-document rendering; the legal host owns that.
