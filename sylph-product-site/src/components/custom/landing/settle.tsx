"use client";

import { useEffect } from "react";

const IDLE_MS = 450;

/* The settle (Ben, 2026-10-06, after instalily.ai). The rests are where a [data-settle] section's top meets the top of
   the viewport, or its end meets the bottom (its top, when it is shorter than the viewport). When scrolling stops with
   a section boundary on screen, the page glides on to the next rest in the scroll's direction once the reader is past
   about halfway, or takes back a small overshoot; otherwise it stays put, and inside a tall section nothing moves.
   Desktop pointers only, never under reduced motion; any wheel, key, touch or pointer input cancels a glide, and it
   never runs while a form field has focus or text is selected. */
export function Settle() {
  useEffect(() => {
    const allowed = window.matchMedia("(pointer: fine) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    const sections = () => Array.from(document.querySelectorAll<HTMLElement>("[data-settle]"));
    let idle = 0;
    let raf = 0;
    let gliding = false;
    let from = window.scrollY; // where the page last came to rest

    const rest = (y: number) => {
      const h = window.innerHeight;
      const max = document.documentElement.scrollHeight - h;
      const tops = sections().map((el) => el.getBoundingClientRect().top + y);
      const rests: { at: number; top: boolean }[] = [];
      const put = (t: number, top: boolean) => rests.push({ at: Math.min(max, Math.max(0, Math.round(t))), top });
      for (let i = 1; i < tops.length; i++) {
        const b = tops[i];
        if (b <= y + 2 || b >= y + h - 2) continue;
        put(b, true);
        if (b - h > tops[i - 1]) put(b - h, false);
        else put(tops[i - 1], true);
      }
      // Only rests beyond where this scroll began, in its direction: finish the move once the reader is past about
      // halfway, or take back a small overshoot of a section's top. Anything else stays where the reader left it.
      const dir = Math.sign(y - from);
      let best: number | null = null;
      for (const r of rests) {
        if ((r.at - from) * dir <= 2) continue;
        const ahead = (r.at - y) * dir;
        const ok = ahead >= 0 ? ahead <= 0.55 * h : r.top && -ahead <= 0.2 * h;
        if (ok && (best === null || Math.abs(r.at - y) < Math.abs(best - y))) best = r.at;
      }
      return best;
    };

    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      gliding = false;
    };

    const glide = (to: number) => {
      const start = window.scrollY;
      const d = to - start;
      if (Math.abs(d) < 4) return;
      const ms = Math.min(700, Math.max(350, 300 + Math.abs(d) * 0.6));
      const t0 = performance.now();
      gliding = true;
      const frame = (now: number) => {
        if (!gliding) return;
        const k = Math.min(1, (now - t0) / ms);
        window.scrollTo({ top: start + d * (1 - Math.pow(1 - k, 3)), behavior: "instant" });
        if (k < 1) raf = requestAnimationFrame(frame);
        else stop();
      };
      raf = requestAnimationFrame(frame);
    };

    const onScroll = () => {
      if (gliding) return;
      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        const y = window.scrollY;
        const busy =
          !allowed.matches ||
          !!document.activeElement?.matches("input, textarea, select, [contenteditable]") ||
          !!window.getSelection()?.toString();
        const to = busy ? null : rest(y);
        from = to ?? y;
        if (to !== null) glide(to);
      }, IDLE_MS);
    };
    const onInput = () => {
      window.clearTimeout(idle);
      stop();
    };

    const inputs = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    window.addEventListener("scroll", onScroll, { passive: true });
    inputs.forEach((t) => window.addEventListener(t, onInput, { passive: true }));
    return () => {
      window.clearTimeout(idle);
      stop();
      window.removeEventListener("scroll", onScroll);
      inputs.forEach((t) => window.removeEventListener(t, onInput));
    };
  }, []);
  return null;
}
