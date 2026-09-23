/* The directions of the 2026-09-22 explore run, in the order the index lists them. `kind` is the brief's
   split: a departure changes the structure, point of view, medium or story; a push takes the current
   Two sides page somewhere it has not been. */
export type Direction = {
  slug: string;
  name: string;
  kind: "Departure" | "Two sides, pushed";
  line: string;
};

export const DIRECTIONS: Direction[] = [
  {
    slug: "receipt",
    name: "The receipt",
    kind: "Departure",
    line: "The page is the Sushi Kanda receipt, printing its own month under a print head as you scroll.",
  },
  {
    slug: "compiler",
    name: "Compiled",
    kind: "Departure",
    line: "The page is a policy editor: drag the dinner cap and a sample week recompiles, re-verdicts and cites its line.",
  },
  {
    slug: "pile",
    name: "The pile",
    kind: "Departure",
    line: "A 98-charge sample month piled on the first screen, sorted by scroll down to the 14 a person has to see.",
  },
  {
    slug: "janus",
    name: "Two faces",
    kind: "Two sides, pushed",
    line: "Split down the middle the whole way: Priya's light half and Dana's dark half slide against each other and meet at month end.",
  },
  {
    slug: "comic",
    name: "Drawn",
    kind: "Two sides, pushed",
    line: "Priya and Dana as the leads of a nine-panel graphic novel, from a late dinner in Denver to a report already there.",
  },
  {
    slug: "drop",
    name: "Same path",
    kind: "Two sides, pushed",
    line: "A playable rules board: drop Priya's receipts through six gates, and a charge dropped again takes the same path.",
  },
];
