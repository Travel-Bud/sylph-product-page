"use client";

import { useEffect } from "react";

/* The scroll scenes (2026-10-13; docs/plans/2026-10-13-scroll-scenes.md). Each [data-scene] is a tall track with a
   sticky stage (landing.css, "scroll scenes"). This writes the track's progress as --p, 0 at its top and 1 when its end
   meets the bottom of the viewport, at most once a frame, and seeks the stage's video[data-scrub] to the same point.
   Clips load into memory once their scene is near, so a seek never waits on the network; video[data-loop] plays on its
   own while its scene sits at the top. The tracks only exist when motion is allowed, so under reduced motion nothing
   here runs; with Save-Data the clips never load and the posters stay. */
export function Scenes() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".lp");
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const scenes = Array.from(root.querySelectorAll<HTMLElement>("[data-scene]"));
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    const urls: string[] = [];
    const wanted = new WeakMap<HTMLVideoElement, number>();
    const near = new Set<HTMLElement>();
    let raf = 0;

    const seek = (v: HTMLVideoElement) => {
      const t = wanted.get(v);
      if (t === undefined || v.seeking || v.readyState < 2 || Math.abs(v.currentTime - t) < 1 / 48) return;
      v.currentTime = t;
    };

    const load = (v: HTMLVideoElement) => {
      const src = v.dataset.src;
      if (!src || v.dataset.loading || saveData) return;
      v.dataset.loading = "1";
      v.muted = true;
      v.preload = "auto";
      const loop = v.hasAttribute("data-loop");
      v.addEventListener(loop ? "playing" : "loadeddata", () => (v.dataset.ready = ""), { once: true });
      if (!loop) {
        v.addEventListener("seeked", () => seek(v));
        v.addEventListener("loadeddata", () => seek(v));
      }
      const use = (url: string) => {
        v.src = url;
        v.load();
        if (loop) read();
      };
      fetch(src)
        .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
        .then((b) => {
          const url = URL.createObjectURL(b);
          urls.push(url);
          use(url);
        })
        .catch(() => use(src));
    };

    const read = () => {
      raf = 0;
      const h = window.innerHeight;
      for (const s of scenes) {
        const r = s.getBoundingClientRect();
        if (r.bottom < -h || r.top > 2 * h) continue;
        const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - h)));
        s.style.setProperty("--p", p.toFixed(4));
        s.querySelectorAll<HTMLVideoElement>("video[data-scrub]").forEach((v) => {
          if (!v.duration) return;
          wanted.set(v, p * Math.max(0, v.duration - 0.05));
          seek(v);
        });
        // A loop rests once its scene has scrolled on (the scrubbed clip has taken over) or left the screen.
        s.querySelectorAll<HTMLVideoElement>("video[data-loop]").forEach((v) => {
          if (!v.src) return;
          const run = p < 0.06 && r.bottom > 0;
          if (run && v.paused) v.play().catch(() => {});
          else if (!run && !v.paused) v.pause();
        });
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };

    // Load a scene's clips once it is within about a screen and a half; a scrubbed clip waits a beat behind a loop.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const s = e.target as HTMLElement;
          if (!e.isIntersecting || near.has(s)) continue;
          near.add(s);
          s.querySelectorAll<HTMLVideoElement>("video[data-loop]").forEach(load);
          const scrub = Array.from(s.querySelectorAll<HTMLVideoElement>("video[data-scrub]"));
          window.setTimeout(() => scrub.forEach(load), s.querySelector("video[data-loop]") ? 900 : 0);
        }
      },
      { rootMargin: "150% 0px" },
    );
    scenes.forEach((s) => io.observe(s));

    const dock = root.querySelector<HTMLElement>("[data-dock]");
    const measure = () => {
      // The hero's dashboard lands at a fixed height; its resting offset depends on how the headline wraps.
      if (dock) dock.closest<HTMLElement>("[data-scene]")?.style.setProperty("--dock-top", `${dock.offsetTop}px`);
      onScroll();
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      if (raf) cancelAnimationFrame(raf);
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);
  return null;
}
