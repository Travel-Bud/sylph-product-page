"use client";

import { useEffect, useRef, useState } from "react";
import { getImageProps } from "next/image";
import { NIGHT_FLIGHT_HD, NIGHT_FLIGHT_PHONE } from "./film";

/* The hero's sky reveals once the photograph has actually arrived: it rests on the night colour, then fades and
   settles into place. No blurred placeholder swapping to sharp (that read as a pop). Server render and no-script
   show the image as is; reduced motion skips the fade. Phones get a cut of the render in a shorter box (landing.css):
   stretched to cover the whole tall hero, the render's aurora read soft (2026-10-06). */
export function HeroSky() {
  const img = useRef<HTMLImageElement>(null);
  const [phase, setPhase] = useState<"ssr" | "wait" | "in">("ssr");

  useEffect(() => {
    const el = img.current;
    const id = requestAnimationFrame(() => setPhase((p) => (p === "in" ? p : el?.complete && el.naturalWidth ? "in" : "wait")));
    return () => cancelAnimationFrame(id);
  }, []);

  const shared = { alt: "", fill: true, priority: true, quality: 80, className: "lp-hero-img" } as const;
  const phone = getImageProps({ ...shared, src: NIGHT_FLIGHT_PHONE.src, sizes: "125vw" }).props;
  const wide = getImageProps({ ...shared, src: NIGHT_FLIGHT_HD.src, sizes: "100vw" }).props;

  return (
    <div className="lp-hero-sky" data-phase={phase}>
      <div className="lp-hero-drift">
        <picture>
          <source media="(max-width: 720px)" srcSet={phone.srcSet} sizes={phone.sizes} />
          <img {...wide} alt="" ref={img} fetchPriority="high" onLoad={() => setPhase("in")} />
        </picture>
      </div>
    </div>
  );
}
