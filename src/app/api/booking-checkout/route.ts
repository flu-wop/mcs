// src/app/api/booking-checkout/route.ts
// Creates a Stripe Checkout session for a studio room booking.
// On success, the webhook at /api/webhooks/stripe saves to Turso + sends emails.

import { NextResponse } from "next/server"
import Stripe           from "stripe"
import { initDB }       from "@/lib/db"
import { rateLimit, clientIp } from "@/lib/rate-limit"

function getStripe() { return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" }) }
const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://midcitysound.com"

export async function POST(req: Request) {
  try {
    const ok = await rateLimit(`booking-checkout:${clientIp(req)}`, 10, 600)
    if (!ok) return NextResponse.json({ error: "Too many requests — try again shortly." }, { status: 429 })

    await initDB()
    const body = await req.json()
    const {
      room, rateId, rateLabel, rateHours, ratePrice,
      date, startHour, clientName, clientEmail, clientNotes,
      discountCode,
    } = body

    // Basic validation
    if (!room || !rateLabel || !ratePrice || !date || startHour == null || !clientName || !clientEmail) {
      return NextResponse.json({ error: "Missing required booking fields" }, { status: 400 })
    }

    // Apply discount server-side
    const DISCOUNT_CODES: Record<string, number> = {
      REGULAR30: 0.30,
      STUDIO10:  0.10,
    }
    const discountPct = discountCode ? (DISCOUNT_CODES[discountCode.toUpperCase()] ?? 0) : 0
    const finalPrice  = Math.round(ratePrice * (1 - discountPct))

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
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
      },
      customer_email: clientEmail,
      custom_text: {
        submit: {
          message: "Your booking is subject to studio manager confirmation within 24 hours.",
        },
      },
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
