/* One vocabulary: the nav, the footer and the section ids agree. Plain module
   (no "use client") so server components can read the array too. The new
   marketing surface previews at /fresh; every internal link stays inside it. */
export const HOME = "/fresh";
export const SITE_ANCHORS = [
  { href: `${HOME}#product`, label: "Product" },
  { href: `${HOME}#next`, label: "In build" },
];
