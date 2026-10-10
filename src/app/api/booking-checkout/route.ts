// src/app/api/booking-checkout/route.ts
// Creates a Stripe Checkout session for a studio room booking.
// On success, the webhook at /api/webhooks/stripe saves to Turso + sends emails.

import { NextResponse } from "next/server"
import Stripe           from "stripe"
import { initDB }       from "@/lib/db"
import { rateLimit, clientIp } from "@/lib/rate-limit"
import { getBookedRanges, hasConflict } from "@/lib/availability"
import { quoteStudio } from "@/lib/studio-rates"
import { bookingDiscount } from "@/lib/booking-discounts"

function getStripe() { return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" }) }
const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://midcitysound.com"

export async function POST(req: Request) {
  try {
    const ok = await rateLimit(`booking-checkout:${clientIp(req)}`, 10, 600)
    if (!ok) return NextResponse.json({ error: "Too many requests — try again shortly." }, { status: 429 })

    await initDB()
    const body = await req.json()
    const {
      room, rateId, rateHours: requestedHours,
      date, startHour, clientName, clientEmail, clientNotes,
      discountCode, funnelSessionId,
    } = body

    // Basic validation
    if (!room || !rateId || !date || startHour == null || !clientName || !clientEmail) {
      return NextResponse.json({ error: "Missing required booking fields" }, { status: 400 })
    }
    if (!["A", "B", "C"].includes(room) || !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
      return NextResponse.json({ error: "Invalid room or date" }, { status: 400 })
    }

    // Price comes from the server's rate table, never from the request body.
    const quote = quoteStudio(String(rateId), requestedHours)
    if (!quote) return NextResponse.json({ error: "Unknown package" }, { status: 400 })
    const rateLabel = quote.label
    const rateHours = quote.hours
    const ratePrice = quote.cents

    // Reject if this slot overlaps an existing pending/confirmed booking for the room —
    // the UI greys these out already, this is the defense-in-depth check that can't be bypassed.
    const existing = await getBookedRanges(room, date)
    if (hasConflict(existing, Number(startHour), Number(rateHours) || 1)) {
      return NextResponse.json(
        { error: "That time slot was just booked by someone else. Please choose another." },
        { status: 409 }
      )
    }

    // Apply discount server-side
    const discountPct = bookingDiscount(discountCode)
    const finalPrice  = Math.round(ratePrice * (1 - discountPct))

    const session = await getStripe().checkout.sessions.create({
      mode:                 "payment",
      line_items: [{
        price_data: {
          currency:     "usd",
          product_data: {
            name:        `Mid City Sound — Studio ${room} · ${rateLabel}`,
            description: `${rateHours} hour${rateHours !== 1 ? "s" : ""} · ${date} starting at ${startHour}:00`,
          },
          unit_amount: finalPrice,
        },
        quantity: 1,
      }],
      metadata: {
        source:      "mcs-studio-booking",
        room,
        rateId,
        rateLabel,
        rateHours:   String(rateHours),
        ratePrice:   String(ratePrice),
        finalPrice:  String(finalPrice),
        date,
        startHour:   String(startHour),
        clientName,
        clientEmail,
        clientNotes: clientNotes ?? "",
        discountCode: discountCode ?? "",
        funnel_session_id: funnelSessionId ?? "unknown",
      },
      customer_email: clientEmail,
      success_url: `${BASE_URL}/studio/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${BASE_URL}/studio`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("[/api/booking-checkout]", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
