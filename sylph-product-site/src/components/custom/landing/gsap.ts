"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/* The landing's two motion registers. Response (hovers, presses) lives in CSS
   at 150-250ms; everything GSAP animates is the reveal register. */
export const EASE_REVEAL = "expo.out";
export const DUR_REVEAL = 1.0;

/* Departures are caught by a gust: they accelerate out, up and away to the
   right, the tail dissolving mid-flight. One ease, page-wide. */
export const EASE_GUST = "power2.in";

/* Sanctioned ScrollTrigger tiers — every once-per-visit reveal starts at one
   of these, so the page has a fixed beat instead of per-section drift.
     headings        "top 82%"
     support groups  "top 84%"
     stage objects   "top 72%"  (product windows, photographs, choreography) */
export const START_HEADING = "top 82%";
export const START_GROUP = "top 84%";
export const START_STAGE = "top 72%";

export { gsap, ScrollTrigger, SplitText, useGSAP };
