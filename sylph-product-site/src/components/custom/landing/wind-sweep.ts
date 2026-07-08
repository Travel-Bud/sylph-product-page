"use client";

/**
 * The carry register's variance source. Wind-borne paper never flies the
 * same path twice — except here, where it must: the page's brand is
 * replayability ("run it again — same 214, same 3"), so every flight
 * parameter is a pure function of the element's index. No Math.random,
 * anywhere, ever.
 *
 * seeded(i, k) returns a stable pseudo-random value in [0, 1) for element
 * i under salt k (use a different k per parameter so channels decorrelate).
 */
export const seeded = (i: number, k = 1): number => {
  const s = Math.sin((i + 1) * 127.1 + k * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
