"use client";

import { useEffect } from "react";

/**
 * The print head's controller. Nothing here moves the page; it reads the scroll and marks things.
 *  - Every .rcp-ln develops (is-burn) the moment it leaves the head at the bottom of the screen.
 *  - Every [data-cue] turns is-live once its top passes that fraction of the screen (stamps, the flash,
 *    the card feed docking, the pile sorting). Once live, it stays live.
 *  - [data-type] types itself out when its [data-cue] ancestor goes live (Priya writing her note).
 *  - [data-fade] gets --p, 0 to 1, as it crosses the screen (a year of thermal fade).
 *  - The head reads the scene on the paper ([data-log]).
 * Reduced motion: none of it runs; the CSS default is the settled end state.
 */
export function Printer() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".rcp");
    if (!root) return;
    const status = root.querySelector<HTMLElement>("[data-head-status]");
    const scenes = [...root.querySelectorAll<HTMLElement>("[data-log]")];
    const fades = [...root.querySelectorAll<HTMLElement>("[data-fade]")];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let introDone = reduce || window.scrollY > 40;
    const read = () => {
      raf = 0;
      const vh = window.innerHeight;
      if (status) {
        let log = scenes[0]?.dataset.log ?? "";
        for (const s of scenes) if (s.getBoundingClientRect().top < vh * 0.55) log = s.dataset.log ?? log;
        const text = introDone ? log : "PRINTING";
        if (status.textContent !== text) status.textContent = text;
      }
      if (!reduce)
        for (const f of fades) {
          const r = f.getBoundingClientRect();
          const p = Math.min(1, Math.max(0, (vh * 0.92 - r.top) / (vh * 0.62)));
          f.style.setProperty("--p", p.toFixed(3));
          const label = f.querySelector<HTMLElement>("[data-fade-when]");
          if (label) {
            const months = Math.round(p * 12);
            label.textContent = months === 0 ? "Sep 2026, today" : months === 12 ? "Sep 2027, a year in a drawer" : `${months} month${months === 1 ? "" : "s"} in a drawer`;
          }
        }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    if (reduce) {
      read();
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        cancelAnimationFrame(raf);
      };
    }

    root.classList.add("rcp--js");
    if (window.scrollY > 40) root.classList.add("rcp--nointro");
    const feed = root.querySelector<HTMLElement>(".rcp-feed");
    const onIntroEnd = (e: AnimationEvent) => {
      if (e.target !== feed) return;
      introDone = true;
      onScroll();
    };
    feed?.addEventListener("animationend", onIntroEnd);
    /* if the intro already ran before hydration (a slow first compile), the head reads the scene at once */
    const introTimer = window.setTimeout(() => {
      introDone = true;
      onScroll();
    }, 3200);

    const headH = parseFloat(getComputedStyle(root).getPropertyValue("--head-h")) || 56;
    const lip = window.innerHeight - headH;

    /* printing: develop each line as it leaves the head */
    const lines = [...root.querySelectorAll<HTMLElement>(".rcp-ln")];
    const printIo = new IntersectionObserver(
      (es) => {
        for (const e of es)
          if (e.isIntersecting) {
            e.target.classList.add("is-burn");
            printIo.unobserve(e.target);
          }
      },
      { rootMargin: `0px 0px -${headH}px 0px` },
    );
    for (const l of lines) {
      const r = l.getBoundingClientRect();
      /* already above the head at mount (and not moving in with the intro): printed, no developing */
      if (r.top < lip && root.classList.contains("rcp--nointro")) continue;
      printIo.observe(l);
    }

    /* cues */
    const typed = new WeakSet<Element>();
    const typeOut = (el: HTMLElement) => {
      if (typed.has(el)) return;
      typed.add(el);
      const full = el.dataset.type ?? el.textContent ?? "";
      const out = el.querySelector<HTMLElement>("[data-type-out]") ?? el;
      let i = 0;
      el.classList.add("is-typing");
      const tick = () => {
        i += 1;
        out.textContent = full.slice(0, i);
        if (i < full.length) timers.push(window.setTimeout(tick, full[i - 1] === "," ? 180 : 38 + Math.random() * 40));
        else el.classList.remove("is-typing");
      };
      out.textContent = "";
      timers.push(window.setTimeout(tick, 500));
    };
    const timers: number[] = [];
    const goLive = (el: HTMLElement) => {
      el.classList.add("is-live");
      el.querySelectorAll<HTMLElement>("[data-type]").forEach(typeOut);
    };
    const byFrac = new Map<number, HTMLElement[]>();
    root.querySelectorAll<HTMLElement>("[data-cue]").forEach((el) => {
      const f = Number(el.dataset.cue) || 0.62;
      byFrac.set(f, [...(byFrac.get(f) ?? []), el]);
    });
    const cueIos: IntersectionObserver[] = [];
    byFrac.forEach((els, f) => {
      const io = new IntersectionObserver(
        (es) => {
          for (const e of es)
            if (e.isIntersecting) {
              goLive(e.target as HTMLElement);
              io.unobserve(e.target);
            }
        },
        { rootMargin: `0px 0px -${Math.round((1 - f) * 100)}% 0px` },
      );
      els.forEach((el) => io.observe(el));
      cueIos.push(io);
    });

    read();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      feed?.removeEventListener("animationend", onIntroEnd);
      cancelAnimationFrame(raf);
      window.clearTimeout(introTimer);
      timers.forEach((t) => window.clearTimeout(t));
      printIo.disconnect();
      cueIos.forEach((io) => io.disconnect());
      root.classList.remove("rcp--js", "rcp--nointro");
    };
  }, []);
  return null;
}
