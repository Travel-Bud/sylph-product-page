// Frame-stepped capture of /v2/clip over CDP: node scripts/clip/render.mjs '<json>'
// {"f":"45"|"169"|"og", "out":"<dir>", "fps":30, "dur":10.5, "times":[1.2, 4.0]?, "base":"http://localhost:3200"}
// Without "times" it writes every frame as <out>/f0000.png; with "times" it writes t<sec>.png stills.
// The composition is a pure function of t, so nothing here depends on wall-clock timing.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const cfg = JSON.parse(process.argv[2]);
const SIZE = { 45: [540, 675, 2], 169: [960, 540, 2], og: [1200, 630, 1] }[cfg.f];
if (!SIZE) throw new Error(`unknown f=${cfg.f}`);
const [w, h, dpr] = SIZE;
const fps = cfg.fps ?? 30;
const dur = cfg.dur ?? 10.5;
const base = cfg.base ?? "http://localhost:3200";
mkdirSync(cfg.out, { recursive: true });

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 9333 + Math.floor(Math.random() * 500);
const chrome = spawn(CHROME, ["--headless=new", "--hide-scrollbars", "--force-color-profile=srgb", `--remote-debugging-port=${port}`, "--no-first-run", "about:blank"], { stdio: "ignore" });
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
const events = [];
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
const { result: { targetId } } = await send("Target.createTarget", { url: "about:blank" });
const { result: { sessionId } } = await send("Target.attachToTarget", { targetId, flatten: true });
const s = (m, p) => send(m, p, sessionId);
await s("Page.enable");
await s("Runtime.enable");
await s("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: dpr, mobile: false });
await s("Page.navigate", { url: `${base}/v2/clip?f=${cfg.f}` });
const evalv = async (expression) => (await s("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;
for (let i = 0; i < 150; i++) {
  if (await evalv("window.__clipReady === true")) break;
  await sleep(200);
}
if (!(await evalv("window.__clipReady === true"))) throw new Error("composition never became ready");
// the dev server's indicator is not part of the picture
await evalv("document.querySelectorAll('nextjs-portal').forEach((n) => n.remove()); true");

const shoot = async (t, file) => {
  await evalv(`window.__clipSeek(${t}); new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))`);
  const { result } = await s("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  writeFileSync(file, Buffer.from(result.data, "base64"));
};

if (cfg.f === "og") {
  await shoot(0, `${cfg.out}/og.png`);
} else if (cfg.times) {
  for (const t of cfg.times) await shoot(t, `${cfg.out}/t${t.toFixed(2)}.png`);
} else {
  const n = Math.round(dur * fps);
  for (let i = 0; i < n; i++) await shoot(i / fps, `${cfg.out}/f${String(i).padStart(4, "0")}.png`);
  console.log(`${n} frames`);
}
const errs = events.filter((e) => e.method === "Runtime.exceptionThrown").map((e) => e.params.exceptionDetails.exception?.description?.slice(0, 200));
if (errs.length) console.log("EXCEPTIONS:", errs);
chrome.kill();
process.exit(0);
