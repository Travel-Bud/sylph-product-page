// Courier invariant harness: randomized scrolling against the live page, checked on every frame.
// node scripts/courier-check.mjs '{"url":"http://localhost:3200/?courier-debug","w":1440,"h":900,"mobile":false,"seeds":[1,2,3],"acts":30}'
// Needs the page's ?courier-debug snapshot (window.__courier.snap, see courier.tsx). Headless Chrome over CDP, real time.
//
// Per frame:  exactly one visible charge (carrier or a stop's pill, never both, never none);
//             the carriers on screen belong to the leg being drawn, none while the charge rests;
//             the drawn state never moves away from where the scroll says it should be;
//             the drawn state is never more than one leg away from the scroll.
// Per settle: after the scroll rests, the pill is at the right stop (for a scroll left inside a
//             flight window, either end of that leg).
import { spawn } from "node:child_process";

const cfg = { url: "http://localhost:3200/?courier-debug", w: 1440, h: 900, mobile: false, seeds: [1, 2, 3], acts: 30, ...JSON.parse(process.argv[2] || "{}") };
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
const js = async (expression) => (await s("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;
const size = (w, h) => s("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: !!cfg.mobile });
await s("Page.enable"); await s("Runtime.enable");
await size(cfg.w, cfg.h);

const SAMPLER = `window.__cc = (() => {
  const L = document.querySelector('.v2s-cour');
  const q = (x) => L.querySelector(x);
  const el = { pill: q('.v2s-cour-pill--note'), ok: q('.v2s-cour-pill--ok'), plane: q('.v2s-cour-plane'), bird: q('.v2s-cour-bird'), bubble: q('.v2s-cour-bubble'), stamp: q('.v2s-cour-stamp'), rails: [...L.querySelectorAll('.v2s-cour-rail')] };
  const vis = (e) => e && +(e.style.opacity || 0) > 0.05;
  const ALLOW = { 0: ['bird'], 1: ['rail'], 2: ['plane'], 3: ['bubble'], 4: ['stamp'] };
  const st = { frames: 0, v: {}, samples: [], prevDisp: null, prevY: scrollY, settles: 0, settleOk: 0, quietUntil: 0 };
  const bad = (k, d) => { st.v[k] = (st.v[k] || 0) + 1; if (st.samples.length < 40) st.samples.push([k, Math.round(scrollY), d]); };
  const expected = (y, win) => { let E = 0; win.forEach(([a, b], i) => { if (y >= b) E = 2 * i + 2; else if (y > a) E = 2 * i + 1; }); return E; };
  st.expected = expected;
  const tick = () => {
    const sn = window.__courier && window.__courier.snap;
    if (sn && sn.state >= 0 && performance.now() > st.quietUntil) {
      st.frames++;
      const y = scrollY;
      const stops = [...document.querySelectorAll('[data-courier-stop]')];
      const here = stops.filter((e) => e.dataset.courier === 'here' || e.dataset.courier === undefined).length;
      const fly = vis(el.pill) || vis(el.ok) || vis(el.plane) ? 1 : 0;
      if (here + fly !== 1) bad('charges!=1', { here, fly, D: sn.state });
      const on = [];
      if (vis(el.bird)) on.push('bird'); if (vis(el.plane)) on.push('plane'); if (vis(el.bubble)) on.push('bubble'); if (vis(el.stamp)) on.push('stamp'); if (el.rails.some(vis)) on.push('rail');
      if (sn.leg < 0 && on.length) bad('carrier-at-rest', on.join('+'));
      if (sn.leg >= 0) { const wrong = on.filter((c) => !(ALLOW[sn.leg] || []).includes(c)); if (wrong.length) bad('wrong-carrier', { leg: sn.leg, wrong: wrong.join('+') }); }
      const E = expected(y, sn.win);
      const D = sn.state;
      if (st.prevDisp !== null && D !== st.prevDisp) {
        const toward = Math.sign(D - st.prevDisp) === Math.sign(E - st.prevDisp);
        const settling = E % 2 === 1 && Math.abs(D - E) === 1;
        if (!toward && !settling) bad('moved-away-from-scroll', { from: st.prevDisp, to: D, E, j: Math.round(sn.j * 1000) / 1000, w4: sn.win[4], ih: innerHeight, max: document.documentElement.scrollHeight - innerHeight });
      }
      if (Math.abs(D - E) > 2) bad('lag>1leg', { D, E });
      st.prevDisp = D;
    }
    st.prevY = scrollY;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  st.settled = () => {
    const sn = window.__courier.snap; const E = expected(scrollY, sn.win); const D = sn.state;
    const ok = D % 2 === 0 && (E % 2 === 0 ? D === E : Math.abs(D - E) === 1);
    st.settles++; if (ok) st.settleOk++; else bad('settled-wrong', { D, E, p: sn.p });
    return ok;
  };
  const set = (y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y));
  const raf = () => new Promise((r) => requestAnimationFrame(r));
  window.__glide = async (to, ms) => { const from = scrollY; const t0 = performance.now(); for (;;) { const k = Math.min(1, (performance.now() - t0) / ms); set(from + (to - from) * (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2)); if (k >= 1) break; await raf(); } };
  window.__reverse = async (back) => { const max = document.documentElement.scrollHeight - innerHeight; let y = scrollY; const t0 = performance.now(); while (performance.now() - t0 < 7000 && y < max) { y += 5; set(y); await raf(); const sn = window.__courier.snap; if (sn.state % 2 === 1 && sn.p > 0.25 && sn.p < 0.75) break; } const leg = window.__courier.snap.leg; const seen = []; let on = true; (async () => { while (on) { const l = window.__courier.snap.leg; if (seen[seen.length - 1] !== l) seen.push(l); await raf(); } })(); await window.__glide(Math.max(0, y - back), 1100); on = false; return { leg, seen }; };
  return st;
})(); true`;

let seed = 1;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const totals = { frames: 0, v: {}, settles: 0, settleOk: 0, samples: [], reversals: 0, reversalOk: 0 };

for (const sd of cfg.seeds) {
  seed = sd * 7919;
  events.length = 0;
  await size(cfg.w, cfg.h);
  const loaded = new Promise((r) => { const iv = setInterval(() => { if (events.some((e) => e.method === "Page.loadEventFired")) { clearInterval(iv); r(); } }, 20); });
  await s("Page.navigate", { url: cfg.url });
  await loaded; await sleep(6500);
  await js(SAMPLER);
  const log = [];
  for (let a = 0; a < cfg.acts; a++) {
    const H = await js("document.documentElement.scrollHeight - innerHeight");
    const kinds = ["glide", "glide", "glide", "flick", "reverse", "reverse", "anchor", "settle", "settle"];
    if (!cfg.mobile) kinds.push("resize");
    const k = pick(kinds);
    log.push(k);
    if (k === "glide") await js(`__glide(${Math.round(rnd() * H)}, ${Math.round(600 + rnd() * 3000)})`);
    else if (k === "flick") await js(`(()=>{const y=${Math.round(rnd() * H)};window.__lenis?__lenis.scrollTo(y,{immediate:true}):scrollTo(0,y)})()`);
    else if (k === "reverse") {
      // turning back mid-leg must rewind that same leg: the first leg drawn during the glide back is
      // the one it was in (it may then reach its stop and carry on into the leg before)
      const { leg, seen } = await js(`__reverse(${Math.round(120 + rnd() * 380)})`);
      totals.reversals++;
      const first = seen.find((l) => l !== -1);
      if (leg < 0 || first === undefined || first === leg) totals.reversalOk++; else totals.samples.push(["reversal-other-leg", { leg, seen }]);
    } else if (k === "anchor") await js(`(()=>{const a=[...document.querySelectorAll('header a[href^="#"]')];if(a.length)a[Math.floor(${rnd()}*a.length)].click()})()`);
    else if (k === "resize") {
      const [w, h] = pick([[1280, 800], [1100, 760], [1440, 900], [1024, 700]]);
      await js("__cc.quietUntil = performance.now() + 900");
      await size(w, h);
    }
    if (k === "settle" || a === cfg.acts - 1) { await sleep(4500); await js("__cc.settled()"); }
    else await sleep(150 + rnd() * 500);
  }
  await size(cfg.w, cfg.h);
  const st = await js("({frames:__cc.frames,v:__cc.v,settles:__cc.settles,settleOk:__cc.settleOk,samples:__cc.samples})");
  totals.frames += st.frames; totals.settles += st.settles; totals.settleOk += st.settleOk;
  for (const [key, n] of Object.entries(st.v)) totals.v[key] = (totals.v[key] || 0) + n;
  totals.samples.push(...st.samples.slice(0, 8).map((x) => [`seed ${sd}`, ...x]));
  const errs = events.filter((e) => e.method === "Runtime.exceptionThrown").map((e) => e.params.exceptionDetails.exception?.description?.slice(0, 160));
  if (errs.length) totals.samples.push(["exceptions", errs]);
  console.log(`seed ${sd}: ${st.frames} frames, settles ${st.settleOk}/${st.settles}, violations ${JSON.stringify(st.v)} | ${log.join(" ")}`);
}
const bad = Object.values(totals.v).reduce((a, b) => a + b, 0);
console.log(`TOTAL ${cfg.w}x${cfg.h}${cfg.mobile ? " mobile" : ""}: ${totals.frames} frames checked, ${bad} frame violations ${JSON.stringify(totals.v)}, settles ${totals.settleOk}/${totals.settles}, reversals ${totals.reversalOk}/${totals.reversals}`);
for (const x of totals.samples.slice(0, 24)) console.log("  ", JSON.stringify(x));
chrome.kill();
process.exit(0);
