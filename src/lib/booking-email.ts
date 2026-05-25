// src/lib/booking-email.ts
// Generates .ics and sends confirmation emails via Resend.
// Called from the Stripe webhook after payment confirmed.

import { Resend } from "resend"
import ics       from "ics"

function getResend() { return new Resend(process.env.RESEND_API_KEY) }

export interface BookingPayload {
  id:          string
  room:        string
  rateLabel:   string
  rateHours:   number
  ratePrice:   number
  date:        string   // "YYYY-MM-DD"
  startHour:   number   // 9–20
  clientName:  string
  clientEmail: string
  clientNotes: string
}

function buildIcs(b: BookingPayload): string {
  const [y, mo, d] = b.date.split("-").map(Number)
  const { error, value } = ics.createEvent({
    uid:         `mcs-booking-${b.id}@midcitysound.com`,
    title:       `MCS Studio ${b.room} — ${b.rateLabel}`,
    description: [
      `Client: ${b.clientName}`,
      `Room: Studio ${b.room}`,
      `Session: ${b.rateLabel}`,
      b.clientNotes ? `Notes: ${b.clientNotes}` : "",
    ].filter(Boolean).join("\n"),
    location:    "530 S Norman C Francis Pkwy, New Orleans, LA",
    start:       [y, mo, d, b.startHour, 0],
    end:         [y, mo, d, b.startHour + b.rateHours, 0],
    status:      "CONFIRMED",
    organizer:   { name: "Mid City Sound Studios", email: process.env.RESEND_FROM_EMAIL ?? "studio@midcitysound.com" },
    attendees:   [{ name: b.clientName, email: b.clientEmail, rsvp: false }],
  })
  if (error || !value) throw new Error(`ics error: ${error}`)
  return value
}

function formatTime(h: number) {
  if (h < 12) return `${h}:00 AM`
  if (h === 12) return "12:00 PM"
  return `${h - 12}:00 PM`
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  })
}

export async function sendBookingEmails(booking: BookingPayload) {
  const icsData    = buildIcs(booking)
  const icsBase64  = Buffer.from(icsData).toString("base64")

  const formattedDate = formatDate(booking.date)
  const startFmt      = formatTime(booking.startHour)
  const endFmt        = formatTime(booking.startHour + booking.rateHours)
  const priceFmt      = `$${(booking.ratePrice / 100).toFixed(0)}`

  const sharedAttachment = {
    filename:    "studio-booking.ics",
    content:     icsBase64,
    contentType: "text/calendar",
  }

  const clientHtml = `
    <div style="font-family:sans-serif;color:#1a1a1a;max-width:520px">
      <h2 style="color:#D4AF77">Studio Booking Confirmed</h2>
      <p>Hi ${booking.clientName}, your session at Mid City Sound Studios is confirmed.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 0;color:#666;width:120px">Room</td><td><strong>Studio ${booking.room}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#666">Session</td><td><strong>${booking.rateLabel}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#666">Date</td><td><strong>${formattedDate}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#666">Time</td><td><strong>${startFmt} – ${endFmt}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#666">Total Paid</td><td><strong>${priceFmt}</strong></td></tr>
        ${booking.clientNotes ? `<tr><td style="padding:8px 0;color:#666">Notes</td><td>${booking.clientNotes}</td></tr>` : ""}
      </table>
      <p style="color:#666;font-size:13px">Address: 530 S Norman C Francis Pkwy, New Orleans, LA<br>
      Questions? Reply to this email or contact us at midcitysound1@gmail.com</p>
      <p style="color:#999;font-size:12px">A calendar invite is attached. See you in the studio.</p>
    </div>
  `

  const studioHtml = `
    <div style="font-family:sans-serif;color:#1a1a1a;max-width:520px">
      <h2 style="color:#D4AF77">New Studio Booking — Studio ${booking.room}</h2>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 0;color:#666;width:140px">Client</td><td><strong>${booking.clientName}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#666">Email</td><td><a href="mailto:${booking.clientEmail}">${booking.clientEmail}</a></td></tr>
        <tr><td style="padding:8px 0;color:#666">Room</td><td><strong>Studio ${booking.room}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#666">Session</td><td><strong>${booking.rateLabel}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#666">Date</td><td><strong>${formattedDate}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#666">Time</td><td><strong>${startFmt} – ${endFmt}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#666">Paid</td><td><strong>${priceFmt}</strong></td></tr>
        ${booking.clientNotes ? `<tr><td style="padding:8px 0;color:#666">Client Notes</td><td>${booking.clientNotes}</td></tr>` : ""}
        <tr><td style="padding:8px 0;color:#666">Booking ID</td><td style="font-family:monospace;font-size:12px">${booking.id}</td></tr>
      </table>
      <p style="color:#666;font-size:13px">iCal invite attached. Assign engineer in group chat.</p>
    </div>
  `

  // Send client confirmation
  await getResend().emails.send({
    from:        process.env.RESEND_FROM_EMAIL ?? "studio@midcitysound.com",
    to:          booking.clientEmail,
    subject:     `Booking Confirmed — Studio ${booking.room} · ${formattedDate}`,
    html:        clientHtml,
    attachments: [sharedAttachment],
  })

  // Send studio notification
  await getResend().emails.send({
    from:        process.env.RESEND_FROM_EMAIL ?? "studio@midcitysound.com",
    to:          process.env.RESEND_TO_EMAIL   ?? "midcitysound1@gmail.com",
    subject:     `[MCS Booking] ${booking.clientName} · Studio ${booking.room} · ${formattedDate}`,
    html:        studioHtml,
    attachments: [sharedAttachment],
  })
}
