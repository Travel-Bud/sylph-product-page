"use client";

/**
 * The flight scene — one InstancedMesh of paper sheets on the pixel-mapped
 * camera, demand-rendered (frameloop="never"). The orchestrator's GSAP
 * timeline owns all state: it writes the mutable `SheetState[]` (gsap tweens
 * on plain objects — fully scrub-reversible) and calls `advance()` inside its
 * own tick, so DOM writes and GL frames land in the same rAF.
 */

import { useEffect, useMemo, useRef, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Euler, InstancedMesh, Matrix4, Quaternion, Vector3 } from "three";
import { seeded } from "../wind-sweep";
import { samplePath, sheetStiffness, type PathSample, type SheetPath } from "./flight-field";
import { atlasTexture, createSheetMaterial, sheetGeometry } from "./sheet-material";
import type { RowAtlas } from "./capture";
import type { FlightParams } from "./params";

export interface SheetState {
  /** 0|1 — written by gsap .set() at the lift label (scrub-reversible) */
  active: number;
  /** 0..1 flight phase — written by a gsap tween */
  phase: number;
  /** world coords of the sheet center at rest */
  spawn: { x: number; y: number };
  path: SheetPath | null;
}

export interface SheetsApi {
  count: number;
  state: SheetState[];
  /** render one frame at a virtual timestamp (deterministic, never wall clock) */
  advance(virtualMs: number): void;
  /** viewport rect (CSS px) → world coords of the rect CENTER */
  worldFromRect(rect: { left: number; top: number; width: number; height: number }): {
    x: number;
    y: number;
  };
  /** pixel-exact spawn for sheet i: rect top-left snapped to the DEVICE grid,
      extent taken from the sheet's TEXEL size — texels land exactly on render
      pixels, so the swap frame filters nothing */
  spawnFor(
    index: number,
    rect: { left: number; top: number },
  ): { x: number; y: number };
  canvasSize(): { width: number; height: number };
  canvasRect(): DOMRect | null;
  updateParams(p: FlightParams): void;
}

const M = new Matrix4();
const Q = new Quaternion();
const E = new Euler();
const V = new Vector3();
const SV = new Vector3(1, 1, 1);
const S0 = new Vector3(0, 0, 0);
const SAMPLE: PathSample = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 };

const smooth01 = (t: number) => {
  const c = Math.min(Math.max(t, 0), 1);
  return c * c * (3 - 2 * c);
};

export function FlightSheets({
  atlas,
  params,
  segments,
  onReady,
}: {
  atlas: RowAtlas;
  params: FlightParams;
  segments: [number, number];
  onReady: (api: SheetsApi) => void;
}) {
  const meshRef = useRef<InstancedMesh>(null);
  const three = useThree();
  const count = atlas.rects.length;

  const stateRef = useRef<SheetState[]>(
    Array.from({ length: count }, () => ({ active: 0, phase: 0, spawn: { x: 0, y: 0 }, path: null })),
  );
  const paramsRef = useRef(params);

  const built = useMemo(() => {
    const seeds = Array.from({ length: count }, (_, i) => seeded(i, 12));
    const stiffs = Array.from({ length: count }, (_, i) => sheetStiffness(i, paramsRef.current.paper));
    const { geometry, phaseAttr } = sheetGeometry(atlas, seeds, stiffs, segments);
    const mat = createSheetMaterial(atlasTexture(atlas), paramsRef.current);
    return { geometry, phaseAttr, mat };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atlas, count, segments]);

  useEffect(() => {
    const { geometry, mat } = built;
    return () => {
      const tex = mat.material.uniforms.uMap.value;
      mat.material.dispose();
      tex.dispose();
      geometry.dispose();
    };
  }, [built]);

  /* apply the mutable state to instances — runs once per advance() */
  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const st = stateRef.current;
    const phases = built.phaseAttr;
    for (let i = 0; i < count; i++) {
      const s = st[i];
      if (!s.active || !s.path) {
        M.compose(V.set(0, 0, -10), Q.identity(), S0);
        mesh.setMatrixAt(i, M);
        (phases.array as Float32Array)[i] = 0;
        continue;
      }
      samplePath(s.path, s.phase, SAMPLE);
      E.set(SAMPLE.rx, SAMPLE.ry, SAMPLE.rz);
      /* receding into the portal: once airborne the sheet gently shrinks —
         the coil reads as depth, so smaller means further in. A pure
         function of phase, so scrubs and replays agree. */
      const sink = paramsRef.current.sink;
      const u = smooth01((s.phase - 0.25) / 0.75);
      const k = 1 - u * (1 - sink.endScale);
      M.compose(
        V.set(s.spawn.x + SAMPLE.x, s.spawn.y + SAMPLE.y, SAMPLE.z),
        Q.setFromEuler(E),
        SV.set(k, k, k),
      );
      mesh.setMatrixAt(i, M);
      (phases.array as Float32Array)[i] = s.phase;
    }
    mesh.instanceMatrix.needsUpdate = true;
    phases.needsUpdate = true;
  });

  const api = useMemo<SheetsApi>(() => {
    const advance = (ms: number) => three.advance(ms);
    return {
      count,
      state: stateRef.current,
      advance,
      worldFromRect: (rect) => {
        const cv = three.gl.domElement.getBoundingClientRect();
        const { width, height } = three.size;
        return {
          x: rect.left - cv.left + rect.width / 2 - width / 2,
          y: height / 2 - (rect.top - cv.top) - rect.height / 2,
        };
      },
      spawnFor: (index, rect) => {
        const cv = three.gl.domElement.getBoundingClientRect();
        const dpr = three.gl.getPixelRatio();
        const { width, height } = three.size;
        const relX = Math.round((rect.left - cv.left) * dpr) / dpr;
        const relY = Math.round((rect.top - cv.top) * dpr) / dpr;
        const size = atlas.sizes[index];
        return {
          x: relX + size.w / 2 - width / 2,
          y: height / 2 - relY - size.h / 2,
        };
      },
      canvasSize: () => ({ width: three.size.width, height: three.size.height }),
      canvasRect: () => three.gl.domElement.getBoundingClientRect(),
      updateParams: (p) => {
        paramsRef.current = p;
        built.mat.updateParams(p);
        /* stiffness range is a rebuild-scope knob: refresh the attribute */
        const stiffAttr = built.geometry.getAttribute("aStiffness");
        for (let i = 0; i < count; i++) {
          (stiffAttr.array as Float32Array)[i] = sheetStiffness(i, p.paper);
        }
        stiffAttr.needsUpdate = true;
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [built, count, three]);

  const readyOnce = useRef(false);
  useEffect(() => {
    if (readyOnce.current) return;
    readyOnce.current = true;
    onReady(api);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  /* one frame per commit so mounts paint without waiting for the timeline */
  const frame = useRef(0);
  const advanceOnCommit = useCallback(() => {
    three.advance(frame.current++);
  }, [three]);
  useEffect(() => {
    advanceOnCommit();
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[built.geometry, built.mat.material, count]}
      frustumCulled={false}
    />
  );
}
