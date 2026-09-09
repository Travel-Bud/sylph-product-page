"use client";

import { useState } from "react";
import useServerActions from "../hooks/useServerActions";

/* Leads go through the Cloudflare email worker at NEXT_PUBLIC_EMAIL_API_URL (repo CLAUDE.md, demo-lead path). */
const LEAD_TO = ["atharva-sumant@januslabsinc.com"];

export function DemoForm() {
  const { submitDemoForm, emailSent, error, loading } = useServerActions();

  const [invalid, setInvalid] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const problems: Record<string, string> = {};
    const name = form.elements.namedItem("name") as HTMLInputElement;
    const email = form.elements.namedItem("email") as HTMLInputElement;
    const company = form.elements.namedItem("company") as HTMLInputElement;
    if (!name.value.trim()) problems.name = "Please add your name.";
    if (!email.value.trim() || !email.validity.valid) problems.email = "Please use a valid work email.";
    if (!company.value.trim()) problems.company = "Please add your company.";
    setInvalid(problems);
    if (Object.keys(problems).length) {
      (problems.name ? name : problems.email ? email : company).focus();
      return;
    }
    const data = new FormData(form);
    const teamSize = (data.get("teamSize") as string) || "";
    const note = (data.get("message") as string) || "";
    await submitDemoForm({
      to: LEAD_TO,
      subject: `Demo request from ${name.value.trim()} (${company.value.trim()})`,
      message: [
        "New demo request via sylph-product.com",
        "",
        `Name:      ${name.value.trim()}`,
        `Email:     ${email.value.trim()}`,
        `Company:   ${company.value.trim()}`,
        `Team size: ${teamSize || "Not specified"}`,
        "",
        "What they want to see:",
        note.trim() ? note.trim() : "Nothing specified.",
      ].join("\n"),
    });
  }

  if (emailSent) {
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
            Thanks. We will reply within one business day to set up your walkthrough.
          </p>
        </div>
      </div>
    );
  }

  const submitting = loading;

  return (
    <form className="demo-form" onSubmit={onSubmit} noValidate>
      <div className="form-head">Request a demo</div>
      <div className="form-sub">Thirty minutes, with or without a policy document. No commitment.</div>

      <div className="field">
        <label htmlFor="d-name">
          Full name <span className="req">*</span>
        </label>
        <input
          id="d-name"
          name="name"
          required
          autoComplete="name"
          placeholder="Alex Okafor"
          aria-invalid={invalid.name ? true : undefined}
          aria-describedby={invalid.name ? "d-name-err" : undefined}
        />
        {invalid.name && (
          <span id="d-name-err" className="field-err">
            {invalid.name}
          </span>
        )}
      </div>

      <div className="field two">
        <div className="field">
          <label htmlFor="d-email">
            Work email <span className="req">*</span>
          </label>
          <input
            id="d-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="alex@company.com"
            aria-invalid={invalid.email ? true : undefined}
            aria-describedby={invalid.email ? "d-email-err" : undefined}
          />
          {invalid.email && (
            <span id="d-email-err" className="field-err">
              {invalid.email}
            </span>
          )}
        </div>
        <div className="field">
          <label htmlFor="d-company">
            Company <span className="req">*</span>
          </label>
          <input
            id="d-company"
            name="company"
            required
            autoComplete="organization"
            placeholder="Company, Inc."
            aria-invalid={invalid.company ? true : undefined}
            aria-describedby={invalid.company ? "d-company-err" : undefined}
          />
          {invalid.company && (
            <span id="d-company-err" className="field-err">
              {invalid.company}
            </span>
          )}
        </div>
      </div>

      <div className="field">
        <label htmlFor="d-team">Team size</label>
        <select id="d-team" name="teamSize" defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          <option>1 to 100</option>
          <option>101 to 1,000</option>
          <option>More than 1,000</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="d-msg">What would you like to see? (optional)</label>
        <textarea id="d-msg" name="message" placeholder="e.g. how a policy PDF becomes rules, or reconciliation for multi-currency trips" />
      </div>

      {error && <p className="form-err">{error}</p>}

      <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={submitting}>
        {submitting ? "Sending…" : "Book a demo"}
      </button>

      <p className="form-fine">We will only use your details to contact you about Sylph.</p>
    </form>
  );
}
