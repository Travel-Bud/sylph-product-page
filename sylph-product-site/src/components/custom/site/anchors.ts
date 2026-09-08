/* One vocabulary: the nav, the footer and the section ids agree. Plain module
   (no "use client") so server components can read the array too. The new
   marketing surface previews at /fresh; every internal link stays inside it. */
export const HOME = "/fresh";
/* The one cross-host link: the app lives on its own host (repo CLAUDE.md, cross-host link contract). */
export const APP_LOGIN = "https://app.sylph-product.com/login";
export const SITE_ANCHORS = [
  { href: `${HOME}#product`, label: "Product" },
  { href: `${HOME}#start`, label: "Policy" },
  { href: `${HOME}#next`, label: "In build" },
];
