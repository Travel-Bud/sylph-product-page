/*
 * "Your month": one invented September for a small company of six people who spend and one (Dana) who
 * closes the books. Sample data only. No record here comes from any customer, employee or company.
 *
 * Where the shape came from:
 *  - merchants and descriptors: the repo's own fixtures and seed scripts (backend-system/scripts/e2e,
 *    backend-system/tests, sylph-rule-engine-service/tests, docs/mockups) and ENGINE_ROWS in
 *    site/sample-data.ts; the Denver trip reuses the page's own story (Sushi Kanda $84.20, Bar Bianco,
 *    the Uber and Yellow Cab pair) so this month agrees with the chapters above it;
 *  - rule ids and wording: ENGINE_ROWS (M-041 dinner cap, L-007 nightly cap, M-022 alcohol, D-001 duplicate);
 *  - amounts: ordinary card-statement spreads per category (coffee under $10, lunches $9 to $20, dinners
 *    either side of a $75 cap, hotel nights either side of $350, fares $230 to $1,450);
 *  - foreign charges: stored in their own currency and normalized to USD at one fixed rate per trip, the
 *    way the product normalizes at the rate on the receipt date.
 * A handful of rows sit just under each default threshold on purpose, so moving a threshold visibly
 * moves charges into or out of Dana's list.
 */

export type MonthCat = "Airfare" | "Lodging" | "Meals" | "Ground" | "Rail" | "Office" | "Software";
export const MONTH_CATS: MonthCat[] = ["Airfare", "Lodging", "Meals", "Ground", "Rail", "Office", "Software"];

export type Meal = "coffee" | "breakfast" | "lunch" | "dinner";
export type FxCode = "GBP" | "EUR" | "JPY" | "CAD";

export interface MonthPerson {
  id: string;
  name: string;
  role: string;
}

/* Invented first names only. Dana closes the books and spends nothing here. */
export const PEOPLE: MonthPerson[] = [
  { id: "priya", name: "Priya", role: "Account lead" },
  { id: "theo", name: "Theo", role: "Sales" },
  { id: "mara", name: "Mara", role: "Design lead" },
  { id: "jonah", name: "Jonah", role: "Engineering" },
  { id: "ines", name: "Ines", role: "Operations" },
  { id: "sam", name: "Sam", role: "Customer success" },
];

export interface MonthCharge {
  id: string;
  /** ISO date, card posting day */
  date: string;
  /** a PEOPLE id, or a free name from a pasted CSV */
  who: string;
  merchant: string;
  category: MonthCat;
  /** USD, already normalized */
  amount: number;
  /** the charge in its own currency, when it was not USD */
  fx?: { code: FxCode; amount: number; rate: number };
  meal?: Meal;
  /** people fed by a meal, the traveller included */
  guests?: number;
  /** nights on a hotel folio */
  nights?: number;
  /** the whole charge is alcohol (a bar tab) */
  alcohol?: boolean;
  /** a receipt found this charge */
  receipt: boolean;
}

const FX: Record<FxCode, number> = { GBP: 1.318, EUR: 1.0934, JPY: 0.006734, CAD: 0.7312 };

type Opt = { meal?: Meal; guests?: number; nights?: number; alcohol?: true; noReceipt?: true; fx?: FxCode };
type Raw = Omit<MonthCharge, "id">;

const r2 = (n: number) => Math.round(n * 100) / 100;

function c(md: string, who: string, merchant: string, category: MonthCat, amount: number, o: Opt = {}): Raw {
  const out: Raw = { date: `2026-${md}`, who, merchant, category, amount, receipt: !o.noReceipt };
  if (o.fx) {
    out.fx = { code: o.fx, amount, rate: FX[o.fx] };
    out.amount = r2(amount * FX[o.fx]);
  }
  if (o.meal) out.meal = o.meal;
  if (o.guests) out.guests = o.guests;
  if (o.nights) out.nights = o.nights;
  if (o.alcohol) out.alcohol = true;
  return out;
}

const RAW: Raw[] = [
  /* Priya: Denver (the page's story), London, and home */
  c("09-02", "priya", "Blue Bottle Coffee", "Meals", 6.4, { meal: "coffee", noReceipt: true }),
  c("09-05", "priya", "Joe & The Juice", "Meals", 11.6, { meal: "lunch" }),
  c("09-11", "priya", "United Airlines", "Airfare", 412.3),
  c("09-11", "priya", "Lyft", "Ground", 23.15),
  c("09-12", "priya", "Sushi Kanda", "Meals", 84.2, { meal: "dinner" }),
  c("09-12", "priya", "Hyatt Regency Denver", "Lodging", 258, { nights: 1 }),
  c("09-12", "priya", "Uber", "Ground", 41.6),
  c("09-12", "priya", "Yellow Cab Co", "Ground", 41.6),
  c("09-13", "priya", "Union Station Cafe", "Meals", 12.8, { meal: "breakfast" }),
  c("09-13", "priya", "Bar Bianco", "Meals", 46.9, { alcohol: true }),
  c("09-13", "priya", "Amtrak", "Rail", 118),
  c("09-17", "priya", "Sweetgreen", "Meals", 15.85, { meal: "lunch" }),
  c("09-21", "priya", "British Airways", "Airfare", 1184),
  c("09-22", "priya", "Heathrow Express", "Rail", 25, { fx: "GBP" }),
  c("09-22", "priya", "Kingsway Hotel", "Lodging", 590, { fx: "GBP", nights: 2 }),
  c("09-22", "priya", "Pellicci's Cafe", "Meals", 14.5, { fx: "GBP", meal: "lunch" }),
  c("09-23", "priya", "Pret a Manger", "Meals", 8.4, { fx: "GBP", meal: "lunch" }),
  c("09-23", "priya", "Ferris & Vine", "Meals", 132, { fx: "GBP", meal: "dinner", guests: 2 }),
  c("09-23", "priya", "London Black Cab", "Ground", 38, { fx: "GBP" }),
  c("09-24", "priya", "WHSmith", "Office", 6.99, { fx: "GBP", noReceipt: true }),
  c("09-24", "priya", "Heathrow Express", "Rail", 25, { fx: "GBP" }),
  c("09-29", "priya", "Blue Bottle Coffee", "Meals", 6.4, { meal: "coffee", noReceipt: true }),

  /* Theo: Chicago, Austin */
  c("09-03", "theo", "United Airlines", "Airfare", 386.4),
  c("09-08", "theo", "Chicago Yellow Cab", "Ground", 38.5),
  c("09-08", "theo", "Hilton Chicago", "Lodging", 618, { nights: 2 }),
  c("09-08", "theo", "Lou Malnati's Pizzeria", "Meals", 42.3, { meal: "dinner" }),
  c("09-09", "theo", "Intelligentsia Coffee", "Meals", 5.75, { meal: "coffee", noReceipt: true }),
  c("09-09", "theo", "The Capital Grille", "Meals", 312, { meal: "dinner", guests: 3 }),
  c("09-09", "theo", "Lobby Lounge", "Meals", 38, { alcohol: true }),
  c("09-10", "theo", "Divvy Bikes", "Ground", 4.35, { noReceipt: true }),
  c("09-10", "theo", "Uber", "Ground", 52.8),
  c("09-15", "theo", "Sweetgreen", "Meals", 16.4, { meal: "lunch" }),
  c("09-18", "theo", "Zoom", "Software", 15.99),
  c("09-24", "theo", "Southwest Airlines", "Airfare", 236),
  c("09-24", "theo", "Congress Avenue Hotel", "Lodging", 342, { nights: 1 }),
  c("09-24", "theo", "Eastside Smokehouse", "Meals", 71.6, { meal: "dinner" }),
  c("09-25", "theo", "Tacos Mañana", "Meals", 13.85, { meal: "lunch" }),
  c("09-25", "theo", "Lyft", "Ground", 27.9),
  c("09-25", "theo", "Uber", "Ground", 31.2),

  /* Mara: design tools, Tokyo */
  c("09-01", "mara", "Figma", "Software", 45),
  c("09-01", "mara", "Figma", "Software", 45),
  c("09-06", "mara", "Adobe", "Software", 89.99),
  c("09-14", "mara", "Japan Airlines", "Airfare", 1428),
  c("09-15", "mara", "Keisei Skyliner", "Rail", 2580, { fx: "JPY" }),
  c("09-15", "mara", "Hotel Nishiki Shinjuku", "Lodging", 198000, { fx: "JPY", nights: 4 }),
  c("09-15", "mara", "Menya Kaze", "Meals", 1480, { fx: "JPY", meal: "dinner" }),
  c("09-16", "mara", "FamilyMart", "Meals", 864, { fx: "JPY", meal: "breakfast", noReceipt: true }),
  c("09-16", "mara", "JR East", "Rail", 3200, { fx: "JPY" }),
  c("09-16", "mara", "Sushi Hamada", "Meals", 38500, { fx: "JPY", meal: "dinner", guests: 2 }),
  c("09-17", "mara", "Tokyo Metro", "Rail", 1200, { fx: "JPY", noReceipt: true }),
  c("09-17", "mara", "Blue Bottle Coffee", "Meals", 660, { fx: "JPY", meal: "coffee" }),
  c("09-17", "mara", "Itoya Ginza", "Office", 4950, { fx: "JPY" }),
  c("09-18", "mara", "Izakaya Tori", "Meals", 7900, { fx: "JPY", meal: "dinner" }),
  c("09-18", "mara", "Bar Kurage", "Meals", 4400, { fx: "JPY", alcohol: true }),
  c("09-19", "mara", "Nihon Kotsu Taxi", "Ground", 6800, { fx: "JPY" }),
  c("09-19", "mara", "Lawson", "Meals", 620, { fx: "JPY", meal: "breakfast", noReceipt: true }),
  c("09-26", "mara", "Muji", "Office", 48.6),

  /* Jonah: engineering tools, a Berlin conference */
  c("09-01", "jonah", "GitHub", "Software", 84),
  c("09-01", "jonah", "Vercel", "Software", 20),
  c("09-02", "jonah", "Linear", "Software", 64),
  c("09-03", "jonah", "JetBrains", "Software", 169, { noReceipt: true }),
  c("09-10", "jonah", "Lufthansa", "Airfare", 986),
  c("09-16", "jonah", "BVG", "Rail", 9.9, { fx: "EUR", noReceipt: true }),
  c("09-16", "jonah", "Hotel am Kanal", "Lodging", 612, { fx: "EUR", nights: 2 }),
  c("09-16", "jonah", "Imbiss am Ufer", "Meals", 8.5, { fx: "EUR", meal: "lunch" }),
  c("09-17", "jonah", "Kaffeebar Mitte", "Meals", 4.2, { fx: "EUR", meal: "coffee", noReceipt: true }),
  c("09-17", "jonah", "Brauhaus Mitte", "Meals", 68.4, { fx: "EUR", meal: "dinner" }),
  c("09-18", "jonah", "Taxi Berlin", "Ground", 38, { fx: "EUR" }),
  c("09-18", "jonah", "BER Airport Cafe", "Meals", 7.8, { fx: "EUR", meal: "breakfast" }),
  c("09-22", "jonah", "Notion Labs", "Software", 96),
  c("09-25", "jonah", "Sentry", "Software", 26),

  /* Ines: the office, shipping, team lunch */
  c("09-02", "ines", "Uline", "Office", 186.4),
  c("09-03", "ines", "FedEx Office", "Office", 32.1),
  c("09-05", "ines", "Staples", "Office", 58.73, { noReceipt: true }),
  c("09-09", "ines", "Office Depot", "Office", 148.2, { noReceipt: true }),
  c("09-11", "ines", "Sweetgreen", "Meals", 142.6, { meal: "lunch", guests: 8 }),
  c("09-12", "ines", "The UPS Store", "Office", 24.85, { noReceipt: true }),
  c("09-15", "ines", "Slack", "Software", 87.5),
  c("09-15", "ines", "Google Workspace", "Software", 168),
  c("09-19", "ines", "Costco", "Office", 212.18),
  c("09-23", "ines", "Trader Joe's", "Office", 64.3, { noReceipt: true }),
  c("09-26", "ines", "Dropbox", "Software", 24),
  c("09-29", "ines", "SpotHero", "Ground", 28, { noReceipt: true }),
  c("09-30", "ines", "Zoom", "Software", 15.99),

  /* Sam: client visits, Toronto */
  c("09-04", "sam", "Uber", "Ground", 18.4),
  c("09-04", "sam", "Chipotle", "Meals", 13.4, { meal: "lunch" }),
  c("09-10", "sam", "Shake Shack", "Meals", 14.75, { meal: "lunch" }),
  c("09-11", "sam", "ParkWhiz", "Ground", 22, { noReceipt: true }),
  c("09-17", "sam", "Lyft", "Ground", 26.7),
  c("09-18", "sam", "Joe's Pizza", "Meals", 9.5, { meal: "lunch", noReceipt: true }),
  c("09-18", "sam", "Avis", "Ground", 156.8),
  c("09-22", "sam", "Air Canada", "Airfare", 412),
  c("09-28", "sam", "UP Express", "Rail", 12.35, { fx: "CAD" }),
  c("09-28", "sam", "Hotel on Front", "Lodging", 489, { fx: "CAD", nights: 1 }),
  c("09-28", "sam", "Tim Hortons", "Meals", 4.85, { fx: "CAD", meal: "breakfast", noReceipt: true }),
  c("09-28", "sam", "Harbourfront Grill", "Meals", 96, { fx: "CAD", meal: "dinner" }),
  c("09-29", "sam", "Tim Hortons", "Meals", 4.85, { fx: "CAD", meal: "breakfast", noReceipt: true }),
  c("09-29", "sam", "City Taxi Toronto", "Ground", 41, { fx: "CAD" }),
];

/* Sorted by posting day, then as listed; ids follow that order. */
export const MONTH: MonthCharge[] = RAW.map((r, i) => ({ r, i }))
  .sort((a, b) => a.r.date.localeCompare(b.r.date) || a.i - b.i)
  .map(({ r }, n) => ({ id: `C-${String(n + 1).padStart(3, "0")}`, ...r }));
