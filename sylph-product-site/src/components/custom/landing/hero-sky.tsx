"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { NIGHT_FLIGHT_HD } from "./film";

/* The hero's sky reveals once the photograph has actually arrived: it rests on the night colour, then fades and
   settles into place. No blurred placeholder swapping to sharp (that read as a pop). Server render and no-script
   show the image as is; reduced motion skips the fade. */
export function HeroSky() {
  const img = useRef<HTMLImageElement>(null);
  const [phase, setPhase] = useState<"ssr" | "wait" | "in">("ssr");

  useEffect(() => {
    const el = img.current;
    const id = requestAnimationFrame(() => setPhase((p) => (p === "in" ? p : el?.complete && el.naturalWidth ? "in" : "wait")));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="lp-hero-sky" data-phase={phase}>
      <div className="lp-hero-drift">
        <Image
          ref={img}
          src={NIGHT_FLIGHT_HD.src}
          alt=""
          fill
          priority
          quality={80}
          sizes="100vw"
          className="lp-hero-img"
          onLoad={() => setPhase("in")}
        />
      </div>
    </div>
  );
}
