// import { NextRequest, NextResponse } from "next/server";

// /**
//  * Demo-request lead capture.
//  * Delivers to the company inbox. Set ONE of these env vars to make leads
//  * actually arrive (otherwise the lead is recorded to server logs only):
//  *   - RESEND_API_KEY      → sends an email via Resend (set DEMO_FROM_EMAIL too)
//  *   - DEMO_WEBHOOK_URL    → POSTs the lead JSON (Slack/Zapier/CRM webhook)
//  */
// const TO_EMAIL = "atharva-sumant@januslabsinc.com";
// const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// export async function POST(req: NextRequest) {
//   let body: Record<string, unknown>;
//   try {
//     body = await req.json();
//   } catch {
//     return NextResponse.json({ error: "Invalid request." }, { status: 400 });
//   }

//   const name = String(body.name ?? "").trim();
//   const email = String(body.email ?? "").trim();
//   const company = String(body.company ?? "").trim();
//   const teamSize = String(body.teamSize ?? "").trim();
//   const message = String(body.message ?? "").trim();

//   if (!name || !company || !EMAIL_RE.test(email)) {
//     return NextResponse.json(
//       { error: "Please provide your name, a valid work email, and your company." },
//       { status: 422 },
//     );
//   }

//   const receivedAt = new Date().toISOString();
//   const subject = `New Sylph demo request — ${company}`;
//   const text = [
//     `Name: ${name}`,
//     `Work email: ${email}`,
//     `Company: ${company}`,
//     `Team size: ${teamSize || "—"}`,
//     `Message: ${message || "—"}`,
//     `Received: ${receivedAt}`,
//   ].join("\n");

//   const resendKey = process.env.RESEND_API_KEY;
//   const webhook = process.env.DEMO_WEBHOOK_URL;

//   try {
//     if (resendKey) {
//       const from = process.env.DEMO_FROM_EMAIL || "Sylph <onboarding@resend.dev>";
//       const res = await fetch("https://api.resend.com/emails", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${resendKey}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ from, to: [TO_EMAIL], reply_to: email, subject, text }),
//       });
//       if (!res.ok) throw new Error(`Resend responded ${res.status}`);
//     } else if (webhook) {
//       const res = await fetch(webhook, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ subject, name, email, company, teamSize, message, receivedAt }),
//       });
//       if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
//     } else {
//       // No delivery channel configured — record to logs so the lead isn't lost.
//       console.warn("[demo] No RESEND_API_KEY / DEMO_WEBHOOK_URL set. Lead (logged only):\n" + text);
//     }
//     return NextResponse.json({ ok: true });
//   } catch (err) {
//     // Don't block the user; the lead is in the logs and can be recovered.
//     console.error("[demo] Failed to deliver lead:", err, "\n" + text);
//     return NextResponse.json({ ok: true, delivered: false });
//   }
// }
