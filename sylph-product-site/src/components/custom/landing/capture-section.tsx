"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  RevealHeading,
  Wisp,
  drawWisp,
  gsap,
  ScrollTrigger,
  useGSAP,
  EASE_REVEAL,
  MM_MOTION,
  START_GROUP,
  START_STAGE,
} from "./motion";
import { seeded } from "./wind-sweep";
import { LandingBird } from "./landing-bird";

/* The receipts fly only where the flight can be read: motion-ok, desktop. */
const MM_FLIGHT = "(prefers-reduced-motion: no-preference) and (min-width: 981px)";

/**
 * Capture: two doors in, one hairline-divided object. The idea of the
 * viewport: receipts arrive on their own — nobody chases anyone.
 *
 * The photographs carry atmosphere only (real light, real objects, no
 * screens asked to render UI); the product's moment lives in the DOM chips
 * on top of them, so every claim on screen is crisp and true. The section's
 * gesture is an ARRIVAL: a wisp of air delivers each vignette, the photo
 * settles, the chip lands, the proof dot pops.
 */
export function CaptureSection() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MM_MOTION, () => {
        const cards = gsap.utils.toArray<HTMLElement>(".cap-card", root);
        const wisps = gsap.utils.toArray<HTMLElement>(".cap-vis .lp-wisp", root);
        const photos = gsap.utils.toArray<HTMLElement>(".cap-vis img", root);
        const chips = gsap.utils.toArray<HTMLElement>(".cap-chip", root);
        const proof = root.querySelector(".cap-proof");
        const dot = root.querySelector(".cap-proof .dot");

        const tl = gsap.timeline({
          defaults: { ease: EASE_REVEAL },
          scrollTrigger: { trigger: ".cap-grid", start: START_STAGE, once: true },
        });

        /* the doors rise… */
        tl.from(cards, { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 0);
        /* …the air delivers: a wisp draws into each vignette as its photo settles */
        wisps.forEach((w, i) => drawWisp(w, tl, 0.45 + i * 0.1, 0.5));
        tl.from(photos, { scale: 1.045, duration: 1.1, stagger: 0.1 }, 0.45);
        /* …the receipt lands in the product: the chips arrive last */
        tl.from(chips, { y: 10, autoAlpha: 0, duration: 0.5, ease: "power2.out", stagger: 0.12 }, 0.95);
        /* …and the landing line closes the loop */
        tl.from(proof, { autoAlpha: 0, duration: 0.6, ease: "power2.out" }, 1.15);
        tl.from(dot, { scale: 0, duration: 0.3, ease: "back.out(1.7)" }, 1.3);

        /* the head's supporting line rises with everything else */
        const sub = root.querySelector(".ar-head .ar-sub");
        if (sub) {
          gsap.from(sub, {
            y: 14, autoAlpha: 0, duration: 0.8, ease: EASE_REVEAL,
            scrollTrigger: { trigger: sub, start: START_GROUP, once: true },
          });
        }
      });

      /* the intake: three receipts ride the prevailing current into the slot,
         each one processed into a row of data. Paper is transient (JS
         materializes it on the gust, like the wisp); the rows are the settled
         truth every static view sees. Desktop + motion only. */
      mm.add(MM_FLIGHT, () => {
        const intake = root.querySelector<HTMLElement>(".cap-intake");
        const stageEl = root.querySelector<HTMLElement>(".ci-stage");
        const slot = root.querySelector<HTMLElement>(".ci-slot");
        if (!intake || !stageEl || !slot) return;
        const rcpts = gsap.utils.toArray<HTMLElement>(".ci-rcpt", stageEl);
        const rows = gsap.utils.toArray<HTMLElement>(".ci-row", intake);
        const scan = stageEl.querySelector<HTMLElement>(".ci-scan");
        if (!rcpts.length || rows.length !== 3) return;

        gsap.set(rows, { autoAlpha: 0 });
        let tl: gsap.core.Timeline | null = null;

        const st = ScrollTrigger.create({
          trigger: intake,
          start: START_STAGE,
          once: true,
          onEnter: () => {
            /* the flight never performs to nobody */
            const box = intake.getBoundingClientRect();
            if (box.bottom < 0) {
              gsap.set(rows, { clearProps: "opacity,visibility" });
              return;
            }
            /* measured at play time — webfonts and layout are settled */
            const stR = stageEl.getBoundingClientRect();
            const slotR = slot.getBoundingClientRect();
            const xSlot = slotR.left + slotR.width / 2 - stR.left;
            const ySlot = slotR.top - stR.top;

            gsap.set(rcpts, { willChange: "transform", transformPerspective: 700 });
            tl = gsap.timeline({
              onComplete: () => {
                gsap.set(rcpts, { clearProps: "will-change" });
              },
            });
            drawWisp(stageEl.querySelector(".ci-wisp"), tl, 0, 0.55);

            rcpts.forEach((rc, i) => {
              const r = (k: number) => seeded(i + 20, k);
              const dir = i % 2 === 0 ? 1 : -1;
              const at = 0.25 + i * 0.5 + r(1) * 0.08;
              const w = rc.offsetWidth;
              /* every scrap rides in on the same current — from the left, at
                 its own height and depth, never against the wind */
              const x0 = stR.width * (0.02 + r(2) * 0.08);
              const y0 = -16 - r(3) * 28;
              tl!.set(rc, {
                x: x0, y: y0, rotation: -(8 + r(4) * 5), rotationY: dir * 7, scale: 1,
              }, at);
              tl!.to(rc, { autoAlpha: 1, duration: 0.2, ease: "power1.out" }, at);
              tl!.to(rc, {
                keyframes: [
                  /* caught: carried along the band, curling upright */
                  { x: x0 + (xSlot - x0) * 0.42, y: 14 + r(5) * 12,
                    rotation: -(2 + r(6) * 2), rotationY: -dir * 5,
                    duration: 0.42, ease: "power1.in" },
                  /* the crest: it leaves the stream above the slot */
                  { x: x0 + (xSlot - x0) * 0.82, y: -6 - r(7) * 10,
                    rotation: 2 + r(8) * 2, rotationY: dir * 4,
                    duration: 0.4, ease: "sine.out" },
                  /* falls out of the wind, into the mouth */
                  { x: xSlot - w / 2, y: ySlot - rc.offsetHeight * 0.35,
                    rotation: 0, rotationY: 0, scale: 0.5,
                    duration: 0.32, ease: "power2.in" },
                ],
              }, at + 0.05);
              /* swallowed… */
              tl!.to(rc, { autoAlpha: 0, duration: 0.13, ease: "power2.in" }, at + 1.1);
              /* …processed: one scan of light, then the claim exists as data */
              if (scan) {
                tl!.fromTo(scan, { xPercent: -110, autoAlpha: 1 },
                  { xPercent: 110, duration: 0.36, ease: "power1.inOut" }, at + 1.12);
                tl!.set(scan, { autoAlpha: 0 }, at + 1.5);
              }
              tl!.fromTo(rows[i], { autoAlpha: 0, y: 8 },
                { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" }, at + 1.3);
            });
          },
        });

        return () => {
          st.kill();
          tl?.kill();
          gsap.set([...rcpts, ...rows], { clearProps: "all" });
          if (scan) gsap.set(scan, { clearProps: "all" });
        };
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="ar-sec ar-sec--wash" id="capture" aria-labelledby="capture-h">
      <div className="wrap">
        <div className="ar-head">
          <RevealHeading className="ar-h2" delay={0}>
            <span id="capture-h">
              Receipts that arrive <em>on their own.</em>
            </span>
          </RevealHeading>
          <p className="ar-sub">
            The chase is the part of expenses everyone hates most: the crumpled paper, the
            photo backlog, the missing-receipt email. Sylph removes it.
          </p>
        </div>

        <div className="cap-grid">
          <div className="cap-card">
            <div className="cap-vis">
              <Image
                src="/landing/capture-tap.jpg"
                alt="A traveler tapping a corporate card on a payment terminal at a café counter"
                fill
                sizes="(max-width: 980px) 100vw, 560px"
                quality={82}
              />
              <Wisp />
              <div className="cap-chip" aria-hidden="true">
                <span className="k">terminal → Sylph</span>
                <b>$28.40 · card ·1142</b>
                <span className="ok-mark">receipt landed</span>
              </div>
            </div>
            <h3>Straight from the terminal</h3>
            <p>
              Pay at a tap-to-pay terminal and enter a work email on the keypad. The receipt
              flows from the point of sale into Sylph, already digital. It works with terminal
              providers like Toast. No photo. No upload.
            </p>
          </div>

          <div className="cap-card">
            <div className="cap-vis">
              <Image
                src="/landing/capture-text-in.jpg"
                alt="A traveler photographing a paper receipt with their phone to text it in"
                fill
                sizes="(max-width: 980px) 100vw, 560px"
                quality={82}
              />
              <Wisp />
              <div className="cap-chip" aria-hidden="true">
                <span className="k">receipt.jpg → Sylph</span>
                <b>Kitcho · ¥14,200</b>
                <span className="ok-mark">matched · card ·1142</span>
              </div>
            </div>
            <h3>Or text it in</h3>
            <p>
              Snap it, text it, done. Sylph reads the receipt, matches it to the card charge,
              and files it on the right report while the employee is still at the curb.
            </p>
          </div>

          <div
            className="cap-intake"
            role="img"
            aria-label="Receipts from both channels blow into Sylph and are matched to card charges automatically"
          >
            <div className="ci-stage" aria-hidden="true">
              <Wisp className="ci-wisp" />
              <Image className="ci-rcpt" src="/landing/receipt-cafe.png" alt="" width={480} height={723} />
              <Image className="ci-rcpt" src="/landing/receipt-kitcho.png" alt="" width={416} height={1358} />
              <Image className="ci-rcpt" src="/landing/receipt-taxi.png" alt="" width={480} height={698} />
              <div className="ci-slot">
                <span className="ci-mark">
                  <LandingBird />
                </span>
                <span className="ci-mouth" />
                <span className="ci-slot-label">Inbox · sample</span>
                <i className="ci-scan" />
              </div>
            </div>
            <div className="ci-rows" aria-hidden="true">
              <div className="ci-row">
                <span className="k">terminal</span>
                <b>$28.40</b>
                <span className="cat">Meals</span>
                <span className="ok-mark">matched · card ·1142</span>
              </div>
              <div className="ci-row">
                <span className="k">text</span>
                <b>¥14,200 → $95.62</b>
                <span className="cat">Meals</span>
                <span className="ok-mark">matched · card ·1142</span>
              </div>
              <div className="ci-row">
                <span className="k">text</span>
                <b>¥3,200 → $21.55</b>
                <span className="cat">Taxi</span>
                <span className="ok-mark">matched · card ·1142</span>
              </div>
            </div>
          </div>

          <div className="cap-proof">
            <span className="dot" aria-hidden="true" />
            <span>
              Either way, a receipt lands in Sylph once, <b>the last time anyone touches it.</b>{" "}
              The traveler&rsquo;s whole job: pay, and maybe text a photo.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
