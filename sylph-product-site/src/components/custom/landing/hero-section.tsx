"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, SplitText, useGSAP, EASE_REVEAL, EASE_GUST, MM_MOTION } from "./motion";
import { seeded } from "./wind-sweep";

/* Wind runs only where it can be read: motion allowed, desktop widths. */
const MM_WIND = "(prefers-reduced-motion: no-preference) and (min-width: 981px)";

/**
 * Night hero on the aurora. Left: the pillar, verbatim. Right: the signature
 * moment — a glass review queue holds this month's charges; the wind builds
 * (the rows shiver), the streamlines cross the page and REACH the queue, and
 * only then are the compliant rows caught and carried out through the glass;
 * the tally falls 214 → 3; the three exceptions settle in front of the reader.
 *
 * Two layers, one truth: `.wq` (in flow) is the settled end state that
 * no-JS, reduced-motion, and mobile all see. `.wq-before` is an absolute
 * overlay that exists only while JS owns the wind. The wind never plays to
 * an empty room: if the stage is off-screen at play time it snaps to truth,
 * and a quiet "run it again" replays it — same 214, same 3, every time.
 */
export function HeroSection() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      /* entrance — all widths, motion allowed */
      mm.add(MM_MOTION, () => {
        const split = SplitText.create(".ar-h1", {
          type: "lines",
          mask: "lines",
          linesClass: "lp-line",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 112,
              duration: 1.05,
              ease: EASE_REVEAL,
              stagger: 0.1,
              delay: 0.25,
              onComplete: () => {
                gsap.set(self.lines, { clearProps: "willChange" });
              },
            }),
        });
        gsap
          .timeline({ defaults: { ease: EASE_REVEAL } })
          .from(".wh-bg", { autoAlpha: 0, scale: 1.06, duration: 1.6, ease: "power2.out" }, 0)
          .from(".wh-copy .ar-sub, .wh-ctas, .wh-note", { y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.55)
          .from(".wh-stage", { x: 36, autoAlpha: 0, duration: 1.15 }, 0.7)
          .from(".wh-foot", { autoAlpha: 0, duration: 0.9, ease: "power2.out" }, 1.0);

        /* scroll: the aurora sinks slower than the page; copy and foot ease out.
           force3D keeps these scrubbed layers promoted instead of churning. */
        gsap.to(".wh-bg", {
          yPercent: 14,
          ease: "none",
          force3D: true,
          scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to(".wh-inner, .wh-foot", {
          yPercent: -5,
          autoAlpha: 0.3,
          ease: "none",
          force3D: true,
          scrollTrigger: { trigger: root, start: "top top", end: "bottom 30%", scrub: true },
        });

        return () => split.revert();
      });

      /* the wind — desktop + motion only */
      mm.add(MM_WIND, () => {
        const before = root.querySelector<HTMLElement>(".wq-before");
        const truth = root.querySelector<HTMLElement>(".wq");
        const stage = root.querySelector<HTMLElement>(".wh-stage");
        if (!before || !truth || !stage) return;

        root.classList.add("can-anim");
        root.dataset.anim = "1";
        gsap.set(truth, { autoAlpha: 0 }); /* the glass overlay is translucent — hide the truth beneath it */
        let tl: gsap.core.Timeline | null = null;

        const crows = () => gsap.utils.toArray<HTMLElement>(".crow", before);
        const beforeKeeps = () => gsap.utils.toArray<HTMLElement>(".wq-row, .wq-foot", before);

        /* rewind the overlay to the full 214-pile so the wind can run again */
        const reset = () => {
          tl?.kill();
          tl = null;
          /* the overlay must be laid out BEFORE any clearProps: inside a
             display:none subtree GSAP measures transforms by temporarily
             reparenting the node and re-inserts it relative to ELEMENT
             siblings only — the tally's <b> would land after its text node
             and the header would read "of 214 214". No paint happens between
             these statements, so nothing flashes. */
          root.dataset.anim = "1";
          crows().forEach((c) => c.classList.remove("take"));
          gsap.set([...crows(), ...beforeKeeps(), before], { clearProps: "all" });
          gsap.set(
            [root.querySelector(".wh-wind"), ...gsap.utils.toArray<HTMLElement>(".wh-wind .gust", root)],
            { clearProps: "all" },
          );
          gsap.set(gsap.utils.toArray<HTMLElement>(".wq-row", truth), { clearProps: "backgroundColor" });
          const foot = before.querySelector<HTMLElement>(".wq-foot");
          if (foot) gsap.set(foot, { opacity: 0 });
          const count = before.querySelector<HTMLElement>(".wq-head .n b");
          if (count) {
            gsap.set(count, { clearProps: "all" }); /* pulse scale/color from the last run */
            count.textContent = "214";
          }
          const fill = before.querySelector<HTMLElement>(".wq-meter .fill");
          if (fill) {
            fill.classList.remove("done");
            fill.style.transform = "scaleX(1)";
          }
          gsap.set(truth, { autoAlpha: 0 });
        };

        /* hand the frame to the settled truth without theater */
        const snapToTruth = () => {
          gsap.set(truth, { autoAlpha: 1 });
          gsap.set(before, { autoAlpha: 0 });
          delete root.dataset.anim;
        };

        const play = () => {
          const rows = crows();
          const keeps = beforeKeeps();
          const truthKeeps = gsap.utils.toArray<HTMLElement>(".wq-row, .wq-foot", truth);
          const count = before.querySelector<HTMLElement>(".wq-head .n b");
          const wind = root.querySelector<HTMLElement>(".wh-wind");
          if (keeps.length !== truthKeeps.length) return snapToTruth();

          const deltas = keeps.map((el, i) => truthKeeps[i].offsetTop - el.offsetTop);
          const n = { v: 214 };

          gsap.set([...rows, ...keeps], { willChange: "transform" });
          tl = gsap.timeline({
            defaults: { ease: EASE_REVEAL },
            onComplete: () => {
              gsap.set([...rows, ...keeps], { clearProps: "will-change" });
              delete root.dataset.anim;
            },
          });

          /* 1 · the wind builds: the pile feels the gust before it hits */
          tl.to(rows, {
            x: 5,
            rotation: 0.25,
            duration: 0.34,
            ease: "sine.inOut",
            yoyo: true,
            repeat: 1,
            stagger: 0.03,
          }, 0);

          /* 2 · the streamlines cross the page and REACH the queue before any
                 row moves — the gust leads, the rows follow */
          if (wind) {
            tl.set(wind, { autoAlpha: 1 }, 0.4);
            wind.querySelectorAll<SVGPathElement>("path").forEach((p, i) => {
              const len = p.getTotalLength();
              tl!.fromTo(
                p,
                { strokeDasharray: `${len * 0.38} ${len}`, strokeDashoffset: len * 0.38 },
                { strokeDashoffset: -len, duration: 1.0, ease: "power1.out" },
                0.4 + i * 0.09,
              );
            });
            tl.to(wind, { autoAlpha: 0, duration: 0.5, ease: "power1.out" }, 1.9);
          }

          /* 3 · the compliant rows are caught, carried, gone — each one its
                 own scrap of paper. It lifts before it travels, curls into
                 the flight, arcs on decoupled channels, and dissolves only in
                 the last stretch — visibly leaving the glass (overflow opens
                 under [data-anim]) and exiting past the real frame edge, not
                 to a magic constant. Every value is seeded by row index, so
                 the replay button flies the exact same air: same 214, same 3. */
          const stageRect = stage.getBoundingClientRect();
          const exitBase = window.innerWidth - stageRect.left + 120;
          gsap.set(rows, { transformPerspective: 600 });
          rows.forEach((row, i) => {
            const r = (k: number) => seeded(i, k);
            const dir = r(0) > 0.5 ? 1 : -1;
            const counter = i % 3 === 2; /* every third scrap resists, then yields */
            const at = 0.8 + i * 0.11 + (r(1) - 0.5) * 0.07;
            const lift = 8 + r(2) * 10;
            const rise = 68 + r(3) * 58;
            const dist = exitBase + r(4) * 160;
            const dur = 0.78 + r(5) * 0.26;
            tl!.to(row, {
              keyframes: [
                /* catch: the gust gets under it — lift leads, travel lags */
                { x: 34 + r(6) * 18, y: -lift, scale: 1.02,
                  rotation: (counter ? -dir : dir) * (0.8 + r(7) * 0.7),
                  rotationY: dir * 3, duration: dur * 0.3, ease: "power1.in" },
                /* carry: up and along, curling, one flutter reversal */
                { x: dist * 0.52, y: -rise * 0.78, rotation: dir * (4 + r(8) * 3.5),
                  rotationY: -dir * (4 + r(9) * 3), rotationX: dir * 3,
                  duration: dur * 0.38, ease: "power1.inOut" },
                /* exit: accelerates out past the frame edge */
                { x: dist, y: -(rise + 18 + r(10) * 42), rotation: dir * (8 + r(11) * 4),
                  rotationY: dir * 6, rotationX: 0, duration: dur * 0.32, ease: EASE_GUST },
              ],
            }, at);
            tl!.to(row, { autoAlpha: 0, duration: 0.28, ease: "power2.in" }, at + dur * 0.66);
          });

          /* 4 · the tally falls in lockstep */
          tl.to(
            n,
            {
              v: 3,
              duration: 1.5,
              ease: "power2.inOut",
              onUpdate: () => {
                if (count) count.textContent = String(Math.round(n.v));
              },
            },
            0.8,
          );

          /* 4b · the landing: 3 hits, and the number breathes once in aurora */
          if (count) {
            tl.fromTo(count, { scale: 1 }, { scale: 1.07, duration: 0.14, ease: "power2.out" }, 2.26)
              .to(count, { scale: 1, duration: 0.3, ease: "power2.inOut" }, 2.4)
              .to(count, { color: "#58e8ad", duration: 0.12, ease: "power1.in" }, 2.26)
              .to(count, { color: "#f4f7f5", duration: 0.45, ease: "power1.out" }, 2.55);
          }

          /* 5 · what needs a person settles; the ledger closes up */
          tl.to(keeps, { y: (i: number) => deltas[i], duration: 0.85, stagger: 0.05 }, 1.7);
          tl.to(before.querySelector(".wq-foot"), { autoAlpha: 1, duration: 0.6 }, 2.05);
          tl.from(before.querySelector(".wq-foot .dot"), { scale: 0, duration: 0.35, ease: "back.out(1.7)" }, 2.15);
          tl.fromTo(
            before,
            { height: before.offsetHeight },
            { height: truth.offsetHeight, duration: 0.85, ease: EASE_REVEAL },
            1.7,
          );

          /* 6 · hand the frame back to the truth layer */
          tl.to(truth, { autoAlpha: 1, duration: 0.4, ease: "power1.out" }, "+=0.3");
          tl.to(before, { autoAlpha: 0, duration: 0.4, ease: "power1.out" }, "<");
        };

        /* first run: measured at play time (webfonts settled), and only if the
           stage can actually be seen — the wind never performs to nobody */
        const dc = gsap.delayedCall(2.1, () => {
          const r = stage.getBoundingClientRect();
          const visible = r.bottom > 0 && r.top < window.innerHeight * 0.9;
          if (visible) play();
          else snapToTruth();
        });

        /* replay: same inputs, same verdicts — determinism you can poke */
        const replayBtn = root.querySelector<HTMLButtonElement>(".wq-replay");
        const onReplay = () => {
          if (root.dataset.anim) return; /* already running */
          reset();
          play();
        };
        replayBtn?.addEventListener("click", onReplay);

        return () => {
          dc.kill();
          tl?.kill();
          replayBtn?.removeEventListener("click", onReplay);
          gsap.set(truth, { clearProps: "opacity,visibility" });
          delete root.dataset.anim;
          root.classList.remove("can-anim");
        };
      });
    },
    { scope: ref },
  );

  return (
    <header ref={ref} className="wh-hero on-night" id="top">
      <div className="wh-bg" aria-hidden="true">
        <Image src="/landing/aurora-hero.jpg" alt="" fill priority sizes="100vw" quality={82} />
      </div>
      <div className="wh-veil" aria-hidden="true" />

      {/* the wind field: invisible at rest, drawn only while it carries rows.
          TWO gusts, not one steady stream — each is a group of streamline
          pairs (wide faint body + bright thin core) that sweeps low-left to
          high-right and CURLS as it crests at the queue, the way wind is
          drawn by hand: the loop marks where the air bites the paper. Gust A
          takes the first four sheets; gust B, after a lull, takes the rest. */}
      <svg className="wh-wind" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g className="gust ga">
          <path className="body" d="M -80 470 C 260 455, 520 415, 780 350 C 920 315, 1010 288, 1058 240 C 1082 216, 1068 190, 1044 199 C 1024 207, 1032 234, 1066 240 C 1140 253, 1290 200, 1520 130" />
          <path className="core lead" d="M -80 470 C 260 455, 520 415, 780 350 C 920 315, 1010 288, 1058 240 C 1082 216, 1068 190, 1044 199 C 1024 207, 1032 234, 1066 240 C 1140 253, 1290 200, 1520 130" />
          <path className="body" d="M -80 560 C 240 545, 470 505, 720 435 C 850 398, 940 372, 992 322 C 1020 295, 1004 262, 976 272 C 952 281, 958 315, 1000 322 C 1082 336, 1230 268, 1520 180" />
          <path className="core" d="M -80 560 C 240 545, 470 505, 720 435 C 850 398, 940 372, 992 322 C 1020 295, 1004 262, 976 272 C 952 281, 958 315, 1000 322 C 1082 336, 1230 268, 1520 180" />
          <path className="body" d="M -80 655 C 260 640, 540 595, 800 520 C 960 474, 1120 420, 1250 372 C 1350 335, 1440 310, 1520 290" />
          <path className="core" d="M -80 655 C 260 640, 540 595, 800 520 C 960 474, 1120 420, 1250 372 C 1350 335, 1440 310, 1520 290" />
        </g>
        <g className="gust gb">
          <path className="body" d="M -80 620 C 300 605, 580 560, 830 485 C 950 449, 1030 415, 1068 366 C 1088 340, 1072 314, 1050 324 C 1030 333, 1038 362, 1074 367 C 1146 377, 1300 320, 1520 240" />
          <path className="core lead" d="M -80 620 C 300 605, 580 560, 830 485 C 950 449, 1030 415, 1068 366 C 1088 340, 1072 314, 1050 324 C 1030 333, 1038 362, 1074 367 C 1146 377, 1300 320, 1520 240" />
          <path className="body" d="M -80 705 C 320 690, 620 645, 880 565 C 1010 525, 1130 480, 1230 430 C 1330 380, 1420 345, 1520 320" />
          <path className="core" d="M -80 705 C 320 690, 620 645, 880 565 C 1010 525, 1130 480, 1230 430 C 1330 380, 1420 345, 1520 320" />
        </g>
      </svg>

      <div className="wrap wh-inner">
        <div className="wh-copy">
          <h1 className="ar-h1">
            Stop reviewing expenses.
            <br />
            Start reviewing <em>exceptions.</em>
          </h1>
          <p className="ar-sub">
            Sylph books travel inside your policy, catches receipts on their own, and checks
            every charge as it lands. The routine clears itself. Your team decides only what
            actually needs a decision.
          </p>
          <div className="wh-ctas">
            <Link href="/demo" className="btn btn-aurora btn-lg">
              Book a demo
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <a href="#capture" className="btn btn-glass btn-lg">
              See how it works
            </a>
          </div>
          <p className="wh-note">Configured in 15 minutes, from your own policy document.</p>
        </div>

        <div className="wh-stage">
          <div>
            {/* truth: the settled queue — what every static view sees */}
            <div
              className="wq"
              role="img"
              aria-label="Sample review queue: of 214 charges this month, 211 cleared themselves and three exceptions await review"
            >
              <div aria-hidden="true">
                <div className="wq-head">
                  <span className="t">
                    Needs review <small>· sample</small>
                  </span>
                  <span className="n">
                    <b>3</b> of 214
                  </span>
                </div>
                {/* the queue's depth, drawn: 214 charges wide, an amber
                    sliver left — the whole product in one hairline */}
                <div className="wq-meter">
                  <i className="fill" />
                </div>
                <div className="wq-row">
                  <div className="who">
                    <b>M. Chen</b>
                    <span>Kitcho · dinner, Osaka</span>
                  </div>
                  <span className="amt">$95.62</span>
                  <span className="rule">MEAL-03 · over cap</span>
                </div>
                <div className="wq-row">
                  <div className="who">
                    <b>R. Alvarez</b>
                    <span>Team dinner ×6</span>
                  </div>
                  <span className="amt">$612.00</span>
                  <span className="rule">MEAL-01 · not itemized</span>
                </div>
                <div className="wq-row">
                  <div className="who">
                    <b>J. Park</b>
                    <span>Delta · seat upgrade</span>
                  </div>
                  <span className="amt">$780.00</span>
                  <span className="rule">FLT-02 · above cabin</span>
                </div>
                <div className="wq-foot">
                  <span className="dot" />
                  <span>
                    <b>211 cleared themselves.</b> Sylph carried them off.
                  </span>
                </div>
              </div>
            </div>

            {/* before: the full pile — exists only while JS owns the wind */}
            <div className="wq-before" aria-hidden="true">
              <div className="wq-head">
                <span className="t">
                  Needs review <small>· sample</small>
                </span>
                <span className="n">
                  <b>214</b> of 214
                </span>
              </div>
              <div className="wq-meter">
                <i className="fill" />
              </div>
              <div className="crow">
                <span>ANA · SFO → KIX</span>
                <span className="amt2">$980.00</span>
                <span className="ok">cleared</span>
              </div>
              <div className="crow">
                <span>Hyatt Osaka · night 1</span>
                <span className="amt2">$352.86</span>
                <span className="ok">cleared</span>
              </div>
              <div className="wq-row">
                <div className="who">
                  <b>M. Chen</b>
                  <span>Kitcho · dinner, Osaka</span>
                </div>
                <span className="amt">$95.62</span>
                <span className="rule">MEAL-03 · over cap</span>
              </div>
              <div className="crow">
                <span>MK Taxi · Osaka</span>
                <span className="amt2">$21.55</span>
                <span className="ok">cleared</span>
              </div>
              <div className="crow">
                <span>Uber · SFO airport</span>
                <span className="amt2">$34.12</span>
                <span className="ok">cleared</span>
              </div>
              <div className="wq-row">
                <div className="who">
                  <b>R. Alvarez</b>
                  <span>Team dinner ×6</span>
                </div>
                <span className="amt">$612.00</span>
                <span className="rule">MEAL-01 · not itemized</span>
              </div>
              <div className="crow">
                <span>Marriott · Chicago</span>
                <span className="amt2">$418.75</span>
                <span className="ok">cleared</span>
              </div>
              <div className="wq-row">
                <div className="who">
                  <b>J. Park</b>
                  <span>Delta · seat upgrade</span>
                </div>
                <span className="amt">$780.00</span>
                <span className="rule">FLT-02 · above cabin</span>
              </div>
              <div className="crow">
                <span>Coffee · SFO T2</span>
                <span className="amt2">$6.80</span>
                <span className="ok">cleared</span>
              </div>
              <div className="wq-foot" style={{ opacity: 0 }}>
                <span className="dot" />
                <span>
                  <b>211 cleared themselves.</b> Sylph carried them off.
                </span>
              </div>
            </div>

            {/* determinism, poke-able: replays the wind on the same 214 and
                lands on the same 3. Rendered only where the wind can run. */}
            <button type="button" className="wq-replay">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              run it again — same 214, same 3
            </button>
          </div>
        </div>
      </div>

      <div className="wrap wh-foot">
        <span className="ar-scrollcue">
          <span className="ar-wheel" aria-hidden="true" />
          Scroll
        </span>
        <span className="ar-pipeline" aria-hidden="true">
          book &gt; capture &gt; match &gt; enforce &gt; record
        </span>
      </div>
    </header>
  );
}
