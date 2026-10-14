import Image from "next/image";
import { SCENE } from "./film";

/* The features' opening scene (2026-10-13, scenes.tsx): while the track pins, the card turns in the aurora's light and
   three lines trade sides, one per third of the track. They restate what How it works and the Cards tile already show.
   Reduced motion shows the card face on with all three lines. */
const LINES = ["Works with the cards you already have.", "Every charge checked against your policy.", "Only the exceptions reach a person."];

export function CardScene() {
  return (
    <div className="lp-cardscene" data-scene>
      <div className="lp-scene-stage lp-cardscene-stage">
        <div className="lp-wrap lp-cardscene-in">
          <figure className="lp-pf lp-pf--card">
            <Image src={SCENE.card.start} alt="" fill sizes="(max-width: 720px) 200vw, 100vw" quality={75} className="lp-scene-end" />
            <video className="lp-scene-v" data-scrub data-src={SCENE.card.clip} poster={SCENE.card.start} muted playsInline preload="none" aria-hidden="true" />
            <ul className="lp-card-lines">
              {LINES.map((t) => (
                <li key={t} className="lp-card-line">
                  {t}
                </li>
              ))}
            </ul>
          </figure>
        </div>
      </div>
    </div>
  );
}
