"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, useGSAP);

/* Every GSAP-driven demonstration on the marketing surface mounts inside
   this matchMedia gate, so reduced motion gets the settled state with
   nothing running. CSS owns entrance reveals; GSAP owns demonstrations. */
export const MM_MOTION = "(prefers-reduced-motion: no-preference)";
export const EASE = "expo.out";

export { gsap, ScrollTrigger, useGSAP };
