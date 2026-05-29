// src/app/api/groove-checkout/route.ts
import { NextResponse } from "next/server"
import Stripe from "stripe"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

export async function POST() {
  try {
    const stripe  = getStripe()
    const baseUrl = process.env.NEXT_PUBLIC_URL ?? "https://www.midcitysound.com"

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 99, // $0.99
            product_data: {
              name: "Groove of the Week — Full Track",
              description:
                "High-quality MP3 from Mid City Sound Studios, New Orleans. Yours to keep forever.",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/groove/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/groove`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Checkout failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
