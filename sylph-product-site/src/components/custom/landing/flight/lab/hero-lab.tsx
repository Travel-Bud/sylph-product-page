"use client";

/**
 * /dev/hero — the paper-flight workbench (never ships; the route 404s in
 * production). Renders the hero's stage structure and the SHARED QueuePanel
 * with landing.css, so everything tuned here transfers 1:1 to the hero.
 *
 * Phase 2: the full breath. 19 rows capture into one atlas; the orchestrator
 * builds the master timeline (shiver → 3 overlapping waves with backfill →
 * counter landings → exception shudders → collapse → handback); the leva
 * panel binds every FlightParams knob with live rebuild-preserving-progress
 * tuning; harnesses: A/B swap diff, determinism hashes, fps meter.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Canvas, useThree, type RootState } from "@react-three/fiber";
import {
  NoColorSpace,
  NoToneMapping,
  REVISION,
  WebGLRenderTarget,
  type PerspectiveCamera,
} from "three";
import { Leva, useControls, button } from "leva";
import { gsap } from "@/components/custom/landing/gsap";
import { QueuePanel } from "../queue-panel";
import { captureRows, buildAtlas, type RowAtlas, type RowCapture } from "../capture";
import { FlightSheets, type SheetsApi } from "../hero-flight";
import { AuroraBgCanvas, type AuroraApi } from "../aurora-bg";
import { buildFlightTimeline, resetFlight, type FlightStage } from "../orchestrator";
import { createGustStore } from "../gust-store";
import { detectFlightTier, budgetFor, DESKTOP_BUDGET, type FlightCapabilities } from "../detect";
import { DEFAULT_PARAMS, type FlightParams } from "../params";

/* fov 50 → z = (h/2)/tan(25°): 1 world unit = 1 CSS px on the z=0 plane */
function PixelCamera() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);
  useEffect(() => {
    camera.fov = 50;
    const z = size.height / 2 / Math.tan((camera.fov * Math.PI) / 360);
    camera.position.set(0, 0, z);
    camera.near = z / 10;
    camera.far = z * 4;
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

type GlInfo = { dpr: number; context: string; colorSpace: string; toneMapping: string };
type DiffResult = { max: number; mean: number; pctOver2: number; w: number; h: number };
type FpsStats = { frames: number; avgMs: number; maxMs: number; over17: number };

const clone = (p: FlightParams): FlightParams => JSON.parse(JSON.stringify(p));

export default function HeroLab() {
  const heroRef = useRef<HTMLDivElement>(null);
  const threeRef = useRef<RootState | null>(null);
  const sheetsRef = useRef<SheetsApi | null>(null);
  const auroraRef = useRef<AuroraApi | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const capturesRef = useRef<RowCapture[] | null>(null);
  const gustRef = useRef(createGustStore());
  const paramsRef = useRef<FlightParams>(clone(DEFAULT_PARAMS));
  const fpsBuf = useRef<number[]>([]);
  const lastTick = useRef(0);

  const [caps, setCaps] = useState<FlightCapabilities | null>(null);
  const [glInfo, setGlInfo] = useState<GlInfo | null>(null);
  const [atlas, setAtlas] = useState<RowAtlas | null>(null);
  const [capStatus, setCapStatus] = useState("waiting for fonts…");
  const [bgImg, setBgImg] = useState<HTMLImageElement | null>(null);
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [det, setDet] = useState<string | null>(null);
  const [fps, setFps] = useState<FpsStats | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => setCaps(detectFlightTier()), []);

  /* ------------------------------ capture -------------------------------- */

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const truth = hero.querySelector<HTMLElement>(".wq");
    if (truth) gsap.set(truth, { autoAlpha: 0 });
    const rows = Array.from(hero.querySelectorAll<HTMLElement>(".wq-before .wq-list .crow"));
    if (!rows.length) {
      setCapStatus("no rows found");
      return;
    }
    let dead = false;
    const t0 = performance.now();
    captureRows(rows, hero, (d, t) => !dead && setCapStatus(`capturing ${d}/${t}…`))
      .then((caps) => {
        if (dead) return;
        capturesRef.current = caps;
        const a = buildAtlas(caps);
        setAtlas(a);
        setCapStatus(
          `atlas ${a.canvas.width}×${a.canvas.height} · ${caps.length} rows @${a.pixelRatio}x in ${Math.round(performance.now() - t0)}ms`,
        );
      })
      .catch((err) => !dead && setCapStatus(`capture FAILED: ${err?.message ?? err}`));
    return () => {
      dead = true;
    };
  }, []);

  /* the aurora <img> becomes the ribbons' texture once decoded */
  useEffect(() => {
    const img = heroRef.current?.querySelector<HTMLImageElement>(".wh-bg > img, .wh-bg img");
    if (!img) return;
    const use = () => setBgImg(img);
    if (img.complete && img.naturalWidth) use();
    else img.decode().then(use).catch(use);
  }, []);

  /* ------------------------------ run control ---------------------------- */

  const stage = useCallback(
    (): FlightStage => ({
      root: heroRef.current!,
      sheets: sheetsRef.current!,
      gust: gustRef.current,
      bgAdvance: auroraRef.current ? (ms) => auroraRef.current!.advance(ms) : undefined,
      onTick: (tl) => {
        /* lab diagnostics only — wall clock never feeds flight state */
        if (tl.isActive()) {
          const now = performance.now();
          if (lastTick.current) fpsBuf.current.push(now - lastTick.current);
          lastTick.current = now;
        }
      },
      onComplete: () => flushFps(),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /** reset to rest, rebuild the timeline from rested measurements */
  const buildRun = useCallback(() => {
    if (!sheetsRef.current || !heroRef.current) return null;
    tlRef.current?.kill();
    const st = stage();
    resetFlight(st);
    const run = buildFlightTimeline(st, paramsRef.current);
    tlRef.current = run.tl;
    return run.tl;
  }, [stage]);

  const play = useCallback(() => {
    const tl = buildRun();
    if (!tl) return;
    fpsBuf.current = [];
    lastTick.current = 0;
    tl.play(0);
  }, [buildRun]);

  const scrub = useCallback(
    (v: number) => {
      let tl = tlRef.current;
      if (!tl) tl = buildRun();
      if (!tl || tl.isActive()) return;
      tl.progress(v);
    },
    [buildRun],
  );

  /** live param change: update materials now; rebuild geometry-scope state
      while preserving the current scrub position */
  const rebuildTimer = useRef(0);
  const onParamChange = useCallback(() => {
    sheetsRef.current?.updateParams(paramsRef.current);
    auroraRef.current?.updateParams(paramsRef.current);
    window.clearTimeout(rebuildTimer.current);
    rebuildTimer.current = window.setTimeout(() => {
      const tl = tlRef.current;
      if (tl?.isActive()) return; // don't yank a running take — next play picks it up
      const prev = tl ? tl.progress() : 0;
      const next = buildRun();
      next?.progress(prev);
    }, 180);
  }, [buildRun]);

  const flushFps = useCallback(() => {
    const buf = fpsBuf.current;
    if (buf.length > 10) {
      const frames = buf.length;
      const avgMs = buf.reduce((a, b) => a + b, 0) / frames;
      setFps({
        frames,
        avgMs: +avgMs.toFixed(2),
        maxMs: +Math.max(...buf).toFixed(1),
        over17: buf.filter((d) => d > 17).length,
      });
    }
    fpsBuf.current = [];
    lastTick.current = 0;
  }, []);

  useEffect(() => {
    if (ready) buildRun();
  }, [ready, buildRun]);

  /* ------------------------------ harnesses ------------------------------ */

  /** FNV-1a over a subsampled full-frame readback — the determinism fingerprint */
  const hashFrame = useCallback((): number => {
    const three = threeRef.current;
    if (!three) return 0;
    const { gl: renderer, scene, camera, size } = three;
    const dpr = renderer.getPixelRatio();
    const W = Math.round(size.width * dpr);
    const H = Math.round(size.height * dpr);
    const rt = new WebGLRenderTarget(W, H, { samples: 4, colorSpace: NoColorSpace });
    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    const buf = new Uint8Array(W * H * 4);
    renderer.readRenderTargetPixels(rt, 0, 0, W, H, buf);
    renderer.setRenderTarget(null);
    rt.dispose();
    let h = 0x811c9dc5;
    for (let i = 0; i < buf.length; i += 64) {
      h ^= buf[i];
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h;
  }, []);

  const runDeterminism = useCallback(async () => {
    setDet("running…");
    const targets = [0.2, 0.4, 0.6, 0.8];
    /* two INDEPENDENT reset→rebuild→measure→precompute runs, sampled at
       exact progress points — the full replay path, no wall clock anywhere */
    const once = (): number[] => {
      const tl = buildRun();
      if (!tl) return [];
      return targets.map((t) => {
        tl.progress(t); // fires onUpdate → advance → deterministic render
        return hashFrame();
      });
    };
    const a = once();
    await new Promise((r) => setTimeout(r, 50));
    const b = once();
    const ok = a.length === targets.length && a.every((h, i) => h === b[i]);
    const msg = ok
      ? `GREEN — ${a.map((h) => h.toString(16).slice(0, 6)).join(" ")}`
      : `RED — run A ${a.map((h) => h.toString(16).slice(0, 6)).join(" ")} vs run B ${b
          .map((h) => h.toString(16).slice(0, 6))
          .join(" ")}`;
    setDet(msg);
    document.title = `HL-DET ${ok ? "GREEN" : "RED"}`;
    buildRun();
    return ok;
  }, [buildRun]);

  /** A/B swap fidelity for sheet 0, instanced path (readback vs capture) */
  const runAbDiff = useCallback((): DiffResult | { error: string } => {
    const three = threeRef.current;
    const cap = capturesRef.current?.[0];
    const sheets = sheetsRef.current;
    const hero = heroRef.current;
    if (!three || !cap || !sheets || !hero) return { error: "not ready" };
    buildRun(); // rested layout
    const row = hero.querySelector<HTMLElement>(".wq-before .wq-list .crow")!;
    const rect = row.getBoundingClientRect();
    const cvRect = three.gl.domElement.getBoundingClientRect();
    const dpr = three.gl.getPixelRatio();
    /* snap the spawn to the device grid exactly like the orchestrator's math */
    const st = sheets.state[0];
    st.active = 1;
    st.phase = 0;
    row.style.visibility = "hidden";
    sheets.advance(0);

    const { gl: renderer, scene, camera, size } = three;
    const W = Math.round(size.width * dpr);
    const H = Math.round(size.height * dpr);
    const w = cap.canvas.width;
    const h = cap.canvas.height;
    const rt = new WebGLRenderTarget(W, H, { samples: 4, colorSpace: NoColorSpace });
    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    const x = Math.round((rect.left - cvRect.left) * dpr);
    const yTop = Math.round((rect.top - cvRect.top) * dpr);
    const glBuf = new Uint8Array(w * h * 4);
    renderer.readRenderTargetPixels(rt, x, H - yTop - h, w, h, glBuf);
    renderer.setRenderTarget(null);
    rt.dispose();

    const ref = cap.canvas.getContext("2d")!.getImageData(0, 0, w, h).data;
    let max = 0,
      sum = 0,
      over = 0;
    const samples = w * h * 4;
    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        const gi = ((h - 1 - r) * w + c) * 4;
        const ri = (r * w + c) * 4;
        const a = ref[ri + 3] / 255;
        for (let ch = 0; ch < 4; ch++) {
          const rv = ch < 3 ? ref[ri + ch] * a : ref[ri + 3];
          const d = Math.abs(glBuf[gi + ch] - rv);
          if (d > max) max = d;
          sum += d;
          if (d > 2) over++;
        }
      }
    }
    buildRun(); // restore rest
    const result: DiffResult = {
      max: +max.toFixed(1),
      mean: +(sum / samples).toFixed(4),
      pctOver2: +((over / samples) * 100).toFixed(3),
      w,
      h,
    };
    setDiff(result);
    document.title = `HL-AB max=${result.max} mean=${result.mean} pct=${result.pctOver2}`;
    return result;
  }, [buildRun]);

  /* cross-browser autorun: /dev/hero?ab=1 beacons to the report route */
  useEffect(() => {
    if (!ready || !location.search.includes("ab=1")) return;
    const id = window.setTimeout(() => {
      const r = runAbDiff();
      if ("error" in r) return;
      const browser = /firefox/i.test(navigator.userAgent)
        ? "firefox"
        : /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent)
          ? "safari"
          : "chrome";
      const q = new URLSearchParams({
        browser,
        max: String(r.max),
        mean: String(r.mean),
        pctOver2: String(r.pctOver2),
        size: `${r.w}x${r.h}`,
      });
      fetch(`/dev/hero/report?${q}`).catch(() => {});
    }, 800);
    return () => window.clearTimeout(id);
  }, [ready, runAbDiff]);

  const copyParams = useCallback(() => {
    const json = JSON.stringify(paramsRef.current, null, 2);
    console.log("FLIGHT PARAMS\n" + json);
    navigator.clipboard?.writeText(json).catch(() => {});
    fetch(`/dev/hero/report?params=${encodeURIComponent(JSON.stringify(paramsRef.current))}`).catch(
      () => {},
    );
  }, []);

  /* ------------------------------ leva ------------------------------------ */

  const P = paramsRef.current;
  const set = useCallback(
    <S extends keyof FlightParams>(section: S, key: keyof FlightParams[S]) =>
      (v: number | string) => {
        (paramsRef.current[section][key] as unknown) = v;
        onParamChange();
      },
    [onParamChange],
  );
  const num = (
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (v: number) => void,
  ) => ({ value, min, max, step, onChange });

  useControls("run", {
    play: button(() => play()),
    reset: button(() => {
      const tl = buildRun();
      tl?.progress(0);
    }),
    scrub: num(0, 0, 1, 0.001, (v) => scrub(v)),
    "A/B diff": button(() => runAbDiff()),
    determinism: button(() => void runDeterminism()),
    "copy params": button(() => copyParams()),
  });
  useControls("gust", {
    strength: num(P.gust.strength, 100, 1400, 5, set("gust", "strength")),
    attack: num(P.gust.attack, 0.05, 0.5, 0.01, set("gust", "attack")),
    peak: num(P.gust.peak, 0.04, 0.4, 0.01, set("gust", "peak")),
  });
  useControls("field", {
    noiseScale: num(P.field.noiseScale, 0.0005, 0.01, 0.0001, set("field", "noiseScale")),
    curlIntensity: num(P.field.curlIntensity, 0, 700, 5, set("field", "curlIntensity")),
    fieldTimeScale: num(P.field.fieldTimeScale, 0, 2.5, 0.05, set("field", "fieldTimeScale")),
    windAngleDeg: num(P.field.baseWindAngleDeg, -10, 60, 1, set("field", "baseWindAngleDeg")),
    climbBoostDeg: num(P.field.climbBoostDeg, 0, 60, 1, set("field", "climbBoostDeg")),
  });
  useControls("paper", {
    peelAmp: num(P.paper.peelAmp, 0, 80, 1, set("paper", "peelAmp")),
    bendAmp: num(P.paper.bendAmp, 0, 3, 0.05, set("paper", "bendAmp")),
    foldSharp: num(P.paper.foldSharp, 0, 1, 0.02, set("paper", "foldSharp")),
    foldAngle: num(P.paper.foldAngle, 0, 1.6, 0.02, set("paper", "foldAngle")),
    tumble: num(P.paper.tumble, 0, 2, 0.05, set("paper", "tumble")),
    waveAmp: num(P.paper.waveAmp, 0, 30, 0.5, set("paper", "waveAmp")),
    waveFreq: num(P.paper.waveFreq, 0.3, 4, 0.05, set("paper", "waveFreq")),
    rippleAmp: num(P.paper.rippleAmp, 0, 24, 0.5, set("paper", "rippleAmp")),
    rippleFreq: num(P.paper.rippleFreq, 0.5, 8, 0.1, set("paper", "rippleFreq")),
    twistAmp: num(P.paper.twistAmp, 0, 40, 1, set("paper", "twistAmp")),
    stiffnessMin: num(P.paper.stiffnessMin, 0, 1, 0.01, set("paper", "stiffnessMin")),
    stiffnessMax: num(P.paper.stiffnessMax, 0, 1, 0.01, set("paper", "stiffnessMax")),
    flutterAmp: num(P.paper.flutterAmp, 0, 1.6, 0.02, set("paper", "flutterAmp")),
    bankGain: num(P.paper.bankGain, 0, 1.2, 0.02, set("paper", "bankGain")),
    bodyRamp: num(P.paper.bodyRamp, 0, 1, 0.01, set("paper", "bodyRamp")),
  });
  useControls("pacing", {
    flightDuration: num(P.pacing.flightDuration, 1.2, 4, 0.05, set("pacing", "flightDuration")),
    waveGap: num(P.pacing.waveGap, 0.9, 2, 0.05, set("pacing", "waveGap")),
    liftSpacing: num(P.pacing.liftSpacing, 0.04, 0.3, 0.01, set("pacing", "liftSpacing")),
    staggerJitter: num(P.pacing.staggerJitter, 0, 0.3, 0.01, set("pacing", "staggerJitter")),
    backfillDur: num(P.pacing.backfillDur, 0.3, 0.85, 0.05, set("pacing", "backfillDur")),
    shiverDur: num(P.pacing.shiverDur, 0.3, 1.4, 0.05, set("pacing", "shiverDur")),
  });
  useControls("dissolve", {
    start: num(P.dissolve.start, 0.3, 0.9, 0.01, set("dissolve", "start")),
    edgeWidth: num(P.dissolve.edgeWidth, 0.05, 0.6, 0.01, set("dissolve", "edgeWidth")),
    erodeScale: num(P.dissolve.erodeScale, 0.5, 12, 0.1, set("dissolve", "erodeScale")),
    erodeElong: num(P.dissolve.erodeElong, 1, 8, 0.1, set("dissolve", "erodeElong")),
    trailBias: num(P.dissolve.trailBias, 0, 0.8, 0.02, set("dissolve", "trailBias")),
    huePull: num(P.dissolve.huePull, 0, 1, 0.02, set("dissolve", "huePull")),
    illum: num(P.dissolve.illum, 0, 0.8, 0.02, set("dissolve", "illum")),
    glowColor: { value: P.dissolve.glowColor, onChange: set("dissolve", "glowColor") },
  });
  useControls("exceptions+bg", {
    shudderAmp: num(P.exceptions.shudderAmp, 0, 16, 0.5, set("exceptions", "shudderAmp")),
    shudderFreq: num(P.exceptions.shudderFreq, 1, 6, 1, set("exceptions", "shudderFreq")),
    bgDrift: num(P.bg.drift, 0, 0.3, 0.01, set("bg", "drift")),
    bgFlowGain: num(P.bg.flowGain, 0, 1.2, 0.02, set("bg", "flowGain")),
    bgSwell: num(P.bg.swell, 0, 0.8, 0.02, set("bg", "swell")),
  });

  /* ------------------------------ gl setup -------------------------------- */

  const onCreated = (state: RootState) => {
    threeRef.current = state;
    const ctx = state.gl.getContext();
    setGlInfo({
      dpr: state.viewport.dpr,
      context:
        typeof WebGL2RenderingContext !== "undefined" && ctx instanceof WebGL2RenderingContext
          ? "webgl2"
          : "webgl1",
      colorSpace: String(state.gl.outputColorSpace),
      toneMapping: state.gl.toneMapping === NoToneMapping ? "none (flat)" : `#${state.gl.toneMapping}`,
    });
  };

  const onSheetsReady = useCallback((api: SheetsApi) => {
    sheetsRef.current = api;
    setReady(true);
  }, []);

  useEffect(() => {
    (window as unknown as Record<string, unknown>).__heroLab = {
      three: () => threeRef.current,
      tl: () => tlRef.current,
      params: () => paramsRef.current,
      play,
      scrub,
      reset: () => buildRun()?.progress(0),
      runAbDiff,
      runDeterminism,
      copyParams,
      aurora: () => auroraRef.current,
    };
  }, [play, scrub, buildRun, runAbDiff, runDeterminism, copyParams]);

  /* ------------------------------ markup ---------------------------------- */

  return (
    <>
      <div className="wh-hero on-night" data-anim="1" data-tier="gl" ref={heroRef}>
        <div className="wh-bg" aria-hidden="true">
          <Image src="/landing/aurora-hero.jpg" alt="" fill priority sizes="100vw" quality={82} />
          {bgImg && (
            <AuroraBgCanvas
              img={bgImg}
              gust={gustRef.current}
              params={paramsRef.current}
              onReady={(api) => {
                auroraRef.current = api;
              }}
            />
          )}
        </div>
        <div className="wh-veil" aria-hidden="true" />

        <div className="wrap wh-inner">
          <div className="wh-copy">
            <span className="ar-eyebrow">/dev/hero — flight lab · phase 2</span>
            <h1 className="ar-h1">
              The whole
              <br />
              <em>breath.</em>
            </h1>
            <p className="ar-sub">
              Three waves, nineteen sheets, one wind. Scrub it, play it, tune it — every knob on
              the right is a physical parameter. Nothing on this route ships.
            </p>
          </div>

          <div className="wh-stage">
            <div>
              <QueuePanel />
            </div>
          </div>
        </div>

        <div className="wh-flight-canvas" aria-hidden="true">
          <Canvas
            frameloop="never"
            flat
            dpr={[1, 2]}
            gl={{
              alpha: true,
              antialias: true,
              premultipliedAlpha: true,
              powerPreference: "high-performance",
            }}
            onCreated={onCreated}
          >
            <PixelCamera />
            {atlas && (
              <FlightSheets
                atlas={atlas}
                params={paramsRef.current}
                segments={DESKTOP_BUDGET.planeSegments}
                onReady={onSheetsReady}
              />
            )}
          </Canvas>
        </div>
      </div>

      {/* scroll runway: the flight must stay glued to the hero */}
      <section
        style={{
          minHeight: "140vh",
          background: "#060f0b",
          color: "#5d7a6c",
          fontFamily: "monospace",
          fontSize: 12,
          padding: "48px",
        }}
      >
        scroll runway — scrub mid-flight, then scroll: sheets stay glued to the hero.
      </section>

      <Leva collapsed={false} />
      <div
        style={{
          position: "fixed",
          left: 12,
          bottom: 12,
          zIndex: 60,
          padding: "10px 12px",
          background: "rgba(4, 10, 7, 0.82)",
          border: "1px solid rgba(244, 247, 245, 0.16)",
          borderRadius: 8,
          fontFamily: "monospace",
          fontSize: 11,
          lineHeight: 1.5,
          color: "#cfe8db",
          whiteSpace: "pre",
        }}
      >
        {[
          `hero flight lab · phase 2 — the whole breath`,
          `three r${REVISION}`,
          caps
            ? `tier ${caps.tier}${caps.mobileBudget ? " (mobile budget)" : ""} — ${caps.reason}`
            : `tier …probing`,
          caps
            ? `budget sheets=${budgetFor(caps).sheetTarget} waves=${budgetFor(caps).waveCount} dprCap=${budgetFor(caps).dprCap}`
            : ``,
          glInfo
            ? `gl ${glInfo.context} · dpr ${glInfo.dpr} · ${glInfo.colorSpace} · tone ${glInfo.toneMapping}`
            : `gl …creating`,
          `capture ${capStatus}`,
          ready ? `orchestrator ready — tl ${tlRef.current ? tlRef.current.duration().toFixed(1) + "s" : "…"}` : `orchestrator …waiting`,
          diff
            ? `A/B diff max=${diff.max} mean=${diff.mean} >2LSB=${diff.pctOver2}%`
            : `A/B diff — not run`,
          det ? `determinism ${det}` : `determinism — not run`,
          fps ? `play ${fps.frames}f avg=${fps.avgMs}ms max=${fps.maxMs}ms >17ms=${fps.over17}` : `play — not run`,
        ]
          .filter(Boolean)
          .join("\n")}
      </div>
    </>
  );
}
