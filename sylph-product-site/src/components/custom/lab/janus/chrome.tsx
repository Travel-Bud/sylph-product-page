import { Mark } from "@/components/custom/site/mark";
import { APP_LOGIN, DEMO } from "@/components/custom/site/anchors";
import Image from "next/image";

/** The nav: its left sits on Priya's face, its right on Dana's. */
export function JanusNav() {
  return (
    <header className="jn-nav">
      <a className="jn-brand" href="#jn-top" data-jn-go="0" aria-label="Sylph, back to the top">
        <Mark />
        Sylph
      </a>
      <nav className="jn-nav-r" aria-label="Site">
        <a href={APP_LOGIN}>Log in</a>
        <a className="jn-btn" href={DEMO}>
          Book a demo
        </a>
      </nav>
    </header>
  );
}

/** After month end the page is one ground. */
export function JanusClose() {
  return (
    <>
      <section className="jn-close" id="jn-close" aria-labelledby="jn-close-h">
        <div className="jn-close-in">
          {/* the two faces, one ground: side by side for the first time on the page */}
          <Image
            className="jn-close-pair"
            src="/site/characters/together.webp"
            alt=""
            width={912}
            height={960}
            sizes="300px"
            draggable={false}
          />
          <h2 id="jn-close-h">Your policy does the chasing.</h2>
          <p className="jn-close-body">
            Write the policy once, or answer a dozen questions and Sylph writes it. A person approves the rules. From then on every
            charge is checked as it happens, on the cards and banks you already use.
          </p>
          <div className="jn-close-cta">
            <a className="jn-btn" href={DEMO}>
              Book a demo
            </a>
            <p className="jn-price">
              <b>$30</b>per active employee a month
            </p>
          </div>
          <p className="jn-fine">
            Set up the same day. Policies and receipts are encrypted in transit and at rest and never used to train models.
          </p>
        </div>
      </section>
      <footer className="jn-foot">
        <span className="jn-foot-l">
          <Mark />
          <b>Sylph</b>
          <span>Expenses run on air.</span>
        </span>
        <span className="jn-foot-r">
          <a href={APP_LOGIN}>Log in</a>
          <a href={DEMO}>Book a demo</a>
          {/* the maker's mark: a Janus door, which fits a page with two faces */}
          <a className="jn-nod" href="https://januslabsinc.com" aria-label="Made by Janus Labs" title="The door is open">
            <span className="jn-nod-well" aria-hidden="true">
              <span className="jn-nod-in">
                <span className="jn-nod-arch" />
              </span>
              <span className="jn-nod-panel">
                <svg viewBox="0 0 32 32" focusable="false">
                  <path d="M4 29 V15 A11 11 0 0 1 15 4 V29 Z" fill="currentColor" />
                  <path d="M17.5 29 V5 A10.5 10.5 0 0 1 28 15.5 V29" fill="none" stroke="currentColor" strokeWidth="1.7" />
                </svg>
              </span>
            </span>
            <span>Made by Janus Labs</span>
          </a>
        </span>
      </footer>
    </>
  );
}
