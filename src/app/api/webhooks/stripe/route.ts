// app/api/webhooks/stripe/route.ts
// Listens for Stripe's checkout.session.completed event.
// Verifies the signature, then immediately creates a Printful order.
// This is the critical link — fulfillment MUST happen here, not on the
// success page, because customers aren't guaranteed to return to the site.
//
// Register this endpoint in Stripe dashboard:
//   Developers → Webhooks → Add endpoint
//   URL: https://midcitysound.vercel.app/api/webhooks/stripe
//   Events: checkout.session.completed
//
// For local testing:
//   stripe listen --forward-to localhost:3000/api/webhooks/stripe

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createOrder, type PrintfulOrderRecipient } from '@/lib/printful'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

// CRITICAL: body must be raw bytes for Stripe signature verification.
// Next.js App Router gives us the raw Request — do NOT call req.json() here.
export async function POST(req: Request) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  // ── 1. Verify signature ───────────────────────────────────────────────────
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[stripe-webhook] Signature verification failed:', message)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  // ── 2. Handle checkout.session.completed ──────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Only process orders that came from our merch shop
    if (session.metadata?.source !== 'mcs-merch') {
      return NextResponse.json({ received: true })
    }

    try {
      await fulfillOrder(session)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      // Log but return 200 — Stripe will retry on 5xx, not on 200.
      // Manual recovery via Stripe dashboard if needed.
      console.error('[stripe-webhook] Fulfillment failed for session', session.id, ':', message)
      // In production, also alert via Resend/email here
    }
  }

  // Acknowledge all other event types
  return NextResponse.json({ received: true })
}

// ─── Order fulfillment ────────────────────────────────────────────────────────

async function fulfillOrder(session: Stripe.Checkout.Session) {
  // Parse cart items from session metadata
  const rawItems = session.metadata?.cartItems
  if (!rawItems) {
    throw new Error(`No cartItems in metadata for session ${session.id}`)
  }

  const cartItems = JSON.parse(rawItems) as Array<{
    variantId: number
    quantity:  number
    price:     number
    name:      string
  }>

  if (!cartItems.length) {
    throw new Error(`Empty cartItems for session ${session.id}`)
  }

  // Build Printful recipient from Stripe shipping address
  const shipping = (session as any).shipping_details
  const customer = session.customer_details

  if (!shipping?.address || !customer) {
    throw new Error(`Missing shipping/customer details for session ${session.id}`)
  }

  const recipient: PrintfulOrderRecipient = {
    name:         shipping.name ?? customer.name ?? 'Customer',
    address1:     shipping.address.line1 ?? '',
    address2:     shipping.address.line2 ?? undefined,
    city:         shipping.address.city ?? '',
    state_code:   shipping.address.state ?? '',
    country_code: shipping.address.country ?? 'US',
    zip:          shipping.address.postal_code ?? '',
    email:        customer.email ?? undefined,
    phone:        customer.phone ?? undefined,
  }

  // Map cart items → Printful order items
  const items = cartItems.map(item => ({
    sync_variant_id: item.variantId,
    quantity:        item.quantity,
    retail_price:    item.price.toFixed(2),
  }))

  // Create the Printful order (confirm: true — immediately send to production)
  const order = await createOrder({
    recipient,
    items,
    confirm: true,
  })

  console.log(
    `[stripe-webhook] Printful order created: #${order.id} (${order.status})`,
    `for Stripe session ${session.id}`
  )

  // TODO: Send order confirmation email via Resend
  // await sendOrderConfirmation({ to: customer.email, session, order })
}
