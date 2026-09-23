"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/components/custom/site/motion";

/*
 * The director: every move on the page, all of it caused by the story.
 *  - Panels open in reading order as they arrive (a wipe in the direction the eye travels, or a hard
 *    cut), then their captions are lettered in.
 *  - Cameras move with the scroll: the street pushes in on the only open door, the counter pans to
 *    Priya's hands, the cab pans with the city going by, Dana's desk pushes in on the laptop, month
 *    end pulls back from the circled 30 to Dana leaving on time. On the phone strip the wide shots
 *    pan instead, from the subject to what the subject is looking at.
 *  - The phone plays its exchange once, the cab note types itself, the queue files itself, and the
 *    Sushi Kanda ticket is handed across each gutter.
 * Everything runs inside a reduced-motion gate: without it the page is the settled story, as written.
 */

const WIPE: Record<string, string> = {
  down: "inset(0% 0% 100% 0%)",
  up: "inset(100% 0% 0% 0%)",
  right: "inset(0% 100% 0% 0%)",
  left: "inset(0% 0% 0% 100%)",
};

export function Director() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".cx");
    if (!root) return;
    const mm = gsap.matchMedia();

    mm.add({ motion: "(prefers-reduced-motion: no-preference)", strip: "(max-width: 760px)" }, (ctx) => {
      const { motion, strip } = ctx.conditions as { motion: boolean; strip: boolean };
      if (!motion) return;
      root.dataset.motion = "on";
      const all = <T extends Element = HTMLElement>(sel: string, el: ParentNode = root) => Array.from(el.querySelectorAll<T>(sel));
      const one = (sel: string, el: ParentNode = root) => el.querySelector<HTMLElement>(sel);
      /* Every demonstration starts as its element enters (ENTER) and lands within about a second, so a
         reader who stops on a panel never sees it empty, half faded or waiting for more scroll. */
      const ENTER = "top 90%";
      const once = (trigger: Element, start: string, tl: gsap.core.Timeline) =>
        ScrollTrigger.create({ trigger, start, once: true, onEnter: () => void tl.play() });

      /* 1. the cover letters its caption in as the page opens */
      const hero = one("[data-hero]");
      if (hero) {
        gsap.from(all("[data-cap]", hero), { y: 14, autoAlpha: 0, duration: 0.6, delay: 0.5, stagger: 0.15, ease: "power2.out" });
      }

      /* 2. panels open in reading order */
      for (const panel of all("[data-panel]")) {
        const wipe = panel.dataset.wipe ?? "down";
        if (wipe === "none") continue;
        const tl = gsap.timeline({ paused: true });
        if (wipe === "cut") {
          gsap.set(panel, { autoAlpha: 0 });
          tl.set(panel, { autoAlpha: 1 });
        } else {
          tl.fromTo(panel, { clipPath: WIPE[wipe] }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power3.inOut", clearProps: "clipPath" });
        }
        /* Dana's close-up letters his balloon on entry and its caption only once the exception is approved (step 7) */
        const caps = all("react" in panel.dataset ? ".cx-balloon" : "[data-cap]", panel);
        const sfx = all("[data-sfx]", panel);
        if (caps.length) tl.from(caps, { y: 12, autoAlpha: 0, duration: 0.35, stagger: 0.1, ease: "power2.out" }, wipe === "cut" ? 0.2 : 0.45);
        if (sfx.length) tl.from(sfx, { scale: 0.3, autoAlpha: 0, duration: 0.4, ease: "back.out(3)" }, "<0.1");
        once(panel, ENTER, tl);
      }

      /* 3. cameras, scrubbed to the scroll */
      for (const panel of all("[data-cam]")) {
        const cam = one(":scope > .cx-cam", panel);
        if (!cam) continue;
        const d = panel.dataset;
        const kind = strip && d.panM ? "pan" : d.cam;
        const s = Number(d.scale ?? 1.2);
        const origin = (strip && d.originM) || d.origin || "50% 50%";
        const st: ScrollTrigger.Vars = { trigger: panel, start: d.start ?? "top bottom", end: "bottom top", scrub: 0.6 };
        if (kind === "pan") {
          const [a, b] = ((strip ? d.panM : d.pan) ?? "0,0").split(",").map(Number);
          if (strip) gsap.fromTo(cam, { "--mx": `${a}%` }, { "--mx": `${b}%`, ease: "none", scrollTrigger: { ...st, end: "bottom 30%" } });
          else gsap.fromTo(cam, { xPercent: a, scale: s }, { xPercent: b, scale: s, ease: "none", scrollTrigger: st });
        } else if (kind === "push") {
          gsap.fromTo(cam, { scale: 1 }, { scale: s, transformOrigin: origin, ease: "none", scrollTrigger: st });
        } else if (kind === "pull") {
          gsap.fromTo(cam, { scale: s }, { scale: 1, transformOrigin: origin, ease: "none", scrollTrigger: { ...st, start: "top 90%", end: "center 45%" } });
        }
      }

      /* 4. the phone: the receipt goes out, the answer comes back */
      const phone = one("[data-phone]");
      if (phone) {
        const typing = one("[data-typing]", phone);
        const tl = gsap
          .timeline({ paused: true })
          .from(phone, { yPercent: 10, rotate: 5, duration: 0.55, ease: "power3.out" })
          .from(all('[data-msg="1"]', phone), { y: 22, autoAlpha: 0, duration: 0.3, ease: "power2.out" }, 0.1)
          .to(typing, { autoAlpha: 1, duration: 0.1 }, 0.4)
          .to(typing, { autoAlpha: 0, duration: 0.1 }, 0.7)
          .from(all('[data-msg="2"]', phone), { y: 16, scale: 0.94, autoAlpha: 0, transformOrigin: "0% 100%", duration: 0.35, ease: "back.out(1.7)" }, 0.75)
          .from(all("[data-sfx-late]"), { scale: 0.3, rotate: -20, autoAlpha: 0, duration: 0.45, ease: "back.out(3)" }, "<");
        once(phone, ENTER, tl);
      }

      /* 5. the cab: one line typed, then sent */
      const note = one("[data-note]");
      if (note) {
        const tl = gsap
          .timeline({ paused: true, delay: 0.2 })
          .fromTo(one(".cx-textnote-b", note), { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.75, ease: "steps(20)" })
          .from(one("[data-note-sent]", note), { y: 6, autoAlpha: 0, duration: 0.25 }, "+=0.1");
        once(note, ENTER, tl);
      }

      /* 6. the cut to morning is lettered, not faded */
      const cut = one("[data-cut]");
      if (cut) {
        const tl = gsap.timeline({ paused: true }).from(cut.children, { scale: 1.25, autoAlpha: 0, duration: 0.35, stagger: 0.2, ease: "back.out(2.2)" });
        once(cut, ENTER, tl);
      }

      /* 7. the queue: the exception lands as it enters and the filed rows tick themselves off. If the reader
         has not tapped Approve a few seconds later, or scrolls past, Dana taps it himself. */
      const queue = one("[data-queue]");
      let approveLater: gsap.core.Tween | null = null;
      if (queue) {
        const approve = () => void window.dispatchEvent(new Event("cx-approve"));
        const exc = one("[data-exc]", queue);
        if (exc) {
          const tl = gsap
            .timeline({ paused: true, onComplete: () => void (approveLater = gsap.delayedCall(2.4, approve)) })
            .from(exc, { y: 14, autoAlpha: 0, duration: 0.4, ease: "power3.out" });
          once(exc, ENTER, tl);
        }
        const ticks = all("[data-filed] .cx-tick", queue);
        const filed = one(".cx-filed", queue);
        if (filed && ticks.length) once(filed, ENTER, gsap.timeline({ paused: true }).from(ticks, { scale: 0, duration: 0.25, stagger: 0.08, ease: "back.out(3)" }));
        ScrollTrigger.create({ trigger: queue, start: "bottom 40%", once: true, onEnter: approve });
      }
      const react = one("[data-react]");
      let onApproved: (() => void) | null = null;
      if (react) {
        const caps = all(".cx-cap", react);
        gsap.set(caps, { autoAlpha: 0 });
        onApproved = () => void gsap.fromTo(caps, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, delay: 0.3, stagger: 0.2, ease: "back.out(2)" });
        window.addEventListener("cx-approved", onApproved, { once: true });
      }

      /* 8. the charge is handed across each gutter */
      for (const t of all("[data-ticket]")) {
        const g = t.parentElement as HTMLElement;
        const cs = getComputedStyle(t);
        const from = parseFloat(cs.getPropertyValue(strip ? "--mfrom" : "--from"));
        const to = parseFloat(cs.getPropertyValue(strip ? "--mto" : "--to"));
        gsap.fromTo(
          t,
          { x: () => ((from - to) / 100) * g.clientWidth, xPercent: -50, yPercent: -50, rotate: from < to ? -7 : 7 },
          { x: 0, xPercent: -50, yPercent: -50, rotate: from < to ? -2 : 2, ease: "power1.inOut", scrollTrigger: { trigger: g, start: "top 92%", end: "top 48%", scrub: 0.5, invalidateOnRefresh: true } },
        );
      }

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
      return () => {
        if (onApproved) window.removeEventListener("cx-approved", onApproved);
        approveLater?.kill();
        delete root.dataset.motion;
      };
    });

    return () => mm.revert();
  }, []);
  return null;
}
