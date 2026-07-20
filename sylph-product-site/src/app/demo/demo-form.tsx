"use client";
import useServerActions from "../hooks/useServerActions";

export function DemoForm() {
  const { submitDemoForm, emailSent, error: serverError, loading } = useServerActions();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get("name") as string;
    const email = data.get("email") as string;
    const company = data.get("company") as string;
    const teamSize = data.get("teamSize") as string;
    const note = data.get("message") as string;

    submitDemoForm({
      to: ["atharva-sumant@januslabsinc.com"],
      subject: `Demo request from ${name} (${company})`,
      message: [
        `New demo request via sylph-product.com`,
        ``,
        `Name:      ${name}`,
        `Email:     ${email}`,
        `Company:   ${company}`,
        `Team size: ${teamSize || "Not specified"}`,
        ``,
        `What they want to see:`,
        note ? note : "Nothing specified.",
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
            Thanks. We&rsquo;ll reach out within one business day to set up your walkthrough. In the meantime,
            check your inbox for a confirmation.
          </p>
        </div>
      </div>
    );
  }


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
          <option>1 to 50</option>
          <option>51 to 200</option>
          <option>201 to 1,000</option>
          <option>1,000+</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="d-msg">What would you like to see? (optional)</label>
        <textarea id="d-msg" name="message" placeholder="e.g. how policy-PDF → rules works, or reconciliation for multi-currency trips" />
      </div>

      {serverError && <p className="form-err">{serverError}</p>}

      <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={loading}>
        {loading ? "Sending…" : "Book a demo"}
      </button>

      <p className="form-fine">
        We&rsquo;ll only use your details to contact you about Sylph. No spam, ever.
      </p>
    </form>
  );
}
