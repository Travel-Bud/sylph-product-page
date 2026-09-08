import { gsap } from "./motion";

/**
 * Per-tile expand choreography (Ben, 2026-09-01: "the unfolding should feel like a receipt
 * unravelling, or a plane taking off"). Runs after the Flip layout transition, on the open
 * tile's content. Every selector is tolerant: a missing element just skips its beat.
 * Nothing here runs under reduced motion (the caller guards it).
 */
const EASE = "expo.out";

export function enterTile(id: string, tile: HTMLElement, delay = 0) {
  const main = tile.querySelector<HTMLElement>(".tile-x-main");
  const side = tile.querySelector<HTMLElement>(".tile-x-side");
  if (!main) return;
  const q = (s: string) => Array.from(main.querySelectorAll<HTMLElement>(s));
  // fromTo renders its start state immediately, so the surface never flashes before the delay
  const tl = gsap.timeline({ defaults: { ease: EASE }, delay });
  gsap.set(main, { transformPerspective: 1100 });

  switch (id) {
    case "policy": {
      // a page turning down from the top edge, then the rules settling one by one
      tl.fromTo(main, { rotationX: -62, autoAlpha: 0, transformOrigin: "50% 0%" }, { rotationX: 0, autoAlpha: 1, duration: 0.85 });
      tl.fromTo(q(".rules-list > *, .rule-rows > *"), { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.05 }, 0.35);
      tl.fromTo(q(".rules-detail"), { autoAlpha: 0, x: 10 }, { autoAlpha: 1, x: 0, duration: 0.5 }, 0.6);
      break;
    }
    case "verdict": {
      // a stamp: lands large and settles
      tl.fromTo(main, { scale: 1.16, autoAlpha: 0, transformOrigin: "50% 45%" }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "power4.out" });
      tl.fromTo(q(".vc-amount"), { scale: 1.08 }, { scale: 1, duration: 0.4 }, 0.15);
      break;
    }
    case "cards": {
      // the card slides in; the terminal rises to meet it
      tl.fromTo(main, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
      tl.fromTo(q(".t-obj"), { x: -44, y: 0, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.8 }, 0.05);
      tl.fromTo(q(".t-obj-2"), { x: 0, y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8 }, 0.2);
      break;
    }
    case "receipts": {
      // unrolls from the top edge like paper, with a slight curl, then the match ties
      tl.fromTo(main, { clipPath: "inset(0 0 100% 0)", rotationX: -14, transformOrigin: "50% 0%", autoAlpha: 1 }, { clipPath: "inset(0 0 0% 0)", rotationX: 0, duration: 0.9, ease: "power2.inOut" });
      tl.fromTo(q(".rc-tie-line"), { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.5 }, 0.7);
      tl.fromTo(q(".rcp"), { y: 16, rotation: 4 }, { y: 0, rotation: 0, duration: 0.6 }, 0.6);
      break;
    }
    case "booking": {
      // take-off: the arc draws, the marker leaves along it, the fares land behind it
      const arc = main.querySelector<SVGPathElement>(".route-arc");
      if (arc) {
        const len = arc.getTotalLength();
        gsap.set(arc, { strokeDasharray: len, strokeDashoffset: len });
        tl.to(arc, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, 0);
      }
      tl.fromTo(main, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0);
      tl.fromTo(q(".route-marker"), { offsetDistance: "0%" }, { offsetDistance: "100%", duration: 1.1, ease: "power2.inOut" }, 0);
      tl.fromTo(q(".win > *:not(.win-bar):not(.route)"), { x: -18, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6, stagger: 0.12 }, 0.45);
      break;
    }
    case "currency": {
      tl.fromTo(main, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
      tl.fromTo(q("*"), { scale: 0.94 }, { scale: 1, duration: 0.5, stagger: 0.03 }, 0.05);
      break;
    }
    case "review": {
      // dealt onto the desk from the right, one exception at a time
      tl.fromTo(main, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 });
      tl.fromTo(q(".queue-rows > *"), { x: 56, rotation: 2.5, autoAlpha: 0 }, { x: 0, rotation: 0, autoAlpha: 1, duration: 0.65, stagger: 0.09 }, 0.1);
      break;
    }
    case "record": {
      // prints down from the top, then the approval lands
      tl.fromTo(main, { clipPath: "inset(0 0 100% 0)", autoAlpha: 1 }, { clipPath: "inset(0 0 0% 0)", duration: 1.0, ease: "power1.inOut" });
      tl.fromTo(q('[class*="stamp"], [class*="approv"]'), { scale: 1.7, rotation: -18, autoAlpha: 0 }, { scale: 1, rotation: -8, autoAlpha: 1, duration: 0.45, ease: "power4.out" }, 0.95);
      tl.fromTo(q(".rec-exports > *"), { y: 8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.06 }, 1.05);
      break;
    }
    default:
      tl.fromTo(main, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4 });
  }
  if (side) tl.fromTo(side, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.3);
  return tl;
}
