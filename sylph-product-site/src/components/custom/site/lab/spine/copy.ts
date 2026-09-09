/* One sentence of sample policy, the rule it compiles to, and one sample
   charge it decides. Numbers reconcile: $84.20 for one traveler is $9.20
   over the $75.00 per person dinner cap. */

export const POLICY_SENTENCE =
  "Dinner is capped at $75 a person. Anything over that needs a note from the traveler.";

export const RULE_ID = "M-041";

export const RULE_ROWS: ReadonlyArray<{ term: string; value: string; hit?: boolean }> = [
  { term: "Condition", value: "category is Meals and meal is Dinner" },
  { term: "Threshold", value: "amount per person over $75.00", hit: true },
  { term: "Action", value: "Needs a note", hit: true },
];

export const CHARGE = {
  merchant: "Sushi Kanda",
  date: "Tue 14 Apr",
  meta: "Dinner, 1 traveler",
  amount: "$84.20",
  verdict: "Needs a note",
  cite: `${RULE_ID}, $9.20 over the $75.00 dinner cap`,
} as const;
