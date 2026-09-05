// src/app/api/contact/route.ts
// Sends the contact form via Resend. Replaces the previous client-side
// stub (setTimeout + fake "sent" state) that never actually delivered
// anything. Rate limited + validated per site-security standard.

import { Resend } from "resend"
import { rateLimit, clientIp } from "@/lib/rate-limit"

function getResend() { return new Resend(process.env.RESEND_API_KEY) }

const MAX_NAME = 100
const MAX_INQUIRY = 60
const MAX_MESSAGE = 2000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  const ok = await rateLimit(`contact:${clientIp(req)}`, 5, 600) // 5 per 10 min
  if (!ok) return Response.json({ error: "Too many requests. Try again shortly." }, { status: 429 })

  let body: { name?: string; email?: string; inquiry?: string; message?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 })
  }

  const name    = (body.name    ?? "").trim().slice(0, MAX_NAME)
  const email   = (body.email   ?? "").trim().slice(0, MAX_NAME)
  const inquiry = (body.inquiry ?? "").trim().slice(0, MAX_INQUIRY)
  const message = (body.message ?? "").trim().slice(0, MAX_MESSAGE)

  if (!name || !email || !message || !EMAIL_RE.test(email)) {
    return Response.json({ error: "Please fill out all required fields with a valid email." }, { status: 400 })
  }

  try {
    await getResend().emails.send({
      from:    process.env.RESEND_FROM_EMAIL ?? "studio@midcitysound.com",
      to:      process.env.RESEND_TO_EMAIL   ?? "midcitysound1@gmail.com",
      replyTo: email,
      subject: `[MCS Contact] ${inquiry || "General"} — ${name}`,
      html: `
        <div style="font-family:sans-serif;color:#1a1a1a;max-width:520px">
          <h2 style="color:#D4AF77">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:8px 0;color:#666;width:120px">Name</td><td><strong>${name}</strong></td></tr>
            <tr><td style="padding:8px 0;color:#666">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
            ${inquiry ? `<tr><td style="padding:8px 0;color:#666">Inquiry</td><td><strong>${inquiry}</strong></td></tr>` : ""}
          </table>
          <p style="white-space:pre-wrap">${message}</p>
        </div>
      `,
    })
    return Response.json({ ok: true })
  } catch {
    // Generic error — no stack traces or provider details in the response
    return Response.json({ error: "Couldn't send your message. Please try again or email us directly." }, { status: 500 })
  }
}
