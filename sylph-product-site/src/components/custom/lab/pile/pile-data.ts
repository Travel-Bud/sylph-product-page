/*
 * The pile: every charge of the sample month (v2-sides/month-data.ts) as one mark, with what the story
 * reveals about it step by step: the receipt and how it came in, the amount in dollars, the look-alikes,
 * the verdict and its citation.
 *
 * The check is a small deterministic function over the sample month at the default rules of
 * v2-sides/your-month.tsx (dinner $75 a head, hotel $350 a night, no alcohol, receipt over $75,
 * duplicates same day), plus the ENGINE_ROWS verdicts for any charge the two share (the Avis rental,
 * G-009). Cleared charges cite the category rule codes ENGINE_ROWS uses. Receipt channels are assigned
 * by a plain rule below (confirmations, folios and invoices arrive by email, paper on the road is
 * texted, the office uploads). Sample data only; every count on the page is a count of these marks.
 */
import { MONTH, PEOPLE, type MonthCat, type MonthCharge } from "@/components/custom/v2-sides/month-data";
import { ENGINE_ROWS, QBO_LIVE, VERDICT_LABEL, type Verdict } from "@/components/custom/site/sample-data";

export { QBO_LIVE, VERDICT_LABEL };
export type { Verdict };

export type Channel = "text" | "email" | "upload";
export type Cur = "USD" | "GBP" | "EUR" | "JPY" | "CAD";
export type Row = "dinner" | "hotel" | "receipt" | "dupes" | "alcohol" | "other";

export interface PileMark {
  n: number;
  id: string;
  date: string;
  day: number;
  who: string;
  name: string;
  merchant: string;
  category: MonthCat;
  detail: string;
  usd: number;
  cur: Cur;
  printed: number;
  rate: number;
  receipt: boolean;
  channel: Channel | null;
  verdict: Verdict;
  code: string;
  cite: string;
  /** the short reason a chart label gives, exceptions only */
  why: string;
  row: Row;
  rowValue: number;
  /** flagged under D-001: the earlier charge of the pair */
  dupOf: number | null;
  /** same person and amount on another day, so it passes: the earlier one */
  lookalike: number | null;
}

export const CAPS = { dinner: 75, hotel: 350, receipt: 75 };

/* ---------- formatting (fixed symbols, so server and browser print the same) ---------- */

const SYM: Record<Cur, string> = { USD: "$", GBP: "£", EUR: "€", JPY: "¥", CAD: "CA$" };
const group = (n: number, dp: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });

export const usd = (n: number) => `$${group(n, 2)}`;
export const usd0 = (n: number) => `$${group(Math.round(n), 0)}`;
export const printedOf = (m: Pick<PileMark, "cur" | "printed">) =>
  `${SYM[m.cur]}${group(m.printed, m.cur === "JPY" ? 0 : 2)}`;

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const shortDate = (iso: string) => `${MON[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}`;
const dayNum = (iso: string) => Math.round(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / 864e5);

export const CUR_NAME: Record<Cur, string> = {
  USD: "US dollars",
  GBP: "Pounds",
  EUR: "Euros",
  JPY: "Yen",
  CAD: "Canadian dollars",
};

/* ---------- receipts: how each one came in ---------- */

function channelOf(c: MonthCharge): Channel {
  if (c.category === "Airfare" || c.category === "Lodging" || c.category === "Software") return "email";
  if (c.category === "Office") return "upload";
  if (c.category === "Ground") return /uber|lyft|avis|parkwhiz|spothero|divvy/i.test(c.merchant) ? "email" : "text";
  if (c.category === "Rail") return c.fx ? "text" : "email";
  /* meals: paper on the road is texted; a lunch or coffee at home gets uploaded later */
  return c.fx || c.meal === "dinner" || c.alcohol ? "text" : "upload";
}

/* ---------- the rule codes cleared charges cite (as ENGINE_ROWS cites them) ---------- */

function categoryCode(c: MonthCharge): string {
  switch (c.category) {
    case "Airfare":
      return "T-004";
    case "Rail":
      return "T-011";
    case "Ground":
      return "G-002";
    case "Office":
      return "O-001";
    case "Lodging":
      return "L-007";
    case "Software":
      return "S-003";
    default:
      return c.meal === "coffee" ? "M-010" : c.meal === "dinner" ? "M-041" : "M-012";
  }
}

function detailOf(c: MonthCharge): string {
  if (c.alcohol) return "bar tab";
  if (c.meal) return c.guests && c.guests > 1 ? `${c.meal} for ${c.guests}` : c.meal;
  if (c.nights) return c.nights > 1 ? `${c.nights} nights` : "1 night";
  return c.category.toLowerCase();
}

/* ---------- build ---------- */

const rows = MONTH;
const indexOf = new Map(rows.map((r, i) => [r.id, i]));

/* same person and amount: same day is a duplicate (D-001), another day is a look-alike that passes */
const dupOf = new Map<number, number>();
const lookalikeOf = new Map<number, number>();
{
  const groups = new Map<string, MonthCharge[]>();
  for (const r of rows) {
    const k = `${r.who}|${r.amount.toFixed(2)}`;
    const g = groups.get(k);
    if (g) g.push(r);
    else groups.set(k, [r]);
  }
  for (const g of groups.values()) {
    for (let i = 1; i < g.length; i++) {
      const a = indexOf.get(g[i - 1].id)!;
      const b = indexOf.get(g[i].id)!;
      if (dayNum(g[i].date) === dayNum(g[i - 1].date)) dupOf.set(b, a);
      else lookalikeOf.set(b, a);
    }
  }
}
const inDupPair = new Set<number>([...dupOf.keys(), ...dupOf.values()]);

const engineException = (c: MonthCharge) =>
  ENGINE_ROWS.find((e) => e.verdict !== "ok" && e.merchant === c.merchant && e.amount === usd(c.amount));

export const MARKS: PileMark[] = rows.map((c, n) => {
  const guests = c.guests ?? 1;
  const nights = c.nights ?? 1;
  const perHead = c.amount / guests;
  const perNight = c.amount / nights;
  const cur: Cur = c.fx?.code ?? "USD";

  let verdict: Verdict = "ok";
  let code = categoryCode(c);
  let cite = `${code}, in policy`;
  let why = "";

  const d = dupOf.get(n);
  if (c.alcohol) {
    verdict = "block";
    code = "M-022";
    cite = `M-022, alcohol, ${usd(c.amount)} kept off the total`;
    why = `${usd(c.amount)} kept off`;
  } else if (d !== undefined) {
    verdict = "note";
    code = "D-001";
    const same = rows[d].merchant === c.merchant;
    cite = same ? `D-001, second ${c.merchant} charge, same amount and day` : `D-001, same amount and day as ${rows[d].merchant}`;
    why = same ? "second charge, same day" : `same day as ${rows[d].merchant}`;
  } else if (c.category === "Lodging" && perNight > CAPS.hotel) {
    verdict = "note";
    code = "L-007";
    const over = usd(perNight - CAPS.hotel);
    cite = nights > 1 ? `L-007, ${usd(perNight)} a night, ${over} over the $350 cap` : `L-007, ${over} over the $350 nightly cap`;
    why = `${over} over a night`;
  } else if (c.meal === "dinner" && perHead > CAPS.dinner) {
    verdict = "note";
    code = "M-041";
    const over = usd(perHead - CAPS.dinner);
    cite = guests > 1 ? `M-041, ${usd(perHead)} a head, ${over} over the $75 cap` : `M-041, ${over} over the $75 dinner cap`;
    why = guests > 1 ? `${over} over a head` : `${over} over`;
  } else if (!c.receipt && c.amount > CAPS.receipt) {
    verdict = "note";
    code = "R-003";
    cite = `R-003, no receipt on ${usd(c.amount)}, required over $75`;
    why = `no receipt, ${usd(c.amount)}`;
  } else {
    const e = engineException(c);
    if (e) {
      verdict = e.verdict;
      code = e.cite.slice(0, 5);
      cite = e.cite;
      why = e.cite.slice(7);
    } else if (c.meal === "dinner") {
      cite = `M-041, ${usd(perHead)}${guests > 1 ? " a head" : ""}, under the $75 dinner cap`;
    } else if (c.category === "Lodging") {
      cite = `L-007, ${usd(perNight)} a night, under the $350 cap`;
    } else if (!c.receipt) {
      code = "R-003";
      cite = `R-003, ${usd(c.amount)}, no receipt needed under $75`;
    } else if (c.fx) {
      cite = `${code}, in policy, ${printedOf({ cur, printed: c.fx.amount })} normalized`;
    }
  }

  const row: Row = c.alcohol
    ? "alcohol"
    : c.meal === "dinner"
      ? "dinner"
      : c.category === "Lodging"
        ? "hotel"
        : inDupPair.has(n)
          ? "dupes"
          : !c.receipt
            ? "receipt"
            : "other";
  const rowValue = row === "dinner" ? perHead : row === "hotel" ? perNight : c.amount;

  return {
    n,
    id: c.id,
    date: c.date,
    day: +c.date.slice(8, 10),
    who: c.who,
    name: PEOPLE.find((p) => p.id === c.who)?.name ?? c.who,
    merchant: c.merchant,
    category: c.category,
    detail: detailOf(c),
    usd: c.amount,
    cur,
    printed: c.fx?.amount ?? c.amount,
    rate: c.fx?.rate ?? 1,
    receipt: c.receipt,
    channel: c.receipt ? channelOf(c) : null,
    verdict,
    code,
    cite,
    why,
    row,
    rowValue,
    dupOf: d ?? null,
    lookalike: lookalikeOf.get(n) ?? null,
  };
});

/* Blocked first, then notes, each by date. */
export const EXCEPTIONS = MARKS.filter((m) => m.verdict !== "ok").sort(
  (a, b) => (a.verdict === b.verdict ? a.n - b.n : a.verdict === "block" ? -1 : 1),
);
export const CLEARED = MARKS.filter((m) => m.verdict === "ok");

export const REPORT_CATS: MonthCat[] = ["Meals", "Ground", "Software", "Office", "Rail", "Airfare", "Lodging"];

const count = (f: (m: PileMark) => boolean) => MARKS.filter(f).length;
const sum = (list: PileMark[]) => list.reduce((a, m) => a + m.usd, 0);

export const COUNTS = {
  charges: MARKS.length,
  people: new Set(MARKS.map((m) => m.who)).size,
  currencies: new Set(MARKS.map((m) => m.cur)).size,
  foreign: count((m) => m.cur !== "USD"),
  receipts: count((m) => m.receipt),
  text: count((m) => m.channel === "text"),
  email: count((m) => m.channel === "email"),
  upload: count((m) => m.channel === "upload"),
  noReceipt: count((m) => !m.receipt),
  dupes: count((m) => m.dupOf !== null),
  lookalikes: count((m) => m.lookalike !== null),
  cleared: CLEARED.length,
  note: count((m) => m.verdict === "note"),
  block: count((m) => m.verdict === "block"),
  exceptions: EXCEPTIONS.length,
  total: sum(MARKS),
  clearedTotal: sum(CLEARED),
};

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
export const word = (n: number) => WORDS[n] ?? String(n);
