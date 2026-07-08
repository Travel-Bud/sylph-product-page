import { describe, it, expect } from "vitest";
import { precomputePath, samplePath, gustEnvelope, PATH_STEPS, type PathParams } from "../flight-field";

const PARAMS: PathParams = {
  gust: { strength: 520, attack: 0.22, peak: 0.16, decay: 0.62 },
  field: {
    noiseScale: 0.0022,
    curlIntensity: 260,
    fieldTimeScale: 0.55,
    baseWindAngleDeg: 16,
    climbBoostDeg: 38,
  },
  flutter: { stiffnessMin: 0.35, stiffnessMax: 0.8, flutterAmp: 0.7, bankGain: 0.55, tumble: 0.8 },
};

const SPAWN = { x: 480, y: 120 };
const ROOM = { left: 900, right: 240, up: 300, down: 80 };

describe("flight-field determinism", () => {
  it("two precomputes with identical inputs are byte-equal", () => {
    const a = precomputePath(4, SPAWN, ROOM, PARAMS);
    const b = precomputePath(4, SPAWN, ROOM, PARAMS);
    expect(Buffer.from(a.pos.buffer).equals(Buffer.from(b.pos.buffer))).toBe(true);
    expect(Buffer.from(a.rot.buffer).equals(Buffer.from(b.rot.buffer))).toBe(true);
    expect(a.stiffness).toBe(b.stiffness);
  });

  it("different sheet indices produce different paths", () => {
    const a = precomputePath(4, SPAWN, ROOM, PARAMS);
    const b = precomputePath(5, SPAWN, ROOM, PARAMS);
    expect(Buffer.from(a.pos.buffer).equals(Buffer.from(b.pos.buffer))).toBe(false);
  });

  it("paths start at exactly zero (the swap frame is transform-identical)", () => {
    const p = precomputePath(7, SPAWN, ROOM, PARAMS);
    for (let c = 0; c < 3; c++) {
      expect(Math.abs(p.pos[c])).toBe(0); // |x| ignores the -0 encoding
      expect(Math.abs(p.rot[c])).toBe(0);
    }
    const s = samplePath(p, 0, { x: 1, y: 1, z: 1, rx: 1, ry: 1, rz: 1 });
    expect(Math.abs(s.x)).toBe(0);
    expect(Math.abs(s.rz)).toBe(0);
  });

  it("paths never leave the room", () => {
    for (let i = 0; i < 20; i++) {
      const p = precomputePath(i, SPAWN, ROOM, PARAMS);
      for (let k = 0; k < PATH_STEPS; k++) {
        expect(p.pos[k * 3]).toBeLessThanOrEqual(ROOM.right + 1e-3);
        expect(p.pos[k * 3]).toBeGreaterThanOrEqual(-ROOM.left - 1e-3);
        expect(p.pos[k * 3 + 1]).toBeLessThanOrEqual(ROOM.up + 1e-3);
        expect(p.pos[k * 3 + 1]).toBeGreaterThanOrEqual(-ROOM.down - 1e-3);
      }
    }
  });

  it("gust envelope: silent at 0, crests near attack+peak, trails off", () => {
    const g = PARAMS.gust;
    expect(gustEnvelope(0, g)).toBe(0);
    const crest = gustEnvelope(g.attack + g.peak / 2, g);
    expect(crest).toBeGreaterThan(0.95);
    expect(gustEnvelope(1, g)).toBeLessThan(0.15);
    expect(gustEnvelope(1, g)).toBeGreaterThan(0);
  });
});
