"use client";

/* eslint-disable @next/next/no-img-element -- a frame-stepped capture surface: plain <img>, decoded before the first frame */

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { Mark } from "@/components/custom/site/mark";

/*
 * The clip: one charge, ten and a half seconds. Every style below is a pure function of the time t
 * (seconds), so a capture can step it frame by frame and get the same picture every run.
 *
 *   0.0  the snap       Priya texts a photo of the Sushi Kanda receipt
 *   1.3  the verdict    Sylph answers: matched, needs a note, M-041 over the $75 dinner cap; she replies
 *   3.2  the carry      the bird lifts the charge and the camera follows it across to Dana's side
 *   4.9  the exception  it lands in Dana's queue, the only thing in it; she approves
 *   6.5  month end      the bird takes it round once onto the September report, closed
 *   8.6  the card       the bird settles as the mark: Expenses run on air.
 *
 * Sample data only, the same invented people and merchants as /v2/sides.
 */

type Aspect = "45" | "169";
type V = { x: number; y: number };
type Seg = [V, V, V, V];

export const DURATION = 10.5;

const LAY = {
  "45": {
    W: 540,
    H: 675,
    cap: 42,
    label: { x: 28, y: 28 },
    capBox: { x: 28, y: 88, w: 484 },
    priya: { x: -38, y: 206, h: 486 },
    phone: { x: 222, y: 200, w: 300 },
    dana: { x: -26, y: 196, h: 492 },
    queue: { x: 192, y: 194, w: 330 },
    report: { x: 22, y: 206, w: 496 },
    together: { h: 256 },
    mark: { y: 190, w: 124 },
    tag: { y: 262, size: 46 },
    url: { y: 330 },
    bird: 52,
    loop: { x: 0.56, y: 172, r: 38 },
  },
  "169": {
    W: 960,
    H: 540,
    cap: 42,
    label: { x: 64, y: 64 },
    capBox: { x: 64, y: 124, w: 330 },
    priya: { x: 372, y: 110, h: 458 },
    phone: { x: 606, y: 40, w: 312 },
    dana: { x: 392, y: 74, h: 482 },
    queue: { x: 590, y: 40, w: 330 },
    report: { x: 440, y: 58, w: 480 },
    together: { h: 214 },
    mark: { y: 112, w: 100 },
    tag: { y: 176, size: 54 },
    url: { y: 250 },
    bird: 56,
    loop: { x: 0.36, y: 150, r: 40 },
  },
} as const;

type Lay = (typeof LAY)[Aspect];

/* ---------- time ---------- */
const T = {
  photo: 0.5,
  typing: 0.95,
  reply: 1.3,
  cap2: 1.2,
  flag: 1.7,
  cite: 1.9,
  note: 2.5,
  birdIn: 3.15,
  grab: 3.55,
  panA: 3.6,
  panB: 4.75,
  landB: 4.95,
  capD: 4.4,
  detail: 5.05,
  press: 6.05,
  birdIn2: 6.4,
  grab2: 6.8,
  green0: 6.85,
  green1: 7.4,
  rows: 7.3,
  capE: 7.55,
  landC: 8.2,
  foot: 8.35,
  out: 8.75,
  markAt: 9.45,
  tag: 9.25,
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const c01 = (v: number) => clamp(v, 0, 1);
const r = (t: number, a: number, b: number) => c01((t - a) / (b - a));
const oExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const oCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const ioCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const iCubic = (x: number) => x * x * x;
const oBack = (x: number) => {
  const c1 = 1.6;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const smooth = (x: number) => {
  const v = c01(x);
  return v * v * (3 - 2 * v);
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const DEG = 180 / Math.PI;
/* the bird glyph's beak points up and to the right: this turns it along its heading */
const BIRD_HEADING = 40;

/** rise in: opacity and a short upward travel on one expo-out curve */
function rise(t: number, at: number, dur = 0.55, dy = 18): CSSProperties {
  const k = oExpo(r(t, at, at + dur));
  return { opacity: k, transform: `translate3d(0,${((1 - k) * dy).toFixed(2)}px,0)` };
}
/** leave: opacity out and a short travel, cubic-in */
function leave(t: number, at: number, dur = 0.3, dy = -12): { o: number; y: number } {
  const k = iCubic(r(t, at, at + dur));
  return { o: 1 - k, y: k * dy };
}

function cub(c: Seg, u: number): V {
  const m = 1 - u;
  const a = m * m * m;
  const b = 3 * m * m * u;
  const d = 3 * m * u * u;
  const e = u * u * u;
  return { x: a * c[0].x + b * c[1].x + d * c[2].x + e * c[3].x, y: a * c[0].y + b * c[1].y + d * c[2].y + e * c[3].y };
}

/** a path of cubics walked at constant speed: point and heading at arc fraction u */
function walker(segs: Seg[]) {
  const pts: V[] = [];
  const seg: number[] = [];
  const len: number[] = [];
  let L = 0;
  segs.forEach((c, i) => {
    for (let k = i === 0 ? 0 : 1; k <= 48; k++) {
      const p = cub(c, k / 48);
      if (pts.length) L += Math.hypot(p.x - pts[pts.length - 1].x, p.y - pts[pts.length - 1].y);
      pts.push(p);
      len.push(L);
      seg.push(i);
    }
  });
  return (u: number) => {
    const target = c01(u) * L;
    let i = 1;
    while (i < len.length - 1 && len[i] < target) i++;
    const span = len[i] - len[i - 1] || 1;
    const k = c01((target - len[i - 1]) / span);
    const a = pts[i - 1];
    const b = pts[i];
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), h: Math.atan2(b.y - a.y, b.x - a.x), seg: seg[i] };
  };
}

/** the bird banks through a turn instead of flying upside down: it narrows and comes out mirrored */
function orient(h: number) {
  const c = Math.cos(h);
  let sx = clamp(c / 0.32, -1, 1);
  if (Math.abs(sx) < 0.06) sx = sx < 0 ? -0.06 : 0.06;
  const rot = c < 0 ? h * DEG + 180 - BIRD_HEADING : h * DEG + BIRD_HEADING;
  return { rot, sx };
}

/* ---------- anchors: layout positions, transforms ignored ---------- */
type Anchors = { A: V; B: V; C: V; pillH: number };
function layoutCenter(el: HTMLElement, root: HTMLElement): V {
  let x = el.offsetWidth / 2;
  let y = el.offsetHeight / 2;
  let n: HTMLElement | null = el;
  while (n && n !== root) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

/* ---------- pieces ---------- */
function Chip() {
  return <span className="c-chip">Sample data</span>;
}

function Pill({ away, style, id }: { away?: boolean; style?: CSSProperties; id?: string }) {
  return (
    <span className={`c-pill${away ? " is-away" : ""}`} style={style} data-anchor={id}>
      <span>Sushi Kanda</span>
      <span className="mono">$84.20</span>
    </span>
  );
}

function Words({ text, t, at, gap = 0.045, dur = 0.6, dy = 22 }: { text: string; t: number; at: number; gap?: number; dur?: number; dy?: number }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={i} className="c-w" style={rise(t, at + i * gap, dur, dy)}>
          {w}
          {"\u00a0"}
        </span>
      ))}
    </>
  );
}

function Person({ who, t, at, pos }: { who: "priya" | "dana"; t: number; at: number; pos: V }) {
  const p = who === "priya" ? { n: "Priya", r: "Spent it, on the road" } : { n: "Dana", r: "Closes the books" };
  return (
    <div className={`c-person c-person--${who}`} style={{ left: pos.x, top: pos.y, ...rise(t, at, 0.5, 10) }}>
      <img src={`/site/characters/${who}-head.webp`} alt="" width={256} height={256} />
      <span>
        <b>{p.n}</b>
        <i>{p.r}</i>
      </span>
    </div>
  );
}

function Figure({ name, box, style }: { name: string; box: { x: number; y: number; h: number }; style?: CSSProperties }) {
  return <img className="c-fig" src={`/site/characters/${name}.webp`} alt="" style={{ left: box.x, top: box.y, height: box.h, ...style }} />;
}

/* ---------- the stage ---------- */
export function ClipStage() {
  const [aspect, setAspect] = useState<Aspect | "og" | null>(null);
  const [t, setT] = useState(0);
  const [anchors, setAnchors] = useState<Anchors | null>(null);
  const [fit, setFit] = useState(1);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const f = q.get("f");
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- the aspect lives in the URL, read once on mount */
    setAspect(f === "169" ? "169" : f === "og" ? "og" : "45");
    setT(Number(q.get("t") ?? 0) || 0);
  }, []);

  useLayoutEffect(() => {
    if (!aspect || !root.current) return;
    const el = root.current;
    let alive = true;
    const w = window as unknown as { __clipSeek?: (s: number) => void; __clipReady?: boolean };
    w.__clipSeek = (s: number) => flushSync(() => setT(s));
    const imgs = Array.from(el.querySelectorAll("img"));
    Promise.all([document.fonts.ready, ...imgs.map((i) => i.decode().catch(() => undefined))]).then(() => {
      if (!alive) return;
      if (aspect !== "og") {
        const get = (id: string) => el.querySelector<HTMLElement>(`[data-anchor="${id}"]`);
        const a = get("A");
        const b = get("B");
        const c = get("C");
        if (a && b && c) flushSync(() => setAnchors({ A: layoutCenter(a, el), B: layoutCenter(b, el), C: layoutCenter(c, el), pillH: a.offsetHeight }));
      }
      w.__clipReady = true;
      const q = new URLSearchParams(window.location.search);
      if (q.get("play")) {
        const t0 = performance.now();
        const tick = () => {
          if (!alive) return;
          setT(((performance.now() - t0) / 1000) % (DURATION + 0.8));
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    });
    const onResize = () => {
      const L = aspect === "og" ? { W: 1200, H: 630 } : LAY[aspect];
      setFit(Math.min(window.innerWidth / L.W, window.innerHeight / L.H, 1));
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      alive = false;
      window.removeEventListener("resize", onResize);
    };
  }, [aspect]);

  if (!aspect) return null;
  if (aspect === "og") {
    return (
      <div ref={root} className="clip-stage" style={{ width: 1200, height: 630, transform: `scale(${fit})` }}>
        <Poster />
      </div>
    );
  }
  const L = LAY[aspect];
  return (
    <div
      ref={root}
      className={`clip-stage clip-stage--${aspect}`}
      style={{ width: L.W, height: L.H, transform: fit < 1 ? `scale(${fit})` : undefined }}
    >
      <Film L={L} t={t} anchors={anchors} />
    </div>
  );
}

function Film({ L, t, anchors }: { L: Lay; t: number; anchors: Anchors | null }) {
  const { W, H } = L;
  const pan = ioCubic(r(t, T.panA, T.panB));
  const green = ioCubic(r(t, T.green0, T.green1));
  const greenY = H * (1 - green);
  const out = r(t, T.out, T.out + 0.32);
  const outK = iCubic(out);

  /* ---------- Priya's side ---------- */
  const figIn = oExpo(r(t, -0.12, 0.7));
  const phoneIn = oExpo(r(t, -0.04, 0.8));
  const cap1 = leave(t, T.cap2, 0.28, -14);
  const photoK = r(t, T.photo, T.photo + 0.42);
  const flash = 1 - oCubic(r(t, T.photo + 0.05, T.photo + 0.4));
  const typing = t >= T.typing && t < T.reply;
  const replyK = oExpo(r(t, T.reply, T.reply + 0.45));
  const flagK = r(t, T.flag, T.flag + 0.3);
  const citeK = oCubic(r(t, T.cite, T.cite + 0.5));
  const noteK = r(t, T.note, T.note + 0.42);

  /* ---------- Dana's side ---------- */
  const landed = t >= T.landB;
  const landK = r(t, T.landB, T.landB + 0.3);
  const pressK = r(t, T.press, T.press + 0.16);
  const approved = t >= T.press + 0.12;
  const ringK = r(t, T.press, T.press + 0.45);

  /* ---------- the flights ---------- */
  let bird: CSSProperties = { opacity: 0 };
  let flyer: CSSProperties = { opacity: 0 };
  let pillAt: "A" | "air" | "B" | "C" = "A";
  let birdBone = 0;
  if (anchors) {
    const bw = L.bird;
    const bh = (bw * 1008) / 1056;
    const hang = bh * 0.44 + anchors.pillH * 0.5;
    const A = anchors.A;
    const B = { x: anchors.B.x - W, y: anchors.B.y };
    const C = { x: anchors.C.x, y: anchors.C.y };
    const hA = { x: A.x, y: A.y - hang };
    const hB = { x: B.x, y: B.y - hang };
    const hC = { x: C.x, y: C.y - hang };
    const M = { x: W / 2, y: L.mark.y };
    const markS = L.mark.w / bw;
    const boneAt = (y: number) => smooth((y - greenY + 20) / 40);
    const place = (p: V, rot: number, sx: number, s: number, o: number) => {
      bird = {
        opacity: o,
        transform: `translate3d(${p.x.toFixed(2)}px,${p.y.toFixed(2)}px,0) translate(-50%,-50%) rotate(${rot.toFixed(2)}deg) scale(${(sx * s).toFixed(3)},${s.toFixed(3)})`,
      };
      birdBone = boneAt(p.y);
    };
    const carry = (p: V, rot: number) => {
      flyer = { opacity: 1, transform: `translate3d(${p.x.toFixed(2)}px,${p.y.toFixed(2)}px,0) translate(-50%,-50%) rotate(${rot.toFixed(2)}deg)` };
    };

    /* leg 1: in from the top left, over Priya's charge, then across while the camera follows */
    const in1 = walker([[{ x: A.x - W * 0.55, y: -60 }, { x: A.x - W * 0.4, y: hA.y - 40 }, { x: hA.x - 110, y: hA.y }, hA]]);
    const leg1 = walker([[hA, { x: hA.x + 70, y: hA.y - 150 }, { x: hB.x - 130, y: hB.y - 80 }, hB]]);
    /* leg 2: from Dana's queue up, once round, down onto line 3 of the report */
    const lc = { x: W * L.loop.x, y: L.loop.y };
    const lr = L.loop.r;
    const k = lr * 0.5523;
    const Bt = { x: lc.x, y: lc.y + lr };
    const Lf = { x: lc.x - lr, y: lc.y };
    const Tp = { x: lc.x, y: lc.y - lr };
    const Rt = { x: lc.x + lr, y: lc.y };
    const in2 = walker([[{ x: hB.x + W * 0.5, y: -60 }, { x: hB.x + W * 0.3, y: hB.y - 60 }, { x: hB.x + 110, y: hB.y }, hB]]);
    const leg2segs: Seg[] = [
      [hB, { x: hB.x, y: hB.y - 90 }, { x: Bt.x + 90, y: Bt.y }, Bt],
      [Bt, { x: Bt.x - k, y: Bt.y }, { x: Lf.x, y: Lf.y + k }, Lf],
      [Lf, { x: Lf.x, y: Lf.y - k }, { x: Tp.x - k, y: Tp.y }, Tp],
      [Tp, { x: Tp.x + k, y: Tp.y }, { x: Rt.x, y: Rt.y - k }, Rt],
      [Rt, { x: Rt.x, y: Rt.y + k }, { x: Bt.x + k, y: Bt.y }, Bt],
      [Bt, { x: Bt.x - 90, y: Bt.y }, { x: hC.x + 120, y: hC.y - 60 }, hC],
    ];
    const leg2 = walker(leg2segs);
    /* leg 3: up off the report and into the middle, where it becomes the mark */
    const leg3 = walker([[hC, { x: hC.x + 40, y: hC.y - 150 }, { x: M.x - 170, y: M.y + 30 }, M]]);

    const swing = (h: number, lift: number) => clamp(Math.cos(h) * 7 * lift, -9, 9);

    if (t < T.birdIn) {
      pillAt = "A";
    } else if (t < T.grab) {
      const u = oCubic(r(t, T.birdIn, T.grab));
      const at = in1(u);
      const o = orient(at.h);
      place(at, o.rot, o.sx, 1, smooth(u * 3));
      pillAt = "A";
    } else if (t < T.landB) {
      const q = r(t, T.grab, T.landB);
      const at = leg1(ioCubic(q));
      const o = orient(at.h);
      place(at, o.rot, o.sx, 1, 1);
      pillAt = "air";
      carry({ x: at.x, y: at.y + hang }, swing(at.h, smooth(q / 0.15) * (1 - smooth((q - 0.85) / 0.15))));
    } else if (t < T.birdIn2) {
      /* set down: the charge sits in the queue, the bird carries on up and away */
      const q = r(t, T.landB, T.landB + 0.6);
      const e = q * q;
      const p = { x: hB.x + e * W * 0.35, y: hB.y - e * H * 0.5 };
      const o = orient(lerp(leg1(1).h, -0.9, smooth(q * 2.5)));
      place(p, o.rot, o.sx, 1, 1 - smooth((q - 0.4) / 0.6));
      pillAt = "B";
    } else if (t < T.grab2) {
      const u = oCubic(r(t, T.birdIn2, T.grab2));
      const at = in2(u);
      const o = orient(at.h);
      place(at, o.rot, o.sx, 1, smooth(u * 3));
      pillAt = "B";
    } else if (t < T.landC) {
      const q = r(t, T.grab2, T.landC);
      const at = leg2(ioCubic(q));
      const inLoop = at.seg >= 1 && at.seg <= 4;
      if (inLoop) {
        /* an inside loop entered heading left: the mirrored bird rolls with the path, the charge held at its feet */
        place(at, at.h * DEG + 180 - BIRD_HEADING, -1, 1, 1);
        carry({ x: at.x + Math.sin(at.h) * hang, y: at.y - Math.cos(at.h) * hang }, (at.h - Math.PI) * DEG);
      } else {
        const o = orient(at.h);
        place(at, o.rot, o.sx, 1, 1);
        carry({ x: at.x, y: at.y + hang }, 0);
      }
      pillAt = "air";
    } else {
      const q = r(t, T.landC + 0.02, T.markAt);
      const e = ioCubic(q);
      const at = leg3(e);
      const o = orient(at.h);
      const settle = smooth((q - 0.55) / 0.45);
      place(at, lerp(o.rot, 0, settle), lerp(o.sx, 1, settle), lerp(1, markS, oCubic(q)), 1);
      pillAt = "C";
    }
  }

  const pillFade = r(t, T.landC, T.landC + 0.25);

  return (
    <>
      {/* ---------- the world: Priya's side, the seam, Dana's side ---------- */}
      <div className="c-world" style={{ transform: `translate3d(${(-W * pan).toFixed(2)}px,0,0)` }}>
        <section className="c-side" style={{ left: 0, width: W, height: H }}>
          <Person who="priya" t={t} at={-0.12} pos={L.label} />
          <h2 className="c-cap" style={{ left: L.capBox.x, top: L.capBox.y, width: L.capBox.w, fontSize: L.cap }}>
            <span className="c-cap-a" style={{ opacity: cap1.o, transform: `translateY(${cap1.y}px)` }}>
              <Words text="Priya texts a photo of the receipt." t={t} at={-0.08} />
            </span>
            <span className="c-cap-b">
              <Words text="Sylph answers with the rule." t={t} at={T.cap2 + 0.18} />
            </span>
          </h2>
          <Figure name="priya-snap" box={L.priya} style={{ opacity: figIn, transform: `translate3d(${((1 - figIn) * -40).toFixed(2)}px,0,0)` }} />
          <div className="c-phone" style={{ left: L.phone.x, top: L.phone.y, width: L.phone.w, opacity: phoneIn, transform: `translate3d(0,${((1 - phoneIn) * 70).toFixed(2)}px,0)` }}>
            <div className="c-phone-head">
              <span className="c-phone-id">
                <Mark className="c-phone-mark" />
                Sylph
              </span>
              <Chip />
            </div>
            <div className="c-thread">
              <div
                className="c-msg c-msg--me c-photo"
                style={{ opacity: oCubic(photoK), transform: `translate3d(0,${((1 - oBack(photoK)) * 26).toFixed(2)}px,0) scale(${lerp(0.82, 1, oBack(photoK)).toFixed(3)})` }}
              >
                <div className="c-rcpt">
                  <b>SUSHI KANDA</b>
                  <i>Denver, CO</i>
                  <span>
                    Omakase<em>72.00</em>
                  </span>
                  <span>
                    Tea<em>4.00</em>
                  </span>
                  <span>
                    Tax<em>8.20</em>
                  </span>
                  <strong>
                    TOTAL<em>84.20</em>
                  </strong>
                </div>
                <div className="c-flash" style={{ opacity: photoK > 0 ? flash * 0.9 : 0 }} />
              </div>
              <div className="c-msg-wrap">
                <div className="c-typing" style={{ opacity: typing ? 1 : 0 }}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} style={{ transform: `translateY(${(-3 * Math.max(0, Math.sin((t - T.typing) * 10 - i * 0.9))).toFixed(2)}px)` }} />
                  ))}
                </div>
                <div className="c-msg c-msg--sylph" style={{ opacity: replyK, transform: `translate3d(0,${((1 - replyK) * 14).toFixed(2)}px,0)` }}>
                  <p>Matched to your card:</p>
                  <Pill id="A" away={pillAt !== "A"} />
                  <span
                    className="c-flag c-flag--note"
                    style={{ opacity: c01(flagK * 3), transform: `scale(${lerp(1.5, 1, oBack(flagK)).toFixed(3)})` }}
                  >
                    Needs a note
                  </span>
                  <p className="mono c-cite" style={{ clipPath: `inset(0 ${((1 - citeK) * 100).toFixed(2)}% 0 0)` }}>
                    M-041, $9.20 over the $75 dinner cap.
                  </p>
                </div>
              </div>
              <div
                className="c-msg c-msg--me c-msg--note"
                style={{ opacity: oCubic(noteK), transform: `translate3d(0,${((1 - oBack(noteK)) * 22).toFixed(2)}px,0) scale(${lerp(0.9, 1, oBack(noteK)).toFixed(3)})` }}
              >
                Late finish at the site visit, only place still open.
              </div>
            </div>
          </div>
        </section>

        <div className="c-seam" style={{ left: W, height: H, opacity: 1 - smooth((pan - 0.75) / 0.25) }} />

        <section className="c-side" style={{ left: W, width: W, height: H }}>
          <Person who="dana" t={t} at={T.capD - 0.1} pos={L.label} />
          <h2 className="c-cap" style={{ left: L.capBox.x, top: L.capBox.y, width: L.capBox.w, fontSize: L.cap }}>
            <Words text="Dana sees only the exception." t={t} at={T.capD} />
          </h2>
          <Figure name="dana-look" box={L.dana} />
          <div className="c-card c-queue" style={{ left: L.queue.x, top: L.queue.y, width: L.queue.w }}>
            <div className="c-card-head">
              <b>Dana&apos;s queue, September</b>
              <Chip />
            </div>
            <div className="c-need">
              Needs you
              <span className="c-count" style={{ transform: `scale(${landed ? lerp(1.6, 1, oBack(landK)).toFixed(3) : 1})` }}>
                {landed ? 1 : 0}
              </span>
            </div>
            <div className={`c-exc${landed ? " is-on" : ""}`} style={{ transform: `scale(${landed ? lerp(1.025, 1, oCubic(landK)).toFixed(4) : 1})` }}>
              <div className="c-exc-top">
                <Pill id="B" away={pillAt !== "B"} />
                <span className="c-flag c-flag--note" style={rise(t, T.landB + 0.05, 0.4, 6)}>
                  Needs a note
                </span>
              </div>
              <p className="mono c-cite" style={rise(t, T.detail, 0.5, 8)}>
                M-041, $9.20 over the $75 dinner cap
              </p>
              <p className="c-quote" style={rise(t, T.detail + 0.15, 0.5, 8)}>
                <b>Priya:</b> &ldquo;Late finish at the site visit, only place still open.&rdquo;
              </p>
              <div className="c-actions" style={rise(t, T.detail + 0.3, 0.5, 8)}>
                <span
                  className={`c-btn${approved ? " is-done" : ""}`}
                  style={{ transform: `scale(${(1 - 0.07 * Math.sin(Math.PI * pressK)).toFixed(3)})` }}
                >
                  {approved ? (
                    <>
                      <svg viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M3 8.5l3.2 3L13 4.5" />
                      </svg>
                      Approved
                    </>
                  ) : (
                    "Approve"
                  )}
                  <i className="c-ring" style={{ opacity: ringK > 0 && ringK < 1 ? (1 - ringK) * 0.45 : 0, transform: `translate(-50%,-50%) scale(${lerp(0.3, 1.5, oCubic(ringK)).toFixed(3)})` }} />
                </span>
              </div>
            </div>
            <p className="c-none" style={rise(t, T.detail + 0.45, 0.5, 6)}>
              Nothing else needs you.
            </p>
            <div className="c-filed">
              <b>Filed itself</b>
              <span className="mono">4 cleared</span>
            </div>
            <ul className="c-rows">
              {[
                ["United Airlines", "$412.30"],
                ["Lyft", "$23.15"],
                ["Hyatt Regency Denver", "$258.00"],
                ["Amtrak", "$118.00"],
              ].map(([m, a]) => (
                <li key={m}>
                  <i className="c-ok" />
                  <span>{m}</span>
                  <span className="mono">{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* ---------- month end: the deep green ground rises over both sides ---------- */}
      <div className="c-green" style={{ transform: `translate3d(0,${greenY.toFixed(2)}px,0)`, height: H }}>
        <h2 className="c-cap c-cap--bone" style={{ left: L.capBox.x, top: L.capBox.y, width: L.capBox.w, fontSize: L.cap, opacity: 1 - outK, transform: `translateY(${(outK * 30).toFixed(2)}px)` }}>
          <Words text="Month end. The report is already there." t={t} at={T.capE} />
        </h2>
        <div
          className="c-card c-report"
          style={{ left: L.report.x, top: L.report.y, width: L.report.w, opacity: 1 - outK, transform: `translate3d(0,${(outK * 60).toFixed(2)}px,0)` }}
        >
          <div className="c-card-head">
            <b>Priya&apos;s September report</b>
            <Chip />
          </div>
          <table className="c-rt">
            <thead>
              <tr>
                <th>Ln</th>
                <th>Merchant</th>
                <th className="c-num">Amount</th>
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              {REPORT.map((l, i) => {
                const at = T.rows + i * 0.07;
                const mine = l.n === 3;
                const show = mine ? rise(t, T.landC + 0.05, 0.4, 0) : rise(t, at, 0.45, 10);
                return (
                  <tr key={l.n} className={mine ? "is-mine" : undefined}>
                    <td className="mono" style={rise(t, at, 0.45, 10)}>
                      {l.n}
                    </td>
                    <td>
                      {mine ? (
                        <span className="c-slot">
                          <Pill id="C" away={pillAt !== "C"} style={{ opacity: pillAt === "C" ? 1 - pillFade : undefined }} />
                          <span className="c-slot-text" style={show}>
                            {l.m}
                          </span>
                        </span>
                      ) : (
                        <span style={show}>{l.m}</span>
                      )}
                    </td>
                    <td className="mono c-num" style={show}>
                      {l.a}
                    </td>
                    <td style={mine ? rise(t, T.landC + 0.15, 0.4, 6) : show}>
                      <span className={`c-flag c-flag--${l.v}`}>{VERDICT[l.v]}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot style={rise(t, T.foot, 0.5, 8)}>
              <tr>
                <td />
                <td>Reimbursable after verdicts</td>
                <td className="mono c-num">895.65</td>
                <td className="c-closed">Closed Sep 30</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ---------- the card ---------- */}
        <p className="c-tag" style={{ top: L.tag.y, fontSize: L.tag.size }}>
          <Words text="Expenses run on air." t={t} at={T.tag} gap={0.07} dur={0.7} dy={26} />
        </p>
        <p className="c-url mono" style={{ top: L.url.y, ...rise(t, T.tag + 0.45, 0.6, 8) }}>
          sylph-product.com
        </p>
        <img
          className="c-fig c-together"
          src="/site/characters/together.webp"
          alt=""
          style={{
            height: L.together.h,
            left: (W - (L.together.h * 912) / 960) / 2,
            top: H - L.together.h + 6,
            ...rise(t, T.out + 0.3, 0.9, 60),
          }}
        />
      </div>

      {/* ---------- the carriers, above everything ---------- */}
      <div className="c-air">
        <Pill style={flyer} />
        <span className="c-bird" style={{ ...bird, width: L.bird, height: (L.bird * 1008) / 1056 }}>
          <span className="c-bird-ink" style={{ opacity: 1 - birdBone }}>
            <Mark />
          </span>
          <span className="c-bird-bone" style={{ opacity: birdBone }}>
            <Mark />
          </span>
        </span>
      </div>
    </>
  );
}

const VERDICT = { ok: "Cleared", note: "Needs a note", block: "Blocked" } as const;
const REPORT = [
  { n: 1, m: "United Airlines", a: "412.30", v: "ok" as const },
  { n: 2, m: "Lyft", a: "23.15", v: "ok" as const },
  { n: 3, m: "Sushi Kanda", a: "84.20", v: "note" as const },
  { n: 4, m: "Hyatt Regency Denver", a: "258.00", v: "ok" as const },
  { n: 5, m: "Bar Bianco", a: "46.90", v: "block" as const },
  { n: 6, m: "Amtrak", a: "118.00", v: "ok" as const },
];

/* ---------- the poster (1200x630, the OG card) ---------- */
function Poster(): ReactNode {
  return (
    <div className="c-poster">
      <div className="c-poster-id">
        <Mark className="c-poster-mark" />
        Sylph
      </div>
      <h1 className="c-poster-h">
        One charge.
        <br />
        Two people.
        <br />
        <span>Nothing to chase.</span>
      </h1>
      <p className="c-poster-air">Expenses run on air.</p>
      <div className="c-seam c-seam--poster" />
      <img className="c-fig" src="/site/characters/priya-snap.webp" alt="" style={{ left: 560, top: 118, height: 540 }} />
      <img className="c-fig" src="/site/characters/dana-look.webp" alt="" style={{ left: 930, top: 96, height: 566 }} />
      <span className="c-bird c-bird--poster">
        <span className="c-bird-ink">
          <Mark />
        </span>
      </span>
      <span className="c-poster-cargo">
        <Pill />
        <span className="c-flag c-flag--note">Needs a note</span>
      </span>
      <span className="c-chip c-poster-chip">Sample data</span>
    </div>
  );
}
