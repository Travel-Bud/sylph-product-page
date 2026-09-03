# sylph-product-page

The marketing site for Sylph, served at https://sylph-product.com. Since 2026-09-03 this repo is the design source for the landing page; `application-v2` no longer carries it.

## Layout

The Next.js app lives in `sylph-product-site/`. The repo root holds only this README, `CLAUDE.md`, `.env.example`, and `docs/`.

## Install and run

Requires node 26 and pnpm 11.

```sh
cd sylph-product-site
cp ../.env.example .env.local   # then fill in NEXT_PUBLIC_EMAIL_API_URL
pnpm install --frozen-lockfile
pnpm dev                        # http://localhost:3000
```

Gates before pushing: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`.

## Deploy

`staging` is the working branch. Merging `staging` into `main` is the deploy: Vercel builds `main` through its git integration (no workflow file in this repo). Every other pushed branch gets a Vercel preview URL. Environment variables are set in the Vercel dashboard; they are `NEXT_PUBLIC_*`, so a change needs a redeploy.

## More

Read `CLAUDE.md` for the full orientation: stack, routes, the cross-host link contract, the demo-lead path, and conventions.
