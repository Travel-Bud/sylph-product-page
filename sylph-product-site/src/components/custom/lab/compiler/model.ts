/* The compiler direction's model: a small policy an editor can change without breaking, the rules it
   compiles to, a sample week of charges and the verdicts those rules give them. Pure functions, no
   randomness, no clock: the same policy and the same charge always give the same answer, which is
   the point the page makes. Everything here is sample data and renders under a Sample data chip. */

export type Outcome = "note" | "block";
export type Verdict = "ok" | Outcome;

export const VERDICT_LABEL: Record<Verdict, string> = { ok: "Cleared", note: "Needs a note", block: "Blocked" };

/* ---------- the policy ---------- */

export type BaseLine = "dinner" | "dinnerMax" | "alcohol" | "hotel" | "fare";
export type AddLine = "ride" | "rental" | "big";
export type LineKey = BaseLine | AddLine;
export type NumKey = "dinnerCap" | "dinnerMax" | "hotelCap" | "fareCap" | "rideCap" | "bigCap";
export type OutKey = "dinner" | "alcohol" | "hotel" | "fare";

export type PolicyState = {
  nums: Record<NumKey, number>;
  out: Record<OutKey, Outcome>;
  off: BaseLine[];
  added: AddLine[];
};

export const BASE: BaseLine[] = ["dinner", "dinnerMax", "alcohol", "hotel", "fare"];
export const ADDABLE: AddLine[] = ["ride", "rental", "big"];

export const DEFAULT_POLICY: PolicyState = {
  nums: { dinnerCap: 75, dinnerMax: 120, hotelCap: 350, fareCap: 600, rideCap: 40, bigCap: 400 },
  out: { dinner: "note", alcohol: "block", hotel: "note", fare: "note" },
  off: [],
  added: [],
};

export const NUMS: Record<NumKey, { label: string; line: LineKey; min: number; max: number; step: number }> = {
  dinnerCap: { label: "Dinner cap", line: "dinner", min: 25, max: 295, step: 5 },
  dinnerMax: { label: "Dinner limit", line: "dinnerMax", min: 30, max: 300, step: 5 },
  hotelCap: { label: "Nightly hotel cap", line: "hotel", min: 100, max: 800, step: 25 },
  fareCap: { label: "Fare cap", line: "fare", min: 200, max: 1500, step: 25 },
  rideCap: { label: "Ride cap", line: "ride", min: 10, max: 150, step: 5 },
  bigCap: { label: "Single-charge cap", line: "big", min: 100, max: 1500, step: 25 },
};

/** The range a number may take in this policy: the dinner cap always stays below the dinner limit. */
export function bounds(p: PolicyState, k: NumKey): [number, number] {
  const { min, max } = NUMS[k];
  if (k === "dinnerCap") return [min, Math.min(max, p.nums.dinnerMax - 5)];
  if (k === "dinnerMax") return [Math.max(min, p.nums.dinnerCap + 5), max];
  return [min, max];
}

export function setNum(p: PolicyState, k: NumKey, v: number): PolicyState {
  const [lo, hi] = bounds(p, k);
  const step = NUMS[k].step;
  const n = Math.min(hi, Math.max(lo, Math.round(v / step) * step));
  if (n === p.nums[k]) return p;
  return { ...p, nums: { ...p.nums, [k]: n } };
}

/** The lines in reading order with their numbers: base lines keep 4.1 to 4.5, added ones follow. */
export function lineOrder(p: PolicyState): { key: LineKey; num: string; added: boolean }[] {
  return [
    ...BASE.map((key, i) => ({ key: key as LineKey, num: `4.${i + 1}`, added: false })),
    ...p.added.map((key, i) => ({ key: key as LineKey, num: `4.${BASE.length + i + 1}`, added: true })),
  ];
}

export const OUT_PHRASE: Record<Outcome, string> = { note: "needs a note", block: "is not reimbursed" };

/* A line's words. Strings are plain text; objects are the parts a visitor can change. */
export type Part = string | { num: NumKey } | { out: OutKey } | { fixed: Outcome };
export function lineParts(key: LineKey): Part[] {
  switch (key) {
    case "dinner":
      return ["A dinner on the road is covered up to ", { num: "dinnerCap" }, " a person. Over the cap it ", { out: "dinner" }, "."];
    case "dinnerMax":
      return ["Over ", { num: "dinnerMax" }, ", a dinner ", { fixed: "block" }, " at all."];
    case "alcohol":
      return ["Alcohol ", { out: "alcohol" }, "."];
    case "hotel":
      return ["A hotel is covered up to ", { num: "hotelCap" }, " a night. Anything over it ", { out: "hotel" }, "."];
    case "fare":
      return ["Flights are booked in economy, and a fare over ", { num: "fareCap" }, " ", { out: "fare" }, "."];
    case "ride":
      return ["A ride or a taxi over ", { num: "rideCap" }, " ", { fixed: "note" }, "."];
    case "rental":
      return ["Rental cars are midsize or smaller. Anything larger ", { fixed: "note" }, "."];
    case "big":
      return ["Any single charge over ", { num: "bigCap" }, " ", { fixed: "note" }, "."];
  }
}

/** The sentence as plain text (the add menu and the Start scene quote it). */
export function lineText(p: PolicyState, key: LineKey): string {
  return lineParts(key)
    .map((part) =>
      typeof part === "string"
        ? part
        : "num" in part
          ? money0(p.nums[part.num])
          : "out" in part
            ? OUT_PHRASE[p.out[part.out]]
            : OUT_PHRASE[part.fixed],
    )
    .join("");
}

/* ---------- the rules it compiles to ---------- */

export type Rule = {
  id: string;
  line: LineKey | "built-in";
  num: string;
  subject: string;
  op: string;
  value: string;
  outcome: Outcome;
  limit?: number;
};

const RULE_ID: Record<LineKey, string> = {
  dinner: "M-041",
  dinnerMax: "M-042",
  alcohol: "M-022",
  hotel: "L-007",
  fare: "T-004",
  ride: "G-003",
  rental: "G-009",
  big: "X-010",
};

export const DUP_RULE: Rule = {
  id: "D-001",
  line: "built-in",
  num: "built in",
  subject: "same amount",
  op: "and",
  value: "same day",
  outcome: "note",
};

export function compile(p: PolicyState): Rule[] {
  const rules: Rule[] = [];
  for (const { key, num } of lineOrder(p)) {
    if ((p.off as LineKey[]).includes(key)) continue;
    const id = RULE_ID[key];
    const n = p.nums;
    switch (key) {
      case "dinner":
        rules.push({ id, line: key, num, subject: "dinner", op: "over", value: money0(n.dinnerCap), outcome: p.out.dinner, limit: n.dinnerCap });
        break;
      case "dinnerMax":
        rules.push({ id, line: key, num, subject: "dinner", op: "over", value: money0(n.dinnerMax), outcome: "block", limit: n.dinnerMax });
        break;
      case "alcohol":
        rules.push({ id, line: key, num, subject: "alcohol", op: "at", value: "any amount", outcome: p.out.alcohol });
        break;
      case "hotel":
        rules.push({ id, line: key, num, subject: "hotel night", op: "over", value: money0(n.hotelCap), outcome: p.out.hotel, limit: n.hotelCap });
        break;
      case "fare":
        rules.push({ id, line: key, num, subject: "fare", op: "over", value: money0(n.fareCap), outcome: p.out.fare, limit: n.fareCap });
        break;
      case "ride":
        rules.push({ id, line: key, num, subject: "ride or taxi", op: "over", value: money0(n.rideCap), outcome: "note", limit: n.rideCap });
        break;
      case "rental":
        rules.push({ id, line: key, num, subject: "rental class", op: "above", value: "midsize", outcome: "note" });
        break;
      case "big":
        rules.push({ id, line: key, num, subject: "any charge", op: "over", value: money0(n.bigCap), outcome: "note", limit: n.bigCap });
        break;
    }
  }
  rules.push(DUP_RULE);
  return rules;
}

/** A short, stable fingerprint of a ruleset (FNV-1a): the same rules always print the same six characters. */
export function fingerprint(rules: Rule[]): string {
  const s = rules.map((r) => `${r.id}:${r.limit ?? "-"}:${r.outcome}`).join("|");
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 6);
}

/* ---------- the sample week ---------- */

export type Kind = "dinner" | "alcohol" | "hotel" | "fare" | "ride" | "rental";
export type Charge = {
  id: string;
  day: string;
  date: string;
  merchant: string;
  usd: number;
  kind: Kind;
  fx?: { amount: string; rate: string; on: string };
  dupOf?: string;
  rentalClass?: string;
};

export const WEEK: Charge[] = [
  { id: "united", day: "Mon", date: "Sep 14", merchant: "United Airlines", usd: 412.3, kind: "fare" },
  { id: "hyatt", day: "Mon", date: "Sep 14", merchant: "Hyatt Regency Denver", usd: 258, kind: "hotel" },
  { id: "sushi", day: "Tue", date: "Sep 15", merchant: "Sushi Kanda", usd: 84.2, kind: "dinner" },
  { id: "bar", day: "Tue", date: "Sep 15", merchant: "Bar Bianco", usd: 46.9, kind: "alcohol" },
  { id: "uber", day: "Wed", date: "Sep 16", merchant: "Uber", usd: 41.6, kind: "ride" },
  { id: "cab", day: "Wed", date: "Sep 16", merchant: "Yellow Cab Co", usd: 41.6, kind: "ride", dupOf: "uber" },
  { id: "lumen", day: "Thu", date: "Sep 17", merchant: "Café Lumen, Paris", usd: 72.54, kind: "dinner", fx: { amount: "€62.00", rate: "1.170", on: "Sep 17" } },
  { id: "marriott", day: "Thu", date: "Sep 17", merchant: "Marriott Marquis", usd: 412, kind: "hotel" },
  { id: "delta", day: "Fri", date: "Sep 18", merchant: "Delta Air Lines", usd: 688, kind: "fare" },
  { id: "avis", day: "Fri", date: "Sep 18", merchant: "Avis", usd: 156.8, kind: "rental", rentalClass: "full-size" },
];

const KIND_WORD: Record<Kind, string> = {
  dinner: "dinners",
  alcohol: "alcohol",
  hotel: "hotels",
  fare: "fares",
  ride: "rides",
  rental: "rental cars",
};

/* which rules speak to which charges */
function applies(r: Rule, c: Charge): boolean {
  switch (r.line) {
    case "dinner":
    case "dinnerMax":
      return c.kind === "dinner";
    case "alcohol":
      return c.kind === "alcohol";
    case "hotel":
      return c.kind === "hotel";
    case "fare":
      return c.kind === "fare";
    case "ride":
      return c.kind === "ride";
    case "rental":
      return c.kind === "rental";
    case "big":
      return true;
    case "built-in":
      return !!c.dupOf;
  }
}
function hit(r: Rule, c: Charge): boolean {
  if (r.limit !== undefined) return c.usd > r.limit + 1e-9;
  if (r.line === "rental") return c.rentalClass !== "midsize" && c.rentalClass !== "compact";
  return true;
}

export type Check = {
  v: Verdict;
  rule: Rule | null;
  cite: string;
  more: number;
};

const SEVERITY: Record<Verdict, number> = { ok: 0, note: 1, block: 2 };

export function check(c: Charge, rules: Rule[]): Check {
  const hits = rules.filter((r) => applies(r, c) && hit(r, c));
  if (hits.length) {
    let top = hits[0];
    for (const h of hits) if (SEVERITY[h.outcome] > SEVERITY[top.outcome]) top = h;
    return { v: top.outcome, rule: top, cite: citeHit(top, c), more: hits.length - 1 };
  }
  /* cleared: cite the rule that let it through, the specific one before the general one */
  const gov = rules.find((r) => applies(r, c) && r.line !== "big" && r.line !== "built-in") ?? rules.find((r) => applies(r, c) && r.line === "big");
  if (gov) return { v: "ok", rule: gov, cite: citePass(gov, c), more: 0 };
  return { v: "ok", rule: null, cite: `No line in the policy limits ${KIND_WORD[c.kind]}`, more: 0 };
}

function citeHit(r: Rule, c: Charge): string {
  const over = r.limit !== undefined ? money(c.usd - r.limit) : "";
  const kept = r.outcome === "block" ? ", kept off the total" : "";
  switch (r.line) {
    case "dinner":
      return `${over} over the ${money0(r.limit!)} dinner cap${kept}`;
    case "dinnerMax":
      return `${over} over the ${money0(r.limit!)} dinner limit${kept}`;
    case "alcohol":
      return r.outcome === "block" ? "Alcohol, kept off the total" : "Alcohol, reply with a note";
    case "hotel":
      return `${over} over the ${money0(r.limit!)} nightly cap${kept}`;
    case "fare":
      return `${over} over the ${money0(r.limit!)} fare cap${kept}`;
    case "ride":
      return `${over} over the ${money0(r.limit!)} ride cap`;
    case "rental":
      return `A ${c.rentalClass} car, the policy is midsize`;
    case "big":
      return `${over} over the ${money0(r.limit!)} single-charge cap`;
    case "built-in": {
      const twin = WEEK.find((w) => w.id === c.dupOf);
      return `Same amount and day as ${twin?.merchant ?? "another charge"}`;
    }
  }
}
function citePass(r: Rule, c: Charge): string {
  if (r.limit === undefined) return "In policy";
  const under = money(r.limit - c.usd);
  const what: Partial<Record<LineKey, string>> = {
    dinner: "dinner cap",
    dinnerMax: "dinner limit",
    hotel: "nightly cap",
    fare: "fare cap",
    ride: "ride cap",
    big: "single-charge cap",
  };
  return `${under} under the ${money0(r.limit)} ${what[r.line as LineKey] ?? "cap"}`;
}

export function checkWeek(rules: Rule[]): Record<string, Check> {
  const out: Record<string, Check> = {};
  for (const c of WEEK) out[c.id] = check(c, rules);
  return out;
}

export function totals(checks: Record<string, Check>) {
  let kept = 0;
  let on = 0;
  const count: Record<Verdict, number> = { ok: 0, note: 0, block: 0 };
  for (const c of WEEK) {
    const v = checks[c.id].v;
    count[v]++;
    if (v === "block") kept += c.usd;
    else on += c.usd;
  }
  return { on, kept, count };
}

/* ---------- formatting ---------- */

export function money(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
export function money0(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
