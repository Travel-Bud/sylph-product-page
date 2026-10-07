/* Isometric line drawings for "How it works", computed on the server into static SVG markup.
   World axes: x runs down-right, y runs down-left, z runs up. Faces are filled with the ground colour and drawn
   back to front, so hidden lines disappear the way they do in a technical drawing. Everything drawn is centred in
   the frame below its caption (scaled down only if it would not fit). */

const C = Math.cos(Math.PI / 6);
const S = 0.5;

const n = (v: number) => {
  const r = Math.round(v * 10) / 10;
  return Object.is(r, -0) ? "0" : String(r);
};

export type Theme = {
  ground: string;
  sideL: string;
  sideR: string;
  line: string;
  faint: string;
  accent: string;
  accentFill: string;
  warn: string;
  text: string;
  muted: string;
  mono: string;
};

export const NIGHT: Theme = {
  ground: "#0A1410",
  sideL: "#0A1410",
  sideR: "#0A1410",
  line: "rgba(236,242,238,0.78)",
  faint: "rgba(236,242,238,0.32)",
  accent: "#2EDE97",
  accentFill: "rgba(46,222,151,0.16)",
  warn: "#F2B84B",
  text: "rgba(236,242,238,0.92)",
  muted: "rgba(236,242,238,0.62)",
  mono: "var(--font-plex-mono), ui-monospace, monospace",
};

type P3 = [number, number, number];

class Iso {
  out: string[] = [];
  bb = [1e9, 1e9, -1e9, -1e9];
  caption = "";
  constructor(
    private ox: number,
    private oy: number,
    private t: Theme,
    private k = 1,
  ) {}

  grow(x: number, y: number) {
    const b = this.bb;
    b[0] = Math.min(b[0], x);
    b[1] = Math.min(b[1], y);
    b[2] = Math.max(b[2], x);
    b[3] = Math.max(b[3], y);
  }

  p(x: number, y: number, z = 0): [number, number] {
    const sx = this.ox + (x - y) * C * this.k;
    const sy = this.oy + ((x + y) * S - z) * this.k;
    this.grow(sx, sy);
    return [sx, sy];
  }

  pts(ps: P3[]) {
    return ps.map((q) => this.p(...q).map(n).join(",")).join(" ");
  }

  poly(ps: P3[], o: { fill?: string; stroke?: string; sw?: number; dash?: string } = {}) {
    const dash = o.dash ? ` stroke-dasharray="${o.dash}"` : "";
    this.out.push(
      `<polygon points="${this.pts(ps)}" fill="${o.fill ?? this.t.ground}" stroke="${o.stroke ?? this.t.line}" stroke-width="${o.sw ?? 1}" stroke-linejoin="round"${dash}/>`,
    );
  }

  line(a: P3, b: P3, o: { stroke?: string; sw?: number; dash?: string; op?: number } = {}) {
    const [x1, y1] = this.p(...a);
    const [x2, y2] = this.p(...b);
    const dash = o.dash ? ` stroke-dasharray="${o.dash}"` : "";
    const op = o.op !== undefined ? ` opacity="${o.op}"` : "";
    this.out.push(
      `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${o.stroke ?? this.t.line}" stroke-width="${o.sw ?? 1}" stroke-linecap="round"${dash}${op}/>`,
    );
  }

  box(x: number, y: number, z: number, w: number, d: number, h: number, stroke?: string) {
    const st = stroke ?? this.t.line;
    this.poly([[x, y + d, z + h], [x + w, y + d, z + h], [x + w, y + d, z], [x, y + d, z]], { fill: this.t.sideL, stroke: st });
    this.poly([[x + w, y, z + h], [x + w, y + d, z + h], [x + w, y + d, z], [x + w, y, z]], { fill: this.t.sideR, stroke: st });
    this.poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], { stroke: st });
  }

  /** Text lying on a top face, reading along +x. */
  textTop(x: number, y: number, z: number, txt: string, o: { size: number; fill: string; anchor?: string; weight?: number; ls?: number }) {
    const [e, g] = this.p(x, y, z);
    const k = this.k;
    this.out.push(
      `<text transform="matrix(${(C * k).toFixed(4)},${(S * k).toFixed(4)},${(-C * k).toFixed(4)},${(S * k).toFixed(4)},${n(e)},${n(g)})" font-family="${this.t.mono}" font-size="${o.size}" font-weight="${o.weight ?? 500}" letter-spacing="${o.ls ?? 0.6}" fill="${o.fill}" text-anchor="${o.anchor ?? "start"}">${txt}</text>`,
    );
  }

  /** A flat mono label in screen space; it counts toward the frame so nothing is clipped. */
  label(sx: number, sy: number, txt: string, fill?: string) {
    const size = 10;
    const w = txt.replace("&amp;", "&").length * (size * 0.6 + 1.1);
    this.grow(sx, sy - size * 0.8);
    this.grow(sx + w, sy + 2);
    this.out.push(
      `<text x="${n(sx)}" y="${n(sy)}" font-family="${this.t.mono}" font-size="${size}" letter-spacing="1.1" fill="${fill ?? this.t.muted}">${txt}</text>`,
    );
  }

  raw(s: string) {
    this.out.push(s);
  }

  check(cx: number, cy: number, r: number) {
    this.grow(cx - r, cy - r);
    this.grow(cx + r, cy + r);
    const c = this.t.accent;
    this.raw(
      `<circle cx="${n(cx)}" cy="${n(cy)}" r="${r}" fill="${this.t.ground}" stroke="${c}" stroke-width="1.25"/>` +
        `<path d="M${n(cx - r * 0.42)} ${n(cy + r * 0.02)} l${n(r * 0.3)} ${n(r * 0.3)} l${n(r * 0.56)} ${n(-r * 0.6)}" fill="none" stroke="${c}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    );
  }

  dot(cx: number, cy: number, r: number, color: string) {
    this.raw(`<circle cx="${n(cx)}" cy="${n(cy)}" r="${r}" fill="${color}"/>`);
  }

  /** Inner SVG markup: the caption top left, everything else centred in the area below it. */
  render(title: string, w = 300, h = 230, area = [14, 50, 286, 222]) {
    const [x0, y0, x1, y1] = this.bb;
    const [ax0, ay0, ax1, ay1] = area;
    const sc = Math.min(1, (ax1 - ax0) / (x1 - x0), (ay1 - ay0) / (y1 - y0));
    const dx = (ax0 + ax1) / 2 - (sc * (x0 + x1)) / 2;
    const dy = (ay0 + ay1) / 2 - (sc * (y0 + y1)) / 2;
    const cap = this.caption
      ? `<text x="16" y="24" font-family="${this.t.mono}" font-size="10.5" letter-spacing="1.1" fill="${this.t.muted}">${this.caption}</text>`
      : "";
    return {
      title,
      viewBox: `0 0 ${w} ${h}`,
      inner: `<title>${title}</title>${cap}<g transform="translate(${n(dx)} ${n(dy)}) scale(${sc.toFixed(4)})">${this.out.join("")}</g>`,
    };
  }
}

function policy(t: Theme) {
  const iso = new Iso(150, 100, t, 1.3);
  iso.box(-8, 10, 0, 74, 98, 2);
  iso.box(0, 0, 5, 74, 98, 2);
  const z = 7;
  [34, 58, 50, 0, 56, 44, 60, 30].forEach((L, i) => {
    const yy = 12 + i * 10.5;
    if (i === 0) return iso.line([9, yy, z], [9 + L, yy, z], { sw: 2.2 });
    if (i === 3) {
      /* the line that carries a limit: "Hotels up to $350 a night" */
      iso.line([9, yy, z], [27, yy, z]);
      iso.poly([[30, yy - 4.2, z], [52, yy - 4.2, z], [52, yy + 4.2, z], [30, yy + 4.2, z]], { fill: t.accentFill, stroke: t.accent });
      iso.textTop(41, yy + 2.3, z, "$350", { size: 6.4, fill: t.accent, anchor: "middle", weight: 600, ls: 0.2 });
      return iso.line([55, yy, z], [65, yy, z]);
    }
    iso.line([9, yy, z], [9 + L, yy, z], { stroke: t.faint });
  });
  iso.caption = "T&amp;E POLICY 2026.PDF";
  const [a, b] = iso.p(52, 12 + 3 * 10.5, z);
  iso.raw(`<polyline points="${n(a)},${n(b)} ${n(a + 44)},${n(b - 44)} ${n(a + 62)},${n(b - 44)}" fill="none" stroke="${t.accent}" stroke-width="1"/>`);
  iso.dot(a, b, 2, t.accent);
  iso.label(a + 67, b - 47, "HOTELS", t.text);
  iso.label(a + 67, b - 32, "$350 A NIGHT");
  return iso.render("Your travel and expense policy, with the hotel limit highlighted");
}

function rules(t: Theme) {
  const iso = new Iso(110, 160, t, 1.25);
  const [W, D, H] = [70, 34, 5];
  const zs = [0, 30, 60];
  const codes = ["T-004", "M-041", "L-007"];
  for (const [x, y] of [[0, 0], [W, 0], [W, D], [0, D]]) iso.line([x, y, zs[0] + H], [x, y, zs[2]], { stroke: t.faint, dash: "2 3" });
  zs.forEach((z, i) => {
    const top = i === zs.length - 1;
    iso.box(0, 0, z, W, D, H, top ? t.accent : undefined);
    if (top) iso.poly([[0, 0, z + H], [W, 0, z + H], [W, D, z + H], [0, D, z + H]], { fill: t.accentFill, stroke: t.accent });
    iso.textTop(11, D / 2 + 2.6, z + H, codes[i], { size: 8.5, fill: top ? t.accent : t.text, weight: 600, ls: 0.8 });
  });
  const [cx, cy] = iso.p(W, 0, zs[2] + H);
  iso.raw(`<polyline points="${n(cx + 2)},${n(cy + 2)} ${n(cx + 28)},${n(cy + 2)}" fill="none" stroke="${t.accent}" stroke-width="1"/>`);
  iso.check(cx + 38, cy + 2, 8);
  iso.label(cx + 52, cy - 2, "APPROVED", t.text);
  iso.label(cx + 52, cy + 13, "BY A PERSON");
  iso.caption = "DRAFTED FROM YOUR POLICY";
  return iso.render("Three rules drafted from the policy, the top one approved");
}

function check(t: Theme) {
  const iso = new Iso(100, 100, t, 1.25);
  iso.box(-30, 0, 0, 200, 34, 3);
  for (let x = -22; x < 168; x += 14) iso.line([x, 3, 3], [x, 31, 3], { stroke: t.faint });
  const gx = 78;
  iso.box(gx, -6, 3, 5, 5, 58);
  iso.poly([[gx + 2.5, -1, 3], [gx + 2.5, 35, 3], [gx + 2.5, 35, 58], [gx + 2.5, -1, 58]], { fill: t.accentFill, stroke: "none" });
  /* a card about to pass */
  iso.box(10, 6, 3, 40, 24, 2);
  iso.poly([[16, 10, 5], [24, 10, 5], [24, 16, 5], [16, 16, 5]]);
  iso.line([16, 22, 5], [40, 22, 5], { stroke: t.faint });
  /* the receipt in the gate */
  iso.box(gx - 14, 5, 3, 30, 26, 2, t.accent);
  for (let i = 0; i < 4; i++) iso.line([gx - 8, 10 + i * 4.5, 5], [gx + 8 - (i % 2) * 6, 10 + i * 4.5, 5], { stroke: t.accent, op: 0.7 });
  iso.line([gx + 2.5, -1, 30], [gx + 2.5, 35, 30], { stroke: t.accent, sw: 1.4 });
  iso.box(gx, 34, 3, 5, 5, 58);
  iso.box(gx, -6, 61, 5, 45, 5);
  /* a booking that has cleared */
  iso.box(122, 6, 3, 38, 22, 2);
  iso.line([134, 6, 5], [134, 28, 5], { stroke: t.faint, dash: "1.5 2" });
  iso.line([138, 12, 5], [154, 12, 5], { stroke: t.faint });
  iso.line([138, 17, 5], [150, 17, 5], { stroke: t.faint });
  const [cx, cy] = iso.p(160, 6, 5);
  iso.check(cx + 4, cy - 10, 6.5);
  iso.caption = "CARD SWIPE, RECEIPT, BOOKING";
  return iso.render("A card swipe, a receipt and a booking passing through the policy check");
}

function sorted(t: Theme) {
  const iso = new Iso(100, 120, t, 1.2);
  for (let i = 0; i < 9; i++) iso.box(0, 0, i * 4.2, 54, 38, 2.2);
  const zt = 8 * 4.2 + 2.2;
  iso.poly([[14, 12, zt], [40, 12, zt], [40, 26, zt], [14, 26, zt]], { fill: t.accentFill, stroke: t.accent });
  const [e0, g0] = iso.p(27, 19, zt);
  iso.raw(`<path d="M${n(e0 - 5)} ${n(g0)} l3.5 3 l7 -6" fill="none" stroke="${t.accent}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`);
  /* the finance tray, with two exceptions raised above it */
  const [tx, ty] = [92, -18];
  iso.box(tx, ty, 0, 50, 40, 3);
  iso.box(tx, ty, 3, 50, 3, 7);
  iso.box(tx, ty, 3, 3, 40, 7);
  [16, 32].forEach((z, i) => {
    iso.line([tx + 25, ty + 20, 10], [tx + 25, ty + 20, z], { stroke: t.faint, dash: "2 3" });
    iso.box(tx + 8, ty + 8 + i * 2, z, 34, 22, 2);
    const [e, g] = iso.p(tx + 14, ty + 14 + i * 2, z + 2);
    iso.dot(e, g, 2.6, t.warn);
  });
  iso.caption = "SORTED AS IT HAPPENS*";
  const [a, b] = iso.p(0, 38, 0);
  iso.label(a - 58, b + 14, "FILED", t.text);
  iso.label(a - 58, b + 29, "THE REST");
  const [e, g] = iso.p(tx + 42, ty + 10, 34);
  iso.raw(`<polyline points="${n(e)},${n(g)} ${n(e + 12)},${n(g - 30)}" fill="none" stroke="${t.faint}" stroke-width="1"/>`);
  iso.label(e - 30, g - 50, "TO FINANCE", t.text);
  iso.label(e - 30, g - 35, "WITH THE RULE");
  return iso.render("Cleared charges filed in a stack, two exceptions raised to finance");
}

export function howDrawings(t: Theme = NIGHT) {
  return [policy(t), rules(t), check(t), sorted(t)];
}
