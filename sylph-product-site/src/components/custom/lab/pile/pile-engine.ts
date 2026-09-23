/*
 * The canvas behind the pile. One mark per charge, drawn every frame from where it was when the step
 * changed toward where the scene puts it (moves) and what it should look like (looks). The loop runs
 * only while something is moving or the pointer changes the highlight, so an idle page costs nothing.
 */
import { MARKS, printedOf } from "./pile-data";
import type { Box, Geo, Guide, Look, LookKey, Move, Particle, Pt, Scene, Tone } from "./pile-scenes";
import { pileIntro } from "./pile-scenes";

type RGBA = [number, number, number, number];
interface Paint {
  fill: RGBA;
  stroke: RGBA;
  slip: number;
}
export type Mode = "play" | "settle" | "intro";
export interface FrameInfo {
  step: number;
  mode: Mode;
  landed: number;
  by: Partial<Record<Look, number>>;
}

const INK: RGBA = [16, 27, 22, 1];
export const PAINT: Record<Look, Paint> = {
  slip: { fill: [255, 255, 255, 1], stroke: [16, 27, 22, 0.24], slip: 1 },
  empty: { fill: [255, 255, 255, 1], stroke: [16, 27, 22, 0.45], slip: 0 },
  matched: { fill: [84, 94, 88, 1], stroke: [84, 94, 88, 1], slip: 0 },
  faded: { fill: [225, 230, 227, 1], stroke: [225, 230, 227, 1], slip: 0 },
  focus: { fill: INK, stroke: INK, slip: 0 },
  ok: { fill: [14, 204, 131, 1], stroke: [10, 124, 83, 1], slip: 0 },
  note: { fill: [245, 158, 11, 1], stroke: [161, 92, 7, 1], slip: 0 },
  block: { fill: [194, 64, 46, 1], stroke: [143, 42, 36, 1], slip: 0 },
};
const TONE: Record<Tone, string> = {
  hair: "rgba(16,27,22,0.11)",
  trail: "rgba(16,27,22,0.14)",
  mute: "rgba(16,27,22,0.45)",
  ink: "rgba(16,27,22,0.92)",
  amber: "#a15c07",
};

const N = MARKS.length;
const PRINTED = MARKS.map((m) => printedOf(m));
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerpBox = (a: Box, b: Box, t: number): Box => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
  r: lerp(a.r, b.r, t),
});
const lerpRGBA = (a: RGBA, b: RGBA, t: number): RGBA => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[3], b[3], t)];
const lerpPaint = (a: Paint, b: Paint, t: number): Paint => ({
  fill: lerpRGBA(a.fill, b.fill, t),
  stroke: lerpRGBA(a.stroke, b.stroke, t),
  slip: lerp(a.slip, b.slip, t),
});
const css = (c: RGBA) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${c[3]})`;

function bez(p: [Pt, Pt, Pt, Pt], t: number): Pt {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0], a * p[0][1] + b * p[1][1] + c * p[2][1] + d * p[3][1]];
}

export class PileEngine {
  private ctx: CanvasRenderingContext2D;
  private W = 0;
  private H = 0;
  private dpr = 1;
  private geo: Geo | null = null;
  private scenes: Scene[] = [];
  step = -1;
  private mode: Mode = "settle";
  private t0 = 0;
  private from: Box[] = [];
  private fromPaint: Paint[] = [];
  private moves: Move[][] = [];
  private looks: LookKey[][] = [];
  private guides: Guide[] = [];
  private particles: Particle[] = [];
  private old: { g: Guide; a: number }[] = [];
  private oldT = 0;
  private phaseAt: number | undefined;
  private end = 0;
  private cur: Box[] = [];
  private curPaint: Paint[] = [];
  private raf = 0;
  private font = "ui-monospace, monospace";
  hover: number | null = null;
  reduce = false;
  onFrame?: (f: FrameInfo) => void;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
  }

  setFont(f: string) {
    this.font = f;
    this.kick();
  }

  setScenes(scenes: Scene[], geo: Geo, dpr: number) {
    this.scenes = scenes;
    this.geo = geo;
    this.W = geo.W;
    this.H = geo.H;
    this.dpr = dpr;
    this.canvas.width = Math.round(geo.W * dpr);
    this.canvas.height = Math.round(geo.H * dpr);
    if (this.step >= 0) this.go(this.step, "settle", true);
  }

  go(step: number, mode: Mode, instant = false) {
    const sc = this.scenes[step];
    if (!sc) return;
    const now = performance.now();
    if (this.cur.length !== N) {
      this.cur = sc.settle.box.map((b) => ({ ...b }));
      this.curPaint = sc.settle.look.map((l) => PAINT[l]);
    } else {
      this.sample(now);
    }
    this.old = instant ? [] : this.visibleGuides(now);
    this.oldT = now;
    this.from = this.cur.map((b) => ({ ...b }));
    this.fromPaint = this.curPaint.map((p) => ({ ...p }));
    this.step = step;
    this.mode = mode;
    this.t0 = now;
    if (mode === "play") {
      this.moves = sc.moves;
      this.looks = sc.looks;
      this.guides = sc.guides;
      this.particles = sc.particles;
      this.phaseAt = sc.phaseAt;
      this.end = sc.end;
    } else if (mode === "intro" && this.geo) {
      const intro = pileIntro(this.geo, sc);
      this.from = intro.from;
      this.fromPaint = MARKS.map(() => PAINT.slip);
      this.moves = intro.moves;
      this.looks = MARKS.map(() => [{ t: 0, look: "slip" as Look }]);
      this.guides = [];
      this.particles = [];
      this.phaseAt = undefined;
      this.end = Math.max(...intro.moves.map((m) => m[0].t + m[0].dur));
    } else {
      const dur = instant || this.reduce ? 0 : 800;
      this.moves = sc.settle.box.map((b) => [{ t: 0, box: b, dur }]);
      this.looks = sc.settle.look.map((l) => [{ t: 0, look: l }]);
      this.guides = sc.guides.filter((g) => g.k !== "sweep" && g.phase !== "a").map((g) => ({ ...g, t: 0 }));
      this.particles = [];
      this.phaseAt = undefined;
      this.end = dur;
    }
    this.kick();
  }

  kick() {
    if (!this.raf && typeof window !== "undefined") this.raf = requestAnimationFrame(this.tick);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.onFrame = undefined;
  }

  box(i: number): Box | undefined {
    return this.cur[i];
  }

  hit(x: number, y: number): number | null {
    for (let i = this.cur.length - 1; i >= 0; i--) {
      const b = this.cur[i];
      const dx = x - b.x;
      const dy = y - b.y;
      const c = Math.cos(-b.r);
      const s = Math.sin(-b.r);
      const lx = dx * c - dy * s;
      const ly = dx * s + dy * c;
      const px = Math.max(2, (14 - b.w) / 2);
      const py = Math.max(2, (14 - b.h) / 2);
      if (Math.abs(lx) <= b.w / 2 + px && Math.abs(ly) <= b.h / 2 + py) return i;
    }
    return null;
  }

  private tick = (now: number) => {
    this.raf = 0;
    this.sample(now);
    this.draw(now);
    this.report(now);
    if (now - this.t0 < this.end + 450 || now - this.oldT < 300) this.kick();
  };

  private sample(now: number) {
    const el = now - this.t0;
    const lookDur = this.reduce ? 0 : 320;
    for (let i = 0; i < N; i++) {
      let b = this.from[i] ?? this.cur[i];
      for (const mv of this.moves[i] ?? []) {
        if (el < mv.t) break;
        const p = mv.dur ? clamp((el - mv.t) / mv.dur) : 1;
        const e = this.mode === "intro" ? easeOut(p) : easeInOut(p);
        const nb = lerpBox(b, mv.box, e);
        if (mv.c && this.mode === "play") {
          const [x, y] = bez([[b.x, b.y], mv.c[0], mv.c[1], [mv.box.x, mv.box.y]], e);
          nb.x = x;
          nb.y = y;
        }
        b = nb;
      }
      this.cur[i] = b;
      let pt = this.fromPaint[i] ?? this.curPaint[i];
      for (const k of this.looks[i] ?? []) {
        if (el < k.t) break;
        pt = lerpPaint(pt, PAINT[k.look], lookDur ? clamp((el - k.t) / lookDur) : 1);
      }
      this.curPaint[i] = pt;
    }
  }

  private guideAlpha(g: Guide, el: number) {
    const fade = this.reduce ? 0 : 380;
    let a = fade ? clamp((el - g.t) / fade) : el >= g.t ? 1 : 0;
    if (g.phase === "a" && this.phaseAt !== undefined) a *= fade ? 1 - clamp((el - this.phaseAt) / fade) : el >= this.phaseAt ? 0 : 1;
    return a;
  }

  private visibleGuides(now: number) {
    const el = now - this.t0;
    return this.guides.filter((g) => g.k !== "sweep").map((g) => ({ g, a: this.guideAlpha(g, el) })).filter((o) => o.a > 0.02);
  }

  private report(now: number) {
    if (!this.onFrame) return;
    const el = now - this.t0;
    let landed = 0;
    const by: Partial<Record<Look, number>> = {};
    for (let i = 0; i < N; i++) {
      const mv = this.moves[i]?.[0];
      if (!mv || el >= mv.t + mv.dur) landed++;
      let look: Look | null = null;
      for (const k of this.looks[i] ?? []) {
        if (el < k.t) break;
        look = k.look;
      }
      if (look) by[look] = (by[look] ?? 0) + 1;
    }
    this.onFrame({ step: this.step, mode: this.mode, landed, by });
  }

  private draw(now: number) {
    const { ctx } = this;
    const el = now - this.t0;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.W, this.H);

    const oa = this.reduce ? 0 : 1 - clamp((now - this.oldT) / 260);
    if (oa > 0) for (const o of this.old) this.drawGuide(o.g, o.a * oa, 1);
    const layer = (over: boolean) => {
      for (const g of this.guides) {
        if (g.k === "sweep" || !!g.over !== over) continue;
        const a = this.guideAlpha(g, el);
        if (a <= 0.01) continue;
        const draw = "draw" in g && g.draw && !this.reduce ? easeInOut(clamp((el - g.t) / 650)) : 1;
        this.drawGuide(g, a, draw);
      }
    };
    layer(false);
    for (let i = 0; i < N; i++) this.drawMark(this.cur[i], this.curPaint[i], i);
    layer(true);

    for (const p of this.particles) {
      if (el < p.t || el > p.t + p.dur) continue;
      const [x, y] = bez(p.p, easeInOut((el - p.t) / p.dur));
      const s = this.geo?.mobile ? 5 : 7;
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = css(INK);
      ctx.lineWidth = 1;
      ctx.fillRect(x - s / 2, y - s * 0.65, s, s * 1.3);
      ctx.strokeRect(x - s / 2, y - s * 0.65, s, s * 1.3);
    }

    for (const g of this.guides) {
      if (g.k !== "sweep" || this.reduce) continue;
      const p = (el - g.t) / g.dur;
      if (p < 0 || p > 1.15) continue;
      const x = lerp(g.x0, g.x1, easeInOut(clamp(p)));
      ctx.globalAlpha = p > 1 ? 1 - (p - 1) / 0.15 : 1;
      ctx.fillStyle = "rgba(16,27,22,0.05)";
      ctx.fillRect(g.x0, g.y0, x - g.x0, g.y1 - g.y0);
      ctx.strokeStyle = TONE.ink;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, g.y0);
      ctx.lineTo(x, g.y1);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (this.hover !== null && this.cur[this.hover]) {
      const b = this.cur[this.hover];
      ctx.save();
      ctx.translate(b.x, b.y);
      if (b.r) ctx.rotate(b.r);
      ctx.strokeStyle = css(INK);
      ctx.lineWidth = 2;
      ctx.strokeRect(-b.w / 2 - 3, -b.h / 2 - 3, b.w + 6, b.h + 6);
      ctx.restore();
    }
  }

  private drawGuide(g: Guide, a: number, draw: number) {
    const { ctx } = this;
    ctx.globalAlpha = a;
    ctx.setLineDash([]);
    switch (g.k) {
      case "line": {
        ctx.strokeStyle = TONE[g.tone];
        ctx.lineWidth = g.w ?? 1;
        if (g.dash) ctx.setLineDash(g.dash);
        ctx.beginPath();
        ctx.moveTo(g.a[0], g.a[1]);
        ctx.lineTo(lerp(g.a[0], g.b[0], draw), lerp(g.a[1], g.b[1], draw));
        ctx.stroke();
        break;
      }
      case "curve": {
        ctx.strokeStyle = TONE[g.tone];
        ctx.lineWidth = g.w ?? 1;
        if (g.dash) ctx.setLineDash(g.dash);
        ctx.beginPath();
        if (draw >= 1) {
          ctx.moveTo(g.p[0][0], g.p[0][1]);
          ctx.bezierCurveTo(g.p[1][0], g.p[1][1], g.p[2][0], g.p[2][1], g.p[3][0], g.p[3][1]);
        } else {
          const steps = 36;
          for (let k = 0; k <= steps; k++) {
            const [x, y] = bez(g.p, (k / steps) * draw);
            if (k) ctx.lineTo(x, y);
            else ctx.moveTo(x, y);
          }
        }
        ctx.stroke();
        break;
      }
      case "rect": {
        ctx.strokeStyle = TONE[g.tone];
        ctx.lineWidth = g.over ? 1.5 : 1;
        ctx.strokeRect(g.x + 0.5, g.y + 0.5, g.w, g.h);
        break;
      }
      case "node": {
        ctx.fillStyle = TONE.ink;
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.s / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "ghost": {
        ctx.strokeStyle = TONE.mute;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.strokeRect(g.x - g.s / 2 + 0.5, g.y - g.s / 2 + 0.5, g.s - 1, g.s - 1);
        break;
      }
      default:
        break;
    }
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  private drawMark(b: Box, p: Paint, i: number) {
    const { ctx } = this;
    const { w, h } = b;
    ctx.save();
    ctx.translate(b.x, b.y);
    if (b.r) ctx.rotate(b.r);
    if (p.slip > 0.01) {
      ctx.fillStyle = `rgba(16,27,22,${0.07 * p.slip})`;
      ctx.fillRect(-w / 2 + 1.5, -h / 2 + 2.5, w, h);
    }
    ctx.beginPath();
    const r = Math.min(2, w / 5, h / 5);
    if (ctx.roundRect) ctx.roundRect(-w / 2, -h / 2, w, h, r);
    else ctx.rect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = css(p.fill);
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = css(p.stroke);
    ctx.stroke();
    if (p.slip > 0.04 && w > 16) {
      ctx.globalAlpha = p.slip;
      const bar = Math.max(1.5, h * 0.045);
      ctx.fillStyle = "#d3dad6";
      ctx.fillRect(-w / 2 + w * 0.15, -h / 2 + h * 0.13, w * 0.58, bar);
      ctx.fillRect(-w / 2 + w * 0.15, -h / 2 + h * 0.13 + bar * 2.2, w * 0.36, bar);
      ctx.fillRect(-w / 2 + w * 0.15, -h / 2 + h * 0.13 + bar * 4.4, w * 0.46, bar);
      if (w > 34) {
        ctx.fillStyle = "#101b16";
        ctx.font = `600 ${(w * 0.155).toFixed(1)}px ${this.font}`;
        ctx.textBaseline = "alphabetic";
        ctx.fillText(PRINTED[i], -w / 2 + w * 0.15, h / 2 - h * 0.17, w * 0.72);
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
}
