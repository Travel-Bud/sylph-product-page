/* One vocabulary: the nav, the footer and the section ids agree. Plain module
   (no "use client") so server components can read the array too. Promoted from
   the /fresh preview to the root on 2026-09-08. */
export const HOME = "/";
export const DEMO = "/demo";
export const PRICING = "/pricing";
/* The one cross-host link: the app lives on its own host (repo CLAUDE.md, cross-host link contract). */
export const APP_LOGIN = "https://app.sylph-product.com/login";
export const SITE_ANCHORS = [
  { href: "/#product", label: "Product" },
  { href: "/#start", label: "Policy" },
  { href: "/#next", label: "In build" },
];
