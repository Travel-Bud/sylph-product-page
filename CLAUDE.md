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
  src/components/custom/mock/b/     the landing at /, "Two sides, upgraded" (Mock B, promoted 2026-09-25): landing.tsx composes it, rendered by / and /mock/B
  src/components/custom/v2-sides/   the 2026-09-22 "Two sides" parts the landing still reuses (hero, cast, your-month, sound, scroll, closing) and Mock A builds on
  src/components/custom/site/       the v3 panel library (site.css, sample-data.ts, anchors.ts); its panels are reused inside the landing's tiles
  src/components/custom/mock/       the /mock landing mockups, one folder each (a, b, c, d) plus shared/ (the list and the switcher bar)
  src/app/legacy-fonts.ts           Satoshi and IBM Plex Mono, loaded only by /launching-soon, /terms and /dev through their layouts
  public/site/characters/           the Priya and Dana cast (matte clay renders, transparent WebP)
  src/components/custom/landing/    the July v5 landing, now only behind /launching-soon and the /dev/hero lab
  src/components/custom/sylph-identity/  brand marks, incl. sylph-bird-path.ts (see Invariant)
  public/landing/                   landing images and video
  next.config.ts                    image formats + the /privacy and /fresh redirects
  pnpm-workspace.yaml               allowBuilds (see below)
```

## Stack

Next.js 16.1.6, React 19.2.3, Tailwind 4, pnpm 11, node 26. Motion and 3D: framer-motion, gsap + @gsap/react, lenis (smooth scroll), three + @react-three/fiber, leva (dev tweak panel). Tests run on vitest.

## Commands

| Command | What it does |
|---|---|
| `pnpm install --frozen-lockfile` | install; must not change `pnpm-lock.yaml` |
| `pnpm dev` | dev server on :3000 |
| `pnpm build` / `pnpm start` | production build / serve it |
| `pnpm lint` | eslint (eslint-config-next) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | `vitest run` |

All four gates (`typecheck`, `lint`, `test`, `build`) must exit 0 before a push.

`pnpm-workspace.yaml` carries `allowBuilds` entries for `sharp` and `unrs-resolver`. pnpm 11 refuses to install a package with a postinstall build script unless a build decision is recorded, and those two (Next image optimisation and the eslint resolver) need theirs. Do not remove the entries; add to them only when pnpm asks.

## Branch model

- `staging` is the working branch. Cut feature work from it and merge back into it.
- `staging` into `main` is the deploy. Vercel builds `main` through its git integration; there is no workflow file in this repo.
- Every other pushed branch gets a Vercel preview URL automatically.
- The "Two sides" landing replaced Ben's v3 at `/` (2026-09-22, V2 exploration; plan and evidence under `docs/plans/2026-09-22-landing-v2*`), and Mock B, its upgrade, replaced it on 2026-09-25 (`docs/plans/2026-09-25-mock-b/NOTES.md`).

## Environment variables

Two variables, both `NEXT_PUBLIC_*`, so they bake into the bundle at build time. They are set in the Vercel dashboard; changing one needs a redeploy. Locally, copy `.env.example` at the repo root to `sylph-product-site/.env.local` (gitignored).

| Variable | Used by |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `src/app/page.tsx` metadataBase, canonical link, OG image URLs. Fallback is `https://sylph-product.com`. |
| `NEXT_PUBLIC_EMAIL_API_URL` | `useServerActions.ts`, the demo-form POST target. No fallback; the form fails without it. |

## Routes

| Route | Notes |
|---|---|
| `/` | the landing (`src/app/page.tsx` renders `mock/b/landing.tsx`, "Two sides, upgraded": Priya spends, Dana closes the books), carries site metadata and JSON-LD |
| `/pricing` | pricing page |
| `/demo` | demo request page; `demo-form.tsx` posts through `useServerActions` to the email worker |
| `/terms` | stub page, stays until a terms document is published |
| `/privacy` | no page; `next.config.ts` issues a 308 to `https://legal.januslabsinc.com/sylph/v1/privacy` |
| `/launching-soon` | leftover pre-launch page, still served |
| `/fresh`, `/fresh/demo`, `/fresh/pricing` | 308 to `/`, `/demo`, `/pricing` (the preview was promoted 2026-09-08); `/fresh/lab/*` are Ben's design boards |
| `/dev/hero` | hero lab, 404s in production unless `NEXT_PUBLIC_ENABLE_HERO_LAB=1` |
| `/api/demo` | stub that returns `{ok:true}`; NOT the real submit path, the form never calls it |
| `/v2`, `/v2/sides`, `/v2/ledger` | 307 to `/` (the V2 exploration; the other directions live in git history) |
| `/v2/clip` | noindex composition route the clip renderer (`scripts/clip/`) captures; the clips are in `public/site/clip/` |
| `/mock`, `/mock/A` to `/mock/D` | noindex, unlinked: the router between the live page and the landing mockups (A Hours, B Two sides upgraded, C Departures, D The month sorted; list in `mock/shared/mocks.ts`); every mockup carries the switcher bar; notes per mockup in `docs/plans/2026-09-25-*`; `node scripts/explore-check.mjs <url>` checks console and overflow at 1440, 390 and reduced motion |
| `/lab`, `/lab/*` | 307 to `/mock`: the 2026-09-22 directions were retired 2026-09-25 and live in git history (`a4a93f3`) |
| `opengraph-image.jpg`, `twitter-image.jpg` | static social card under `src/app/` (the clip's poster), with `.alt.txt` files |

## Cross-host link contract

- The only links from this site to the app are `https://app.sylph-product.com/login` (`APP_LOGIN` in `site/anchors.ts`, used by the landing's `mock/b/nav.tsx` and footer (`v2-sides/closing.tsx`), the 2026-09-22 `v2-sides/nav.tsx`, and the v3 `site/nav.tsx` and `footer.tsx`; the v5 `landing-nav.tsx` and `landing-footer.tsx` carry the same URL). The app never links back to this site.
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
