/* Every page /mock routes between: the live landing first, then the mockups in the order they were made.
   Each mockup is a noindex route at /mock/<id>, and its code lives in components/custom/mock/<id lowercased>. */
export type Mock = {
  id: "live" | "A" | "B" | "C" | "D";
  href: string;
  name: string;
  kind: "Live" | "Upgrade" | "New direction";
  line: string;
};

export const MOCKS: Mock[] = [
  {
    id: "live",
    href: "/",
    name: "Two sides, upgraded",
    kind: "Live",
    line: "The page at sylph-product.com today: Mock B, promoted on Sep 25. Priya spends it, Dana closes the books, the bird carries one charge between them.",
  },
  {
    id: "A",
    href: "/mock/A",
    name: "Hours",
    kind: "New direction",
    line: "The page keeps the story's clock: dusk in Denver, the rule, night, a weekend time-lapse and a month torn off, with the charge carried the whole way by the bird.",
  },
  {
    id: "B",
    href: "/mock/B",
    name: "Two sides, upgraded",
    kind: "Upgrade",
    line: "The Sep 22 page, kept and refined: tighter handoffs instead of empty seams, a courier you can see, and each chapter composed and coloured on its own terms. Now live at /.",
  },
  {
    id: "C",
    href: "/mock/C",
    name: "Departures",
    kind: "New direction",
    line: "Travel and expense told the way a trip is: a departures board, a boarding pass, stamps and a folio, flights and receipts on one itinerary.",
  },
  {
    id: "D",
    href: "/mock/D",
    name: "The month, sorted",
    kind: "New direction",
    line: "A month of 98 charges as a physical pile of slips that sorts itself as you scroll, until the handful a person has to see is left, each with its rule.",
  },
];
