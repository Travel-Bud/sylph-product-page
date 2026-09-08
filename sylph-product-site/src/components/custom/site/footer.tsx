import Link from "next/link";
import { Mark } from "./mark";
import { HOME, SITE_ANCHORS } from "./anchors";
import { JanusNod } from "./janus-nod";

export function SiteFooter({ sampleNote = false }: { sampleNote?: boolean }) {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="brand">
              <Mark className="brand-mark" />
              <span>Sylph</span>
            </div>
            <p>Corporate travel and expense that checks itself.</p>
          </div>
          <nav aria-label="Product">
            <h3>Product</h3>
            <ul>
              {SITE_ANCHORS.map((l) => (
                <li key={l.href}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
              <li>
                <Link href={`${HOME}/pricing`}>Pricing</Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Company">
            <h3>Company</h3>
            <ul>
              <li>
                <Link href={`${HOME}/demo`}>Book a demo</Link>
              </li>
              <li>
                <Link href="/login">Log in</Link>
              </li>
              <li>
                <a href="mailto:atharva-sumant@januslabsinc.com">atharva-sumant@januslabsinc.com</a>
              </li>
            </ul>
          </nav>
          <nav aria-label="Legal">
            <h3>Legal</h3>
            <ul>
              <li>
                <Link href="/privacy">Privacy</Link>
              </li>
              <li>
                <Link href="/terms">Terms</Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="footer-line">
          <span>© 2026 Sylph</span>
          <JanusNod />
          <span className="footer-sec">Policies and receipts are encrypted in transit and at rest, and never used to train models.</span>
          {sampleNote && <span>Product panels on this page use sample data, not customer data.</span>}
        </div>
      </div>
    </footer>
  );
}
