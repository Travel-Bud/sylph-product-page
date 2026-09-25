/*
 * A split-flap row, by hand. Started from Mock A's engine (mock/a/flap.ts) and rebuilt around the drum:
 * like a real board, each cell can only advance one character at a time through a fixed drum, so a cell
 * travels from what it shows to what it must show, one flap per step, and far targets take longer. That
 * spread is what makes a whole board settle in a cascade instead of all at once.
 *
 * Each cell holds four halves: the static top and bottom, and two leaves. A step folds the old top down
 * (leaf 1) and then the new bottom into place (leaf 2), both as Web Animations so no step forces a
 * reflow. Under reduced motion (or before start), `jump` swaps the text with no animation at all.
 */
export const DRUM = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$.-,";

type Cell = {
  el: HTMLElement;
  t: HTMLElement;
  b: HTMLElement;
  ft: HTMLElement;
  fb: HTMLElement;
  ch: string;
  target: string;
  next: number;
  anims: Animation[];
};

export class FlapRow {
  private cells: Cell[];
  private raf = 0;
  private step: number;
  /* each leaf takes just under half a step, so a step's two leaves finish before the next begins */
  private leaf: number;
  onSettle?: () => void;

  constructor(root: HTMLElement, step = 64) {
    this.step = step;
    this.leaf = Math.min(80, Math.floor(step / 2) - 1);
    this.cells = Array.from(root.querySelectorAll<HTMLElement>(".fl")).map((el) => {
      const [t, b, ft, fb] = Array.from(el.children) as HTMLElement[];
      const ch = el.dataset.ch ?? " ";
      return { el, t, b, ft, fb, ch, target: ch, next: 0, anims: [] };
    });
  }

  get text() {
    return this.cells.map((c) => c.ch).join("");
  }

  /** Show `text` at once, no flaps. */
  jump(text: string) {
    this.cells.forEach((c, i) => {
      const ch = text[i] ?? " ";
      c.anims.forEach((a) => a.cancel());
      c.ch = c.target = ch;
      c.t.textContent = c.b.textContent = ch;
    });
  }

  /** Drum every cell toward `text`. `delay(i)` staggers when each cell starts turning. */
  to(text: string, delay: (i: number) => number = () => 0) {
    const now = performance.now();
    this.cells.forEach((c, i) => {
      const ch = DRUM.includes(text[i] ?? " ") ? (text[i] ?? " ") : " ";
      if (c.target === ch && c.ch === ch) return;
      c.target = ch;
      c.next = Math.max(c.next, now + delay(i));
    });
    if (!this.raf) this.raf = requestAnimationFrame(this.tick);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.cells.forEach((c) => c.anims.forEach((a) => a.cancel()));
  }

  private tick = (now: number) => {
    let busy = false;
    for (const c of this.cells) {
      if (c.ch === c.target) continue;
      busy = true;
      if (now < c.next) continue;
      const from = c.ch;
      const to = DRUM[(DRUM.indexOf(from) + 1) % DRUM.length];
      this.flip(c, from, to);
      c.next = now + this.step;
    }
    if (busy) this.raf = requestAnimationFrame(this.tick);
    else {
      this.raf = 0;
      this.onSettle?.();
    }
  };

  private flip(c: Cell, from: string, to: string) {
    c.anims.forEach((a) => a.cancel());
    c.ch = to;
    c.ft.textContent = from;
    c.fb.textContent = to;
    c.t.textContent = to;
    c.b.textContent = from;
    const top = c.ft.animate(
      [
        { transform: "rotateX(0deg)", visibility: "visible" },
        { transform: "rotateX(-90deg)", visibility: "visible" },
      ],
      { duration: this.leaf, easing: "ease-in" },
    );
    const bottom = c.fb.animate(
      [
        { transform: "rotateX(90deg)", visibility: "visible" },
        { transform: "rotateX(0deg)", visibility: "visible" },
      ],
      { duration: this.leaf, delay: this.leaf, easing: "ease-out" },
    );
    bottom.onfinish = () => {
      if (c.ch === to) c.b.textContent = to;
    };
    c.anims = [top, bottom];
  }
}
