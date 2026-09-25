"use client";

import { useSyncExternalStore } from "react";

/* Dana's answers to the three exceptions, shared by the arrivals board (where Dana answers) and the folio
   (which follows). The defaults are the story's: the dinner approved with Priya's note, the cab ride
   returned as a duplicate of the Uber, the bar tab's block approved. */
export type Answer = "approved" | "returned";
export type Answers = Record<string, Answer>;

let state: Answers = { sushi: "approved", cab: "returned", bar: "approved" };
const subs = new Set<() => void>();

export function answer(id: string, a: Answer) {
  if (state[id] === a) return;
  state = { ...state, [id]: a };
  subs.forEach((f) => f());
}

const subscribe = (f: () => void) => {
  subs.add(f);
  return () => subs.delete(f);
};
const snap = () => state;

export const useAnswers = () => useSyncExternalStore(subscribe, snap, snap);
