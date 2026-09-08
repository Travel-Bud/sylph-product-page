import { MatchCard } from "@/components/custom/site/panels";
import { VideoLoop } from "@/components/custom/site/video-loop";

/* Beat 1: receipts, on the band. The receipt-lift probe beside the match card. */
export const RECEIPT_CLIP = { src: "/site/video/lab/receipt-lift.mp4", poster: "/site/video/lab/receipt-lift.jpg" };

export function AirReceipts() {
  return (
    <section className="sec sec--band air-sec" id="receipts" aria-labelledby="receipts-title">
      <div className="wrap">
        <div className="sec-head rv">
          <p className="eyebrow eb-amber">Receipts</p>
          <h2 id="receipts-title" className="h2">
            Receipts find their own charge.
          </h2>
          <p className="lede">
            Upload it, forward the email, or text a photo. Sylph reads it, matches it to the card charge and
            checks it against policy. Whatever is still unmatched at month end is one list, not a hundred
            reminders.
          </p>
        </div>
        <div className="air-two rv">
          <div className="air-clip air-clip-sm">
            <VideoLoop src={RECEIPT_CLIP.src} poster={RECEIPT_CLIP.poster} className="air-video" />
          </div>
          <div className="air-match">
            <MatchCard />
          </div>
        </div>
      </div>
    </section>
  );
}

/* Beat 2: the roadmap item the terminal clip was made for. Night ground, in build. */
export function AirNext() {
  return (
    <section className="sec sec--night on-night air-next" id="next" aria-labelledby="next-title">
      <div className="wrap air-two air-two-rev">
        <div className="sec-head rv">
          <p className="eyebrow">In build, not yet available</p>
          <h2 id="next-title" className="h2">
            Next, the policy rides on the card.
          </h2>
          <p className="lede">
            An out-of-policy purchase is declined at the terminal, and the employee gets a text naming the
            rule before it ever becomes an expense. On the cards you already issue, starting with Visa.
          </p>
        </div>
        <div className="air-clip air-clip-night rv">
          <VideoLoop src="/site/video/lab/terminal-tap.mp4" poster="/site/video/lab/terminal-tap.jpg" className="air-video" />
          <span className="air-tag mono">In build</span>
        </div>
      </div>
    </section>
  );
}
