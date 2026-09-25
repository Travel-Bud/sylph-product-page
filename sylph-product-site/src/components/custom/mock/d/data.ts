/*
 * Mock D, "The month, sorted": everything the page says about the month is derived here from the live
 * page's sample month (v2-sides/month-data.ts) run through the live page's own rule check. Nothing is
 * typed in by hand: every count, name and amount on the page comes out of these functions.
 * Sample data only (see month-data.ts).
 */
import { MONTH, PEOPLE, type MonthCharge } from "@/components/custom/v2-sides/month-data";

export { MONTH, PEOPLE };
export type { MonthCharge };

export type Verdict = "ok" | "note" | "block";

/* ---------- the check: copied verbatim from v2-sides/your-month.tsx (runRules is not exported there).
   Same default rules, same arithmetic, so this page and the live page agree on every verdict. ---------- */

type RuleKey = "dinner" | "hotel" | "alcohol" | "receipt" | "dupes";
type RuleState = Record<RuleKey, { on: boolean; v: number }>;

export const DEFAULT_RULES: RuleState = {
  dinner: { on: true, v: 75 },
  hotel: { on: true, v: 350 },
  alcohol: { on: true, v: 0 },
  receipt: { on: true, v: 75 },
  dupes: { on: true, v: 0 },
};

export type Check = { v: Verdict; cite: string; codes: string[] };

export const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dayNum = (iso: string) => Math.round(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / 864e5);
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const shortDate = (iso: string) => `${MON[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}`;

function runRules(rows: MonthCharge[], rs: RuleState): Record<string, Check> {
  // duplicates: the later of two charges by the same person for the same amount, within the window
  const dupOf = new Map<string, MonthCharge>();
  if (rs.dupes.on) {
    const groups = new Map<string, MonthCharge[]>();
    for (const r of rows) {
      const k = `${r.who}|${r.amount.toFixed(2)}`;
      const g = groups.get(k);
      if (g) g.push(r);
      else groups.set(k, [r]);
    }
    for (const g of groups.values()) {
      g.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
      for (let i = 1; i < g.length; i++) if (dayNum(g[i].date) - dayNum(g[i - 1].date) <= rs.dupes.v) dupOf.set(g[i].id, g[i - 1]);
    }
  }

  const out: Record<string, Check> = {};
  for (const r of rows) {
    const fired: { v: Verdict; code: string; cite: string }[] = [];
    const guests = r.guests ?? 1;
    const nights = r.nights ?? 1;
    const perHead = r.amount / guests;
    const perNight = r.amount / nights;

    if (rs.alcohol.on && r.alcohol) fired.push({ v: "block", code: "M-022", cite: `M-022, alcohol, ${money(r.amount)} kept off the total` });
    const d = dupOf.get(r.id);
    if (d) {
      const same = d.date === r.date;
      fired.push({
        v: "note",
        code: "D-001",
        cite: same ? `D-001, same amount and day as ${d.merchant}` : `D-001, same amount as ${d.merchant} on ${shortDate(d.date)}`,
      });
    }
    if (rs.hotel.on && r.category === "Lodging" && perNight > rs.hotel.v) {
      const over = money(perNight - rs.hotel.v);
      fired.push({
        v: "note",
        code: "L-007",
        cite:
          nights > 1
            ? `L-007, ${money(perNight)} a night for ${nights} nights, ${over} over the $${rs.hotel.v} nightly cap`
            : `L-007, ${over} over the $${rs.hotel.v} nightly cap`,
      });
    }
    if (rs.dinner.on && r.meal === "dinner" && perHead > rs.dinner.v) {
      const over = money(perHead - rs.dinner.v);
      fired.push({
        v: "note",
        code: "M-041",
        cite:
          guests > 1
            ? `M-041, ${money(perHead)} a head for ${guests}, ${over} over the $${rs.dinner.v} dinner cap`
            : `M-041, ${over} over the $${rs.dinner.v} dinner cap`,
      });
    }
    if (rs.receipt.on && !r.receipt && r.amount > rs.receipt.v) {
      fired.push({
        v: "note",
        code: "R-003",
        cite: `R-003, no receipt on ${money(r.amount)}, required ${rs.receipt.v === 0 ? "on every charge" : `over $${rs.receipt.v}`}`,
      });
    }

    const codes = fired.map((f) => f.code);
    if (fired.length) {
      const top = fired.find((f) => f.v === "block") ?? fired[0];
      const more = fired.length - 1;
      out[r.id] = { v: top.v, codes, cite: more ? `${top.cite}, and ${more} more rule${more > 1 ? "s" : ""}` : top.cite };
      continue;
    }
    let cite = r.receipt ? "No rule fired, receipt matched" : "No rule fired";
    if (rs.dinner.on && r.meal === "dinner") cite = `M-041, ${money(perHead)}${guests > 1 ? " a head" : ""}, under the $${rs.dinner.v} dinner cap`;
    else if (rs.hotel.on && r.category === "Lodging") cite = `L-007, ${money(perNight)} a night, under the $${rs.hotel.v} cap`;
    else if (rs.receipt.on && !r.receipt) cite = `R-003, ${money(r.amount)}, no receipt needed under $${rs.receipt.v}`;
    out[r.id] = { v: "ok", cite, codes };
  }
  return out;
}

/* ---------- the month, checked ---------- */

export const CHECK = runRules(MONTH, DEFAULT_RULES);
export const EXCEPTIONS = MONTH.filter((r) => CHECK[r.id].v !== "ok");
export const CLEARED = MONTH.filter((r) => CHECK[r.id].v === "ok");
export const CLEARED_TOTAL = CLEARED.reduce((a, r) => a + r.amount, 0);
export const WITH_RECEIPT = MONTH.filter((r) => r.receipt);
export const NO_RECEIPT = MONTH.filter((r) => !r.receipt);
export const FOREIGN = MONTH.filter((r) => r.fx);

/* The sorting beats, in scroll order. The page's sections and the pile's layouts both key off these. */
export const BEAT = { pile: 0, arrive: 1, convert: 2, dupes: 3, dinner: 4, hotel: 5, alcohol: 6, receipt: 7, file: 8 } as const;
export const BEATS = 9;

export type RuleBeat = {
  beat: number;
  code: string;
  name: string;
  /** the rule as its line is labelled in the pile */
  line: string;
  /** the threshold alone, for the copy */
  pill: string;
  /** threshold on the ruler's scale (null: no scale, the rule is yes or no) */
  at: number | null;
  domain: [number, number];
  unit: string;
  applies: (r: MonthCharge) => boolean;
  value: (r: MonthCharge) => number;
};

export const RULE_BEATS: RuleBeat[] = [
  {
    beat: BEAT.dinner,
    code: "M-041",
    name: "Dinner cap",
    line: `Dinner $${DEFAULT_RULES.dinner.v} a head`,
    pill: `$${DEFAULT_RULES.dinner.v} a head`,
    at: DEFAULT_RULES.dinner.v,
    domain: [0, 140],
    unit: "a head",
    applies: (r) => r.meal === "dinner",
    value: (r) => r.amount / (r.guests ?? 1),
  },
  {
    beat: BEAT.hotel,
    code: "L-007",
    name: "Hotel, nightly",
    line: `Hotel $${DEFAULT_RULES.hotel.v} a night`,
    pill: `$${DEFAULT_RULES.hotel.v} a night`,
    at: DEFAULT_RULES.hotel.v,
    domain: [220, 410],
    unit: "a night",
    applies: (r) => r.category === "Lodging",
    value: (r) => r.amount / (r.nights ?? 1),
  },
  {
    beat: BEAT.alcohol,
    code: "M-022",
    name: "No alcohol",
    line: "No alcohol",
    pill: "",
    at: null,
    domain: [0, 60],
    unit: "",
    applies: (r) => !!r.alcohol,
    value: (r) => r.amount,
  },
  {
    beat: BEAT.receipt,
    code: "R-003",
    name: "Receipt required",
    line: `Receipt over $${DEFAULT_RULES.receipt.v}`,
    pill: `over $${DEFAULT_RULES.receipt.v}`,
    at: DEFAULT_RULES.receipt.v,
    domain: [0, 180],
    unit: "",
    applies: (r) => !r.receipt,
    value: (r) => r.amount,
  },
];

const CODE_BEAT: Record<string, number> = { "D-001": BEAT.dupes, "M-041": BEAT.dinner, "L-007": BEAT.hotel, "M-022": BEAT.alcohol, "R-003": BEAT.receipt };

/** the beat at which a charge is flagged (Infinity when it clears) */
export const flagBeat = (r: MonthCharge) => Math.min(Infinity, ...CHECK[r.id].codes.map((c) => CODE_BEAT[c] ?? Infinity));

/** same-day duplicate pairs, as the check found them: [first, second (flagged)] */
export const DUPES: [MonthCharge, MonthCharge][] = MONTH.filter((r) => CHECK[r.id].codes.includes("D-001")).map((d) => {
  const first = MONTH.find((o) => o.id !== d.id && o.who === d.who && o.amount.toFixed(2) === d.amount.toFixed(2) && o.id < d.id && dayNum(d.date) - dayNum(o.date) <= DEFAULT_RULES.dupes.v);
  return [first ?? d, d];
});

export const ruleRows = (rb: RuleBeat) => MONTH.filter(rb.applies);
export const ruleFlagged = (rb: RuleBeat) => MONTH.filter((r) => CHECK[r.id].codes.includes(rb.code));

/* ---------- people ---------- */

export const PERSON_INK: Record<string, string> = {
  priya: "#2f5fa8",
  theo: "#c9531c",
  mara: "#b8336f",
  jonah: "#16796b",
  ines: "#946312",
  sam: "#4d7d22",
};

export const personName = (id: string) => PEOPLE.find((p) => p.id === id)?.name ?? id;
export const byPerson = (id: string) => MONTH.filter((r) => r.who === id);

const FX_SIGN: Record<string, string> = { GBP: "£", EUR: "€", JPY: "¥", CAD: "C$" };
export const fxAmount = (r: MonthCharge) =>
  r.fx ? `${FX_SIGN[r.fx.code]}${r.fx.amount.toLocaleString("en-US", { minimumFractionDigits: r.fx.code === "JPY" ? 0 : 2, maximumFractionDigits: r.fx.code === "JPY" ? 0 : 2 })}` : money(r.amount);
export const fxRate = (r: MonthCharge) => (r.fx ? `${FX_SIGN[r.fx.code]}1 = $${r.fx.rate}` : "");

/** "a, b and c" */
export const andList = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

const NUM = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen"];
export const say = (n: number) => NUM[n] ?? String(n);
