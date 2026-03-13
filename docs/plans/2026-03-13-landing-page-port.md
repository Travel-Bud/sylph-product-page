# Landing Page Port from application-v2

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace sylph-product-page landing with the current application-v2 landing page.

**Architecture:** Full file port from app → product page. Strip auth provider imports (3 components reference useAuthContext). Keep product page's Next.js 16 + standalone layout. No providers needed.

**Tech Stack:** Next.js 16, React 19, Tailwind 4, Framer Motion 12, Lucide React

---

### Task 1: Clear old product page components

**Files:**
- Delete: `sylph-product-site/src/components/custom/landing/*` (all 12 files)
- Delete: `sylph-product-site/src/components/custom/sylph-identity/*` (all 5 files)
- Delete: `sylph-product-site/src/components/ui/*` (all 5 files)

**Step 1:** Remove all existing component files
```bash
rm -rf sylph-product-site/src/components/
```

**Step 2:** Recreate directory structure
```bash
mkdir -p sylph-product-site/src/components/custom/landing
mkdir -p sylph-product-site/src/components/custom/sylph-identity
mkdir -p sylph-product-site/src/components/ui
```

---

### Task 2: Copy landing components from app

**Source:** `/Users/benfaib/Sylph/application-v2/sylph-app/src/components/custom/landing/`
**Target:** `sylph-product-site/src/components/custom/landing/`

**Copy all 18 files:**
- index.ts
- landing-nav.tsx
- hero-section.tsx
- animated-hero-dashboard.tsx
- how-it-works.tsx
- comparison-section.tsx
- workflow-card.tsx
- workflow-visuals.tsx
- traction-marquee.tsx
- feature-grid.tsx
- sticky-product-reveal.tsx
- feature-visuals.tsx
- feature-showcase.tsx
- product-showcase.tsx
- system-overview.tsx
- cta-section.tsx
- landing-footer.tsx
- testimonials-section.tsx (if exists)

---

### Task 3: Copy identity components (only landing dependencies)

**Source:** `/Users/benfaib/Sylph/application-v2/sylph-app/src/components/custom/sylph-identity/`
**Target:** `sylph-product-site/src/components/custom/sylph-identity/`

**Copy these 4 files:**
- `sylph-bird-path.ts` (used by landing-nav, system-overview, feature-showcase, landing-footer)
- `cinematic-flow-lines.tsx` (used by hero-section, feature-showcase, traction-marquee)
- `bento-grid.tsx` (used by feature-grid)
- `simplex-noise.ts` (used by cinematic-flow-lines)

**Create minimal barrel:** `index.ts` exporting only these components.

---

### Task 4: Copy UI components (only landing dependencies)

**Source:** `/Users/benfaib/Sylph/application-v2/sylph-app/src/components/ui/`
**Target:** `sylph-product-site/src/components/ui/`

**Copy these 10 files:**
- `animated-grid-pattern.tsx` (hero-section, feature-grid)
- `shimmer-button.tsx` (hero-section, cta-section)
- `lamp.tsx` (hero-section)
- `border-beam.tsx` (sticky-product-reveal, workflow-card, product-showcase)
- `dot-pattern.tsx` (sticky-product-reveal, cta-section, landing-footer)
- `particles.tsx` (comparison-section, cta-section)
- `marquee.tsx` (traction-marquee)
- `card-spotlight.tsx` (workflow-card)
- `number-ticker.tsx` (workflow-visuals)

---

### Task 5: Copy lib files

**Source:** `/Users/benfaib/Sylph/application-v2/sylph-app/src/lib/`
**Target:** `sylph-product-site/src/lib/`

**Copy:**
- `animations.ts`
- `utils.ts` (strip non-landing exports like HOTEL_TYPE_LABELS, formatRating — or just keep them, they're harmless)

---

### Task 6: Update core app files

**Files:**
- Replace: `sylph-product-site/src/app/page.tsx` with app's version (identical — already matches)
- Replace: `sylph-product-site/src/app/globals.css` with app's version (may have new CSS vars)
- Update: `sylph-product-site/src/app/layout.tsx` — keep product page's clean layout (no providers), but ensure globals.css content matches

---

### Task 7: Strip auth provider imports

3 landing components import `useAuthContext` from `@/providers/AuthProvider`:
- `landing-nav.tsx` — shows "Dashboard" if logged in, "Sign in" if not
- `hero-section.tsx` — shows "Dashboard" if logged in
- `cta-section.tsx` — shows "Dashboard" if logged in

**Action:** Remove `useAuthContext` imports and hardcode to unauthenticated state (always show "Get Started" / "Sign in" CTAs). This is the product/marketing page — visitors aren't logged in.

---

### Task 8: Copy public assets

Check if any new assets are needed in `public/`. The app and product page should have the same logos/images. Verify and copy any missing files.

---

### Task 9: Sync dependencies and build

**Check package.json** for any missing deps. Known potential additions:
- Particles component may need a peer dep

**Step 1:** `pnpm install`
**Step 2:** `pnpm build`
**Step 3:** Fix any TypeScript/import errors
**Step 4:** `pnpm dev` and verify

---

### Task 10: Commit

```bash
git add -A
git commit -m "Replaced: Port landing page from application-v2"
```
