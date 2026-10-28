import Image from "next/image";
import type { CSSProperties } from "react";
import { SCENE } from "./film";
import { Kicker } from "./kicker";
import { KindIcon, StatusTag } from "./app-ui/chip";
import { TRIP_CHARGES } from "./data";

/* Frame A's night section (Ben, 2026-10-05), told since 2026-10-13 as one charge taken apart (scenes.tsx): while the
   track pins, the policy, the receipt and the card charge separate, the four steps light up in turn, and the last step
   brings the exception with the rule it broke. Each step owns a quarter of the track ([s0, s1) of --p). Titles only
   (Ben, 2026-10-19). Reduced motion shows every step and the exploded frame. */
const STEPS = ["Bring your policy", "Approve the rules", "Every charge is checked", "Finance sees exceptions"];
const EDGES = [-1, 0.25, 0.5, 0.75, 2];
const dinner = TRIP_CHARGES.find((c) => c.id === "sk")!;

const at = (vars: Record<string, number>) => vars as CSSProperties;

export function How() {
  return (
    <section className="lp-how lp-panel" id="how" data-panel data-scene data-settle aria-labelledby="how-t">
      <div className="lp-scene-stage lp-how-stage">
        <div className="lp-wrap lp-how-in">
          <div className="lp-how-head" data-rv>
            <div>
              <Kicker night>How it works</Kicker>
              <h2 id="how-t" className="lp-h2">
                <span>Write the policy once.</span> <span>Sylph checks every charge.</span>
              </h2>
            </div>
          </div>
          <div className="lp-how-body">
            <ol className="lp-steps">
              {STEPS.map((s, i) => (
                <li key={s} className="lp-step" style={at({ "--s0": EDGES[i], "--s1": EDGES[i + 1] })}>
                  <h3>
                    <span className="lp-step-n">{String(i + 1).padStart(2, "0")}</span>
                    {s}
                  </h3>
                </li>
              ))}
            </ol>
            <figure className="lp-how-film">
              <Image src={SCENE.exploded.end} alt="" fill sizes="(max-width: 1100px) 100vw, 60vw" quality={75} className="lp-scene-end" />
              <video className="lp-scene-v" data-scrub data-src={SCENE.exploded.clip} poster={SCENE.exploded.start} muted playsInline preload="none" aria-hidden="true" />
              <span className="lp-how-tag" style={at({ "--x": 0.56, "--y": 0.22, "--a": 0.03, "--b": 0.25 })}>
                Your policy
              </span>
              <span className="lp-how-tag lp-how-tag--rule ap-num" style={at({ "--x": 0.56, "--y": 0.22, "--a": 0.25, "--b": 0.75 })}>
                <b>{dinner.rule!.code}</b>&ensp;{dinner.rule!.policy}
              </span>
              <span className="lp-how-tag" style={at({ "--x": 0.45, "--y": 0.48, "--a": 0.5, "--b": 0.75 })}>
                The receipt
              </span>
              <span className="lp-how-tag" style={at({ "--x": 0.45, "--y": 0.77, "--a": 0.54, "--b": 0.75 })}>
                The charge
              </span>
              <div className="ap lp-how-exc" role="img" aria-label={`${dinner.merchant}, ${dinner.amount}: ${dinner.rule!.code}, ${dinner.rule!.reason}`}>
                <div className="ap-card lp-pf-verdict">
                  <div className="lp-pf-row">
                    <KindIcon kind={dinner.kind} />
                    <span>
                      <b>{dinner.merchant}</b>
                      <small>{dinner.detail}</small>
                    </span>
                    <span className="lp-pf-r">
                      <span className="ap-num">{dinner.amount}</span>
                      <StatusTag v="note" />
                    </span>
                  </div>
                  <p className="lp-pf-why ap-num">
                    <span>
                      <b>{dinner.rule!.code}</b>&ensp;{dinner.rule!.reason}
                    </span>
                  </p>
                </div>
              </div>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
