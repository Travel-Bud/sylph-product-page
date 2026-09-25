/*
 * A split-flap board, by hand. Each cell holds four halves: the static top and bottom, and two leaves
 * that fall when the character changes (the old top folds down, then the new bottom folds into place).
 * The flip is a short CSS animation, so the board keeps its mechanical rhythm however fast the scrub
 * drives it; the characters themselves follow the scroll exactly.
 */
export class FlapBoard {
  private cells: { el: HTMLElement; ch: string; timer?: number }[];

  constructor(root: HTMLElement) {
    this.cells = Array.from(root.querySelectorAll<HTMLElement>(".fl")).map((el) => ({ el, ch: el.dataset.ch ?? " " }));
  }

  set(text: string) {
    this.cells.forEach((c, i) => {
      const ch = text[i] ?? " ";
      if (ch === c.ch) return;
      const [top, bottom, leafTop, leafBottom] = Array.from(c.el.children) as HTMLElement[];
      leafTop.textContent = c.ch;
      leafBottom.textContent = ch;
      top.textContent = ch;
      bottom.textContent = c.ch;
      c.ch = ch;
      c.el.classList.remove("is-flip");
      void c.el.offsetWidth;
      c.el.classList.add("is-flip");
      window.clearTimeout(c.timer);
      c.timer = window.setTimeout(() => {
        bottom.textContent = ch;
      }, 170);
    });
  }
}

/** The board's markup for a fixed-width string; spaces stay cells so the columns never move. */
export function flapCells(text: string) {
  return Array.from(text);
}
