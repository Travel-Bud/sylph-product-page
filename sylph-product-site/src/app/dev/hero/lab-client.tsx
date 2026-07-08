"use client";

import dynamic from "next/dynamic";

/* The lab (and with it three/@react-three/fiber/leva) loads client-side only —
   the same ssr:false seam the real hero will use for the flight module. */
const HeroLab = dynamic(() => import("@/components/custom/landing/flight/lab/hero-lab"), {
  ssr: false,
  loading: () => (
    <p style={{ padding: "40vh 0", textAlign: "center", fontFamily: "monospace", opacity: 0.6 }}>
      loading flight lab…
    </p>
  ),
});

export function HeroLabClient() {
  return <HeroLab />;
}
