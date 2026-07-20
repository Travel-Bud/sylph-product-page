"use client";

/**
 * The flight canvas, production-shaped: pixel-mapped camera + instanced
 * sheets inside the `.wh-flight-canvas` layer (z4, pointer-events none).
 * The lab builds its own Canvas (it needs the three root for harnesses);
 * the hero mounts this. Both render the same FlightSheets.
 */

import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";
import { FlightSheets, type SheetsApi } from "./hero-flight";
import type { RowAtlas } from "./capture";
import type { FlightParams } from "./params";

/** fov 50 → z = (h/2)/tan(25°): 1 world unit = 1 CSS px on the z=0 plane */
export function PixelCamera() {
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

export function FlightCanvas({
  atlas,
  params,
  segments,
  dprCap,
  onSheets,
}: {
  atlas: RowAtlas;
  params: FlightParams;
  segments: [number, number];
  dprCap: number;
  onSheets: (api: SheetsApi) => void;
}) {
  return (
    <div className="wh-flight-canvas" aria-hidden="true">
      {/* R3F's wrapper re-enables pointer events — the flight must never
          swallow clicks meant for the page (replay button, CTAs) */}
      <Canvas
        frameloop="never"
        flat
        dpr={[1, dprCap]}
        style={{ pointerEvents: "none" }}
        gl={{
          alpha: true,
          antialias: true,
          premultipliedAlpha: true,
          powerPreference: "high-performance",
        }}
      >
        <PixelCamera />
        <FlightSheets atlas={atlas} params={params} segments={segments} onReady={onSheets} />
      </Canvas>
    </div>
  );
}
