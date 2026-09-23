// Page check for the /lab directions: node scripts/explore-check.mjs <url>
// Loads the page at 1440 (desktop), 390 (mobile, touch) and 1440 under reduced motion in real-time
// headless Chrome, scrolls it top to bottom, and reports exceptions, console errors and warnings,
// failed requests (4xx, 5xx, network) and the widest horizontal overflow seen at any scroll step.
// Exit code 1 when anything is found. Same CDP approach as shot.mjs. Vercel Web Analytics (root layout) is
// ignored: its script only exists on Vercel deployments and the dev build's debug script is blocked headless.
import { spawn } from "node:child_process";

const url = process.argv[2];
if (!url) {
  console.error("usage: node scripts/explore-check.mjs <url>");
  process.exit(2);
}
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 9333 + Math.floor(Math.random() * 500);
const chrome = spawn(
  CHROME,
  ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--remote-debugging-port=${port}`, "--no-first-run", "about:blank"],
  { stdio: "ignore" },
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let info;
for (let i = 0; i < 50 && !info; i++) {
  try {
    info = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
  } catch {
    await sleep(200);
  }
}
const ws = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
let events = [];
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pending.has(d.id)) {
    pending.get(d.id)(d);
    pending.delete(d.id);
  } else if (d.method) events.push(d);
};
const send = (method, params = {}, sessionId) =>
  new Promise((r) => {
    const i = ++id;
    pending.set(i, r);
    ws.send(JSON.stringify({ id: i, method, params, sessionId }));
  });

const RUNS = [
  { name: "1440", w: 1440, h: 900, mobile: false, reduce: false },
  { name: "390", w: 390, h: 844, mobile: true, reduce: false },
  { name: "1440-reduced", w: 1440, h: 900, mobile: false, reduce: true },
];

const IGNORED = /va\.vercel-scripts\.com|\/_vercel\/insights/;
let bad = false;
for (const run of RUNS) {
  events = [];
  const {
    result: { targetId },
  } = await send("Target.createTarget", { url: "about:blank" });
  const {
    result: { sessionId },
  } = await send("Target.attachToTarget", { targetId, flatten: true });
  const s = (m, p) => send(m, p, sessionId);
  await s("Page.enable");
  await s("Runtime.enable");
  await s("Log.enable");
  await s("Network.enable");
  await s("Emulation.setDeviceMetricsOverride", { width: run.w, height: run.h, deviceScaleFactor: 1, mobile: run.mobile });
  if (run.mobile) await s("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  if (run.reduce) await s("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const loaded = new Promise((r) => {
    const iv = setInterval(() => {
      if (events.some((e) => e.method === "Page.loadEventFired")) {
        clearInterval(iv);
        r();
      }
    }, 20);
  });
  await s("Page.navigate", { url });
  await loaded;
  await sleep(1500);
  const evalv = async (expression) => (await s("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result?.result?.value;
  const overflowExpr = `Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth`;
  let worst = { px: await evalv(overflowExpr), at: 0 };
  let y = 0;
  for (let step = 0; step < 80; step++) {
    const [h, vh] = await evalv(`[document.documentElement.scrollHeight, window.innerHeight]`);
    if (y >= h - vh) break;
    y = Math.min(y + Math.round(vh * 0.7), h - vh);
    await evalv(`window.scrollTo(0, ${y})`);
    await sleep(220);
    const px = await evalv(overflowExpr);
    if (px > worst.px) worst = { px, at: y };
  }
  await sleep(800);
  const px = await evalv(overflowExpr);
  if (px > worst.px) worst = { px, at: y };
  const height = await evalv(`document.documentElement.scrollHeight`);

  const ignoredIds = new Set(
    events.filter((e) => e.method === "Network.requestWillBeSent" && IGNORED.test(e.params.request.url)).map((e) => e.params.requestId),
  );
  const knownIds = new Set(events.filter((e) => e.method === "Network.requestWillBeSent").map((e) => e.params.requestId));
  // An ORB-blocked script whose request start was not recorded is the analytics debug script (the pages load no
  // other cross-origin script).
  const orbUnknown = (e) =>
    e.method === "Network.loadingFailed" && e.params.type === "Script" && /ORB/.test(e.params.errorText) && !knownIds.has(e.params.requestId);
  events = events.filter(
    (e) => !IGNORED.test(JSON.stringify(e.params ?? {})) && !ignoredIds.has(e.params?.requestId) && !orbUnknown(e),
  );
  const exceptions = events
    .filter((e) => e.method === "Runtime.exceptionThrown")
    .map((e) => (e.params.exceptionDetails.exception?.description || e.params.exceptionDetails.text || "").slice(0, 240));
  const consoleMsgs = events
    .filter((e) => e.method === "Runtime.consoleAPICalled" && ["error", "warning", "assert"].includes(e.params.type))
    .map((e) => `${e.params.type}: ${e.params.args.map((a) => a.value ?? a.description ?? "").join(" ").slice(0, 240)}`);
  const logs = events
    .filter((e) => e.method === "Log.entryAdded" && ["error", "warning"].includes(e.params.entry.level))
    .map((e) => `${e.params.entry.level} (${e.params.entry.source}): ${e.params.entry.text.slice(0, 200)} ${e.params.entry.url ?? ""}`);
  const failed = [
    ...events
      .filter((e) => e.method === "Network.responseReceived" && e.params.response.status >= 400)
      .map((e) => `${e.params.response.status} ${e.params.response.url}`),
    ...events
      .filter((e) => e.method === "Network.loadingFailed" && !e.params.canceled)
      .map((e) => `failed ${e.params.errorText} (${e.params.type})`),
  ];
  const problems = exceptions.length + consoleMsgs.length + logs.length + failed.length + (worst.px > 0 ? 1 : 0);
  if (problems) bad = true;
  console.log(
    JSON.stringify(
      {
        run: run.name,
        ok: problems === 0,
        height,
        overflowPx: worst.px,
        overflowAtY: worst.px > 0 ? worst.at : undefined,
        exceptions,
        console: consoleMsgs,
        log: logs,
        failedRequests: failed,
      },
      (k, v) => (Array.isArray(v) && v.length === 0 ? undefined : v),
    ),
  );
  await send("Target.closeTarget", { targetId });
}
chrome.kill();
process.exit(bad ? 1 : 0);
