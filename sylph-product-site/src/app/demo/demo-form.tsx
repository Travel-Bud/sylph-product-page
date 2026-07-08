"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "done";

export function DemoForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    setStatus("submitting");
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || "Something went wrong. Please try again.");
      }
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "done") {
    return (
      <div className="demo-form">
        <div className="demo-success">
          <div className="ok-ic">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h3>Request received.</h3>
          <p>
            Thanks, we&rsquo;ll reach out within one business day to set up your walkthrough. In the meantime,
            check your inbox for a confirmation.
          </p>
        </div>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form className="demo-form" onSubmit={onSubmit} noValidate>
      <div className="form-head">Request a demo</div>
      <div className="form-sub">A 30-minute walkthrough on your own policy. No commitment.</div>

      <div className="field">
        <label htmlFor="d-name">
          Full name <span className="req">*</span>
        </label>
        <input id="d-name" name="name" required autoComplete="name" placeholder="Alex Okafor" />
      </div>

      <div className="field two">
        <div className="field">
          <label htmlFor="d-email">
            Work email <span className="req">*</span>
          </label>
          <input id="d-email" name="email" type="email" required autoComplete="email" placeholder="alex@company.com" />
        </div>
        <div className="field">
          <label htmlFor="d-company">
            Company <span className="req">*</span>
          </label>
          <input id="d-company" name="company" required autoComplete="organization" placeholder="Company, Inc." />
        </div>
      </div>

      <div className="field">
        <label htmlFor="d-team">Team size</label>
        <select id="d-team" name="teamSize" defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          <option>1-50</option>
          <option>51-200</option>
          <option>201-1,000</option>
          <option>1,000+</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="d-msg">What would you like to see? (optional)</label>
        <textarea id="d-msg" name="message" placeholder="e.g. how policy-PDF → rules works, or reconciliation for multi-currency trips" />
      </div>

      {error && <p className="form-err">{error}</p>}

      <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={submitting}>
        {submitting ? "Sending…" : "Book a demo"}
      </button>

      <p className="form-fine">
        We&rsquo;ll only use your details to contact you about Sylph. No spam, ever.
      </p>
    </form>
  );
}
