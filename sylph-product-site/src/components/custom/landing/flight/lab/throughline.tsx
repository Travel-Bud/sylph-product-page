"use client";

/**
 * /dev/throughline — "The Current" concept lab (never ships; route 404s in prod).
 *
 * Sells the Sylph idea as one continuous river of light running DOWN the whole page:
 * everything you spend flows in, Sylph reads each one, the routine clears itself into
 * the stream (the "bullshit" carried off), and the current spits out only the few
 * verdicts that need a human. Real motion (curl-noise canvas), not depth-parallax.
 *
 * Carried objects are the real transparent cutouts from gen-asset.py:
 *   /landing/receipt-t1.png     (a receipt riding the current)
 *   /landing/paper-crumpled.png (the mess that gets cleared)
 */

import { useEffect, useRef } from "react";

/* ---------- the persistent river (canvas 2D curl-noise, flowing downward) ---------- */
function RiverCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, t = 0;
    let parts: { x: number; y: number; px: number; py: number; life: number }[] = [];

    const spawn = () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      px: 0, py: 0,
      life: 60 + Math.random() * 240,
    });

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(1600, Math.floor((w * h) / 1400));
      parts = Array.from({ length: count }, () => {
        const p = spawn();
        p.px = p.x; p.py = p.y;
        return p;
      });
      if (reduce) drawStatic();
    };

    // downward current with sinuous horizontal wander — a river, not a vortex
    const wander = (x: number, y: number, time: number) => {
      const nx = x * 0.0022, ny = y * 0.0016;
      return Math.sin(nx + time * 0.18) * 1.4 + Math.cos(ny * 1.4 - time * 0.10) * 1.0
        + Math.sin((nx + ny) * 0.8 + time * 0.04) * 0.7;
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      for (const p of parts) {
        let x = p.x, y = p.y, px = x, py = y;
        for (let s = 0; s < 30; s++) {
          const a = wander(x, y, 0);
          px = x; py = y;
          x += Math.sin(a) * 1.1;
          y += 1.4;
          ctx.strokeStyle = "rgba(95,220,166,0.10)";
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
        }
      }
    };

    const frame = () => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.028)"; // slower fade = longer, flowing streaks
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter"; // additive — streaks build into bright veins
      ctx.lineCap = "round";
      for (const p of parts) {
        const a = wander(p.x, p.y, t);
        p.px = p.x; p.py = p.y;
        p.x += Math.sin(a) * 2.4;   // stronger lateral curve = river meander, not rain
        p.y += 1.7;                 // downward drift = the current
        p.life--;
        if (p.life <= 0 || p.y > h + 20 || p.x < -30 || p.x > w + 30) {
          const n = spawn(); n.y = -10; n.x = Math.random() * w; n.px = n.x; n.py = n.y;
          Object.assign(p, n);
          continue;
        }
        const alpha = 0.42 * Math.min(1, p.life / 50);
        ctx.strokeStyle = `rgba(120,230,180,${alpha.toFixed(3)})`;
        ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(p.x, p.y); ctx.stroke();
      }
      t += 0.016;
      raf = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduce) raf = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onVis);
    if (!reduce) raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} className="tl-canvas" aria-hidden="true" />;
}

/* ---------- reveal-on-scroll: adds .in when a beat enters the viewport ---------- */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && el.classList.add("in")),
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Beat({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} className={`tl-beat ${className}`}>
      <div className="tl-beat-inner">{children}</div>
    </section>
  );
}

export default function Throughline() {
  return (
    <div className="tl-root">
      <div className="tl-backdrop" />
      <RiverCanvas />

      <div className="tl-flow">
        {/* Beat 1 — everything flows in */}
        <Beat className="b-hero">
          <p className="tl-eyebrow">The current</p>
          <h1 className="tl-h1">
            Everything you spend<br />flows through Sylph.
          </h1>
          <p className="tl-lede">
            214 charges landed this month. Watch what your team actually has to touch.
          </p>
          <img src="/landing/receipt-t1.png" alt="" className="tl-receipt r1" />
        </Beat>

        {/* Beat 2 — Sylph reads every one */}
        <Beat className="b-read">
          <div className="tl-line" />
          <h2 className="tl-h2">Sylph reads every one.</h2>
          <p className="tl-sub">Merchant, amount, date, policy — matched and checked as it lands.</p>
          <img src="/landing/receipt-t1.png" alt="" className="tl-receipt r2" />
          <span className="tl-chip chip-read">MATCHED · Oak &amp; Olive · $114.40</span>
        </Beat>

        {/* Beat 3 — the routine clears itself (the bullshit carried off) */}
        <Beat className="b-clear">
          <h2 className="tl-h2">211 clear themselves.</h2>
          <p className="tl-sub">In policy, cited, carried into the record. You never see them.</p>
          <div className="tl-mess">
            {[0, 1, 2, 3, 4].map((i) => (
              <img key={i} src="/landing/paper-crumpled.png" alt="" className={`tl-crumple c${i}`} />
            ))}
          </div>
          <span className="tl-count">211 cleared</span>
        </Beat>

        {/* Beat 4 — only the exceptions remain */}
        <Beat className="b-need">
          <h2 className="tl-h2">3 need you.</h2>
          <p className="tl-sub">The current spits out only what needs a human. Every verdict cites the rule.</p>
          <ul className="tl-verdicts">
            <li><b>M. Chen</b> · Kitcho, Osaka <span className="v amber">MEAL-03 · OVER CAP</span> <em>$95.62</em></li>
            <li><b>R. Alvarez</b> · Team dinner ×6 <span className="v amber">MEAL-01 · NOT ITEMIZED</span> <em>$612.00</em></li>
            <li><b>J. Park</b> · Delta seat upgrade <span className="v amber">FLT-02 · ABOVE CABIN</span> <em>$780.00</em></li>
          </ul>
          <a href="#" className="tl-cta">Book a demo →</a>
          <p className="tl-foot">book › capture › match › enforce › record</p>
        </Beat>
      </div>

      <style>{`
        .tl-root { position: relative; color: #e9f1eb; }
        .tl-backdrop {
          position: fixed; inset: 0; z-index: 0;
          background: radial-gradient(120% 80% at 70% 0%, #0a1c13 0%, #05100b 60%);
        }
        .tl-canvas { position: fixed; inset: 0; z-index: 1; pointer-events: none; opacity: 0.9; }
        .tl-flow { position: relative; z-index: 2; }

        .tl-beat { min-height: 100vh; display: grid; place-items: center; padding: 8vh 6vw; }
        .tl-beat-inner {
          position: relative; width: 100%; max-width: 900px;
          opacity: 0; transform: translateY(26px);
          transition: opacity 1s ease, transform 1s cubic-bezier(.2,.7,.2,1);
        }
        .tl-beat.in .tl-beat-inner { opacity: 1; transform: none; }

        .tl-eyebrow {
          font-family: ui-monospace, monospace; font-size: 0.72rem; letter-spacing: 0.24em;
          text-transform: uppercase; color: #5fdca6; margin: 0 0 1.2rem;
        }
        .tl-h1 {
          font-family: "Iowan Old Style", Palatino, Georgia, serif; font-weight: 600;
          font-size: clamp(2.6rem, 7vw, 5rem); line-height: 1.02; letter-spacing: -0.02em; margin: 0;
          text-shadow: 0 2px 40px rgba(0,0,0,.6);
        }
        .tl-h2 {
          font-family: "Iowan Old Style", Palatino, Georgia, serif; font-weight: 600;
          font-size: clamp(2rem, 5vw, 3.4rem); line-height: 1.05; letter-spacing: -0.015em; margin: 0;
        }
        .tl-lede, .tl-sub { font-size: clamp(1rem, 2vw, 1.25rem); color: #b9cabf; max-width: 42ch; margin: 1.2rem 0 0; line-height: 1.5; }

        /* riding receipts */
        .tl-receipt {
          position: absolute; width: clamp(120px, 14vw, 190px); filter: drop-shadow(0 20px 50px rgba(0,0,0,.5));
          animation: tl-bob 7s ease-in-out infinite;
        }
        .tl-receipt.r1 { right: -2%; top: 8%; transform: rotate(7deg); }
        .tl-receipt.r2 { right: 4%; bottom: 2%; width: clamp(110px,12vw,160px); transform: rotate(-6deg); animation-delay: -2s; }
        @keyframes tl-bob { 0%,100% { translate: 0 0; } 50% { translate: 0 -14px; } }

        .tl-line { position: absolute; left: -6vw; right: -6vw; top: 50%; height: 1px; background: linear-gradient(90deg, transparent, rgba(95,220,166,.5), transparent); }

        .tl-chip {
          display: inline-block; margin-top: 1.4rem; font-family: ui-monospace, monospace; font-size: 0.72rem;
          letter-spacing: 0.05em; padding: 0.4rem 0.7rem; border-radius: 7px;
          background: rgba(95,220,166,.12); color: #7fe6b8; border: 1px solid rgba(95,220,166,.28);
          opacity: 0; transform: translateY(8px); transition: all .7s ease .35s;
        }
        .tl-beat.in .tl-chip { opacity: 1; transform: none; }

        /* the mess that gets cleared */
        .tl-mess { position: absolute; inset: -10% -4% auto auto; right: 0; top: 0; width: min(46%, 460px); height: 120%; }
        .tl-crumple {
          position: absolute; width: clamp(70px, 8vw, 120px); opacity: 0.9;
          filter: drop-shadow(0 14px 30px rgba(0,0,0,.45)) brightness(.9);
          transition: opacity 1.1s ease, transform 1.3s cubic-bezier(.4,.1,.2,1);
        }
        .c0 { right: 4%;  top: 2%;  }
        .c1 { right: 34%; top: 20%; width: clamp(60px,6vw,90px); }
        .c2 { right: 12%; top: 40%; }
        .c3 { right: 40%; top: 58%; width: clamp(56px,5vw,84px); }
        .c4 { right: 8%;  top: 74%; }
        /* when in view, the mess is "cleared" — drifts down into the current and fades */
        .tl-beat.in .tl-crumple { opacity: 0; transform: translateY(220px) scale(.5) rotate(24deg); }
        .tl-beat.in .c1 { transition-delay: .12s; }
        .tl-beat.in .c2 { transition-delay: .05s; }
        .tl-beat.in .c3 { transition-delay: .18s; }
        .tl-beat.in .c4 { transition-delay: .1s; }
        .tl-count {
          display: inline-block; margin-top: 1.6rem; font-family: ui-monospace, monospace; font-size: 0.8rem;
          color: #7fe6b8; opacity: 0; transition: opacity .8s ease 1s;
        }
        .tl-count::before { content: "● "; }
        .tl-beat.in .tl-count { opacity: 1; }

        /* the exceptions */
        .tl-verdicts { list-style: none; padding: 0; margin: 2rem 0 0; display: grid; gap: 0.8rem; max-width: 620px; }
        .tl-verdicts li {
          display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap;
          padding: 0.9rem 1.1rem; border-radius: 12px;
          background: rgba(10,26,18,.66); border: 1px solid rgba(95,220,166,.16);
          backdrop-filter: blur(8px);
          opacity: 0; transform: translateX(-18px); transition: all .7s cubic-bezier(.2,.7,.2,1);
        }
        .tl-beat.in .tl-verdicts li { opacity: 1; transform: none; }
        .tl-beat.in .tl-verdicts li:nth-child(2) { transition-delay: .12s; }
        .tl-beat.in .tl-verdicts li:nth-child(3) { transition-delay: .24s; }
        .tl-verdicts b { color: #fff; font-weight: 600; }
        .tl-verdicts em { margin-left: auto; font-style: normal; font-variant-numeric: tabular-nums; color: #e9f1eb; }
        .tl-verdicts .v { font-family: ui-monospace, monospace; font-size: 0.64rem; letter-spacing: 0.05em; padding: 0.22rem 0.5rem; border-radius: 6px; }
        .v.amber { background: rgba(217,185,120,.16); color: #d9b978; }

        .tl-cta {
          display: inline-block; margin-top: 2.2rem; font-weight: 600; text-decoration: none;
          background: #5fdca6; color: #05100b; padding: 0.8rem 1.4rem; border-radius: 999px;
          transition: transform .2s ease; opacity: 0;
        }
        .tl-beat.in .tl-cta { opacity: 1; transition: opacity .7s ease .4s, transform .2s ease; }
        .tl-cta:hover { transform: translateY(-2px); }
        .tl-foot { margin-top: 1.4rem; font-family: ui-monospace, monospace; font-size: 0.7rem; letter-spacing: 0.1em; color: #7f978b; }

        @media (prefers-reduced-motion: reduce) {
          .tl-beat-inner, .tl-chip, .tl-crumple, .tl-verdicts li, .tl-cta, .tl-count { transition: none; }
          .tl-receipt { animation: none; }
        }
      `}</style>
    </div>
  );
}
