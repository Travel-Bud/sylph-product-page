// Real-time headless capture over CDP: node shot.mjs '<json>'
// {"url","w","h","reduce":false,"scale":1,"shots":[{"t":1500,"file":"a.jpg","eval":"...","scroll":0}]}
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
const cfg = JSON.parse(process.argv[2]);
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 9333 + Math.floor(Math.random() * 500);
const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--remote-debugging-port=${port}`, "--no-first-run", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let info;
for (let i = 0; i < 50 && !info; i++) { try { info = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); } catch { await sleep(200); } }
const ws = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map(); const events = [];
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } else if (d.method) events.push(d); };
const send = (method, params = {}, sessionId) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
const { result: { targetId } } = await send("Target.createTarget", { url: "about:blank" });
const { result: { sessionId } } = await send("Target.attachToTarget", { targetId, flatten: true });
const s = (m, p) => send(m, p, sessionId);
await s("Page.enable"); await s("Runtime.enable");
await s("Emulation.setDeviceMetricsOverride", { width: cfg.w || 1440, height: cfg.h || 900, deviceScaleFactor: cfg.scale || 1, mobile: !!cfg.mobile });
if (cfg.reduce) await s("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
const loaded = new Promise((r) => { const iv = setInterval(() => { if (events.some((e) => e.method === "Page.loadEventFired")) { clearInterval(iv); r(); } }, 20); });
await s("Page.navigate", { url: cfg.url });
await loaded; const t0 = Date.now();
for (const shot of cfg.shots) {
  if (shot.eval) await s("Runtime.evaluate", { expression: shot.eval, awaitPromise: true });
  const wait = t0 + shot.t - Date.now(); if (wait > 0) await sleep(wait);
  const { result } = await s("Page.captureScreenshot", { format: "jpeg", quality: 86, captureBeyondViewport: false });
  writeFileSync(shot.file, Buffer.from(result.data, "base64"));
  if (shot.probe) { const { result: r } = await s("Runtime.evaluate", { expression: shot.probe, returnByValue: true }); console.log(shot.file, JSON.stringify(r.result.value)); } else console.log(shot.file);
}
const errs = events.filter((e) => e.method === "Runtime.exceptionThrown").map((e) => e.params.exceptionDetails.exception?.description?.slice(0, 200));
if (errs.length) console.log("EXCEPTIONS:", errs);
chrome.kill();
