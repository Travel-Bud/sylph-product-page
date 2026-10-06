import Link from "next/link";
import { APP_LOGIN, CONTACT, DEMO, PRICING } from "@/components/custom/site/anchors";
import { Bird } from "./bird";
import { TRUST } from "./faq";

export function Footer({ sampleNote = true }: { sampleNote?: boolean }) {
  return (
    <footer className="lp-foot">
      <div className="lp-wrap">
        <div className="lp-foot-top">
          <p className="lp-foot-brand">
            <Bird className="lp-foot-mark" />
            <span>
              <strong>Sylph</strong>
              Expenses run on air.
            </span>
          </p>
          <nav className="lp-foot-links" aria-label="Footer">
            <a href={DEMO}>Book a demo</a>
            <Link href={PRICING} prefetch={false}>
              Pricing
            </Link>
            <a href={APP_LOGIN}>Log in</a>
            <a href={CONTACT}>Contact</a>
            {/* a plain link: /privacy redirects to the legal host, and a prefetch would hit it cross-origin */}
            <a href="/privacy">Privacy</a>
          </nav>
        </div>
        <p className="lp-foot-fine">
          {sampleNote && "Product screens show sample data: the people, merchants, rules and amounts are invented. "}
          {TRUST} &copy; 2026 Janus Labs.
        </p>
      </div>
    </footer>
  );
}
