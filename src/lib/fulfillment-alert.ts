// src/lib/fulfillment-alert.ts
// Sends an urgent email when a webhook fulfillment path fails after payment
// already succeeded — customer's been charged, something downstream broke,
// and console.error alone means nobody finds out unless they're watching
// Vercel logs. This makes sure a real person gets pinged instead.

import { Resend } from "resend"

function getResend() { return new Resend(process.env.RESEND_API_KEY) }

export async function alertFulfillmentFailure(params: {
  source:    string   // e.g. "mcs-merch", "mcs-studio-booking", "mcs-engineer-booking"
  sessionId: string
  error:     unknown
}) {
  const message = params.error instanceof Error ? params.error.message : String(params.error)
  const from = process.env.RESEND_FROM_EMAIL ?? "orders@midcitysound.com"
  const to   = process.env.RESEND_TO_EMAIL   ?? "midcitysound1@gmail.com"

  try {
    await getResend().emails.send({
      from,
      to,
      subject: `⚠️ Fulfillment failed — ${params.source}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
          <h2 style="color:#c0392b;margin:0 0 12px">Payment succeeded, fulfillment failed</h2>
          <p style="font-size:14px;line-height:1.6">
            A customer was charged, but something broke while processing their order/booking
            afterward. Check Stripe and Turso for this session — the payment is real, but the
            order/booking record or confirmation may not be.
          </p>
          <table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:16px">
            <tr><td style="padding:6px 0;color:#666">Source</td><td>${params.source}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Stripe Session</td><td style="font-family:monospace">${params.sessionId}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Error</td><td>${message}</td></tr>
          </table>
          <p style="margin-top:20px">
            <a href="https://dashboard.stripe.com/payments/${params.sessionId}" style="color:#0066cc">View in Stripe →</a>
          </p>
        </div>
      `,
    })
  } catch (alertErr) {
    // If even the alert email fails, this is the last line of defense — log loudly.
    console.error("[fulfillment-alert] FAILED TO SEND ALERT EMAIL. Original error:", params.error, "Alert error:", alertErr)
  }
}
