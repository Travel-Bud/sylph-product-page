"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { play } from "@/components/custom/v2-sides/sound";
import { Mark } from "@/components/custom/site/mark";
import { CHARGE, FILED, ruleOf } from "./data";
import { Sample, Tick } from "./bits";

const REDUCE = "(prefers-reduced-motion: reduce)";
const subscribeReduce = (fn: () => void) => {
  const m = window.matchMedia(REDUCE);
  m.addEventListener("change", fn);
  return () => m.removeEventListener("change", fn);
};

/**
 * Dana's queue on his laptop. The settled state (server render, reduced motion) is the end of the
 * story: approved. With motion, the exception waits for a tap on Approve; if the reader scrolls on
 * without tapping, the director sends "cx-approve" and Dana taps it himself. Only the click sounds.
 */
export function Queue() {
  const motion = useSyncExternalStore(subscribeReduce, () => !window.matchMedia(REDUCE).matches, () => false);
  const [tapped, setTapped] = useState(false);
  const approved = !motion || tapped;

  /* tell the close-up beside the queue that Dana has approved (director.tsx letters its lines) */
  useEffect(() => {
    if (tapped) window.dispatchEvent(new Event("cx-approved"));
  }, [tapped]);

  useEffect(() => {
    const on = () => setTapped(true);
    window.addEventListener("cx-approve", on);
    return () => window.removeEventListener("cx-approve", on);
  }, []);

  return (
    <div className="cx-laptop" data-queue>
      <div className="cx-screen">
        <header className="cx-app-top">
          <Mark className="cx-app-mark" />
          <strong>Dana&rsquo;s queue</strong>
          <span className="mono cx-app-sub">Week of Sep 7</span>
          <Sample />
        </header>

        <section className="cx-q-block" aria-label="Needs you">
          <h3 className="cx-q-h">
            Needs you <span className="mono">1</span>
          </h3>
          <article className={`cx-exc${approved ? " is-approved" : ""}`} data-exc>
            <div className="cx-exc-top">
              <span className="cx-exc-m">{CHARGE.merchant}</span>
              <span className="mono cx-exc-a">{CHARGE.amount}</span>
            </div>
            <div className="cx-exc-who">
              <Image src="/site/characters/priya-head.webp" alt="" width={26} height={26} />
              <span>Priya, Denver site visit, Sep 10</span>
            </div>
            <div className="cx-exc-v">
              <span className="cx-chip cx-chip--note">Needs a note</span>
              <span className="mono">
                {CHARGE.rule}, {CHARGE.cite}
              </span>
            </div>
            <blockquote className="cx-exc-note">&ldquo;{CHARGE.note}&rdquo;</blockquote>
            <div className="cx-exc-act">
              <button
                type="button"
                className="cx-approve"
                disabled={approved}
                onClick={() => {
                  setTapped(true);
                  play("approve");
                }}
              >
                {approved ? (
                  <>
                    <Tick /> Approved
                  </>
                ) : (
                  "Approve"
                )}
              </button>
              <span className="cx-stamp mono" aria-hidden={!approved}>
                Approved by Dana, 09:03
              </span>
            </div>
          </article>
        </section>

        <section className="cx-q-block" aria-label="Filed itself">
          <h3 className="cx-q-h">
            Filed itself <span className="mono">{FILED.length}</span>
          </h3>
          <ul className="cx-filed">
            {FILED.map((r) => (
              <li key={r.merchant} data-filed>
                <Tick />
                <span className="cx-filed-m">{r.merchant}</span>
                <span className="mono cx-filed-r">{ruleOf(r)}</span>
                <span className="mono cx-filed-a">{r.amount}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
