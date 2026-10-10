// src/app/api/engineer-checkout/route.ts
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { initDB } from "@/lib/db"
import { rateLimit, clientIp } from "@/lib/rate-limit"
import { getBookedRanges, hasConflict } from "@/lib/availability"
import { ENGINEERS, ENGINEER_PAGE_RATE_CENTS } from "@/lib/engineers"
import { quoteEngineer } from "@/lib/studio-rates"
import { bookingDiscount } from "@/lib/booking-discounts"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

export async function POST(req: NextRequest) {
  try {
    const ok = await rateLimit(`engineer-checkout:${clientIp(req)}`, 10, 600)
    if (!ok) return NextResponse.json({ error: "Too many requests — try again shortly." }, { status: 429 })

    const body = await req.json()
    const {
      engineerSlug,
      room, rateId, rateHours: requestedHours,
      date, startHour,
      clientName, clientEmail, clientNotes,
      discountCode, funnelSessionId,
    } = body

    /* ── Validate required fields ── */
    if (!engineerSlug || !room || !rateId || !date || !clientName || !clientEmail) {
      return NextResponse.json({ error: "Missing required booking fields" }, { status: 400 })
    }
    if (!ENGINEERS.some(e => e.slug === engineerSlug) || !["A", "B", "C"].includes(room) || !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
      return NextResponse.json({ error: "Invalid engineer, room or date" }, { status: 400 })
    }

    const engineerName = ENGINEERS.find(e => e.slug === engineerSlug)!.name

    // Price comes from the server's rate table, never from the request body.
    const quote = quoteEngineer(String(rateId), requestedHours)
    if (!quote) return NextResponse.json({ error: "Unknown package" }, { status: 400 })
    const rateLabel = quote.label
    const rateHours = quote.hours
    const ratePrice = quote.cents

    // Reject if this slot overlaps an existing pending/confirmed booking for the room —
    // the UI greys these out already, this is the defense-in-depth check that can't be bypassed.
    await initDB()
    const existing = await getBookedRanges(room, date)
    if (hasConflict(existing, Number(startHour), Number(rateHours) || 1)) {
      return NextResponse.json(
        { error: "That time slot was just booked by someone else. Please choose another." },
        { status: 409 }
      )
    }

    /* ── Apply discount server-side ── */
    const discountRate = bookingDiscount(discountCode)
    const finalPrice   = Math.round(Number(ratePrice) * (1 - discountRate))

    if (finalPrice < 50) {
      return NextResponse.json({ error: "Total must be at least $0.50" }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL ?? "https://www.midcitysound.com"
    const stripe  = getStripe()

    /* ── Create Stripe Checkout session ── */
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: clientEmail,
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: finalPrice,
          product_data: {
            name: `Mid City Sound — ${rateLabel} with ${engineerName}`,
            description: `Studio ${room} · ${date} starting at ${startHour}:00`,
          },
        },
        quantity: 1,
      }],
      metadata: {
        source: "mcs-engineer-booking",
        engineerName, engineerSlug,
        room, rateLabel,
        rateHours:  String(rateHours),
        ratePrice:  String(ratePrice),
        finalPrice: String(finalPrice),
        date,
        startHour:   String(startHour),
        clientName, clientEmail,
        clientNotes: clientNotes ?? "",
        discountCode: discountCode ?? "",
        bookingType: "engineer",
        funnel_session_id: funnelSessionId ?? "unknown",
      },
      success_url: `${baseUrl}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/book/${engineerSlug}`,
    })

    /* ── Save pending booking to Turso ── */
    const db = await initDB()
    const id = crypto.randomUUID()
    const payoutAmountCents = Number(rateHours) * ENGINEER_PAGE_RATE_CENTS
    await db.execute({
      sql: `INSERT INTO bookings
              (id, room, rate_label, rate_hours, rate_price,
               date, start_hour, client_name, client_email,
               client_notes, status, stripe_session_id,
               engineer_slug, payout_rate_cents, payout_amount_cents)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        id,
        room,
        `${rateLabel} · ${engineerName}`,   // embed engineer in rate_label for admin view
        rateHours,
        finalPrice,
        date,
        startHour,
        clientName,
        clientEmail,
        clientNotes ?? "",
        "pending",
        session.id,
        engineerSlug,
        ENGINEER_PAGE_RATE_CENTS,
        payoutAmountCents,
      ],
    })

    return NextResponse.json({ url: session.url })

  } catch (err: unknown) {
    console.error("[engineer-checkout]", err)
    const message = err instanceof Error ? err.message : "Checkout failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
