// app/api/webhooks/stripe/route.ts
// Handles: mcs-merch (Printify) + mcs-studio-booking (Turso + Resend + iCal)
//
// Register in Stripe dashboard:
//   URL: https://midcitysound.com/api/webhooks/stripe
//   Events: checkout.session.completed
//
// For local testing:
//   stripe listen --forward-to localhost:3000/api/webhooks/stripe

import { NextResponse }          from "next/server"
import Stripe                    from "stripe"
import { createOrder }           from "@/lib/printify"
import type { PrintifyOrderRecipient } from "@/lib/printify"
import { getDB, initDB }            from "@/lib/db"
import { sendBookingEmails }     from "@/lib/booking-email"
import { sendMerchOrderEmails }  from "@/lib/merch-email"
import { randomUUID }            from "crypto"

function getStripe() { return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" }) }
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const sig  = req.headers.get("stripe-signature")

  if (!sig) return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, WEBHOOK_SECRET)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown"
    console.error("[stripe-webhook] Signature failed:", message)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const source  = session.metadata?.source

    if (source === "mcs-merch") {
      try { await fulfillMerchOrder(session) }
      catch (err) { console.error("[stripe-webhook] Merch fulfillment failed:", err) }
    }

    if (source === "mcs-studio-booking") {
      try { await fulfillStudioBooking(session) }
      catch (err) { console.error("[stripe-webhook] Booking fulfillment failed:", err) }
    }
  }

  return NextResponse.json({ received: true })
}

/* ─── Studio booking fulfillment ─────────────────────────────────────────── */

async function fulfillStudioBooking(session: Stripe.Checkout.Session) {
  await initDB()

  // Idempotency: Stripe retries webhook delivery on timeout/non-200, which
  // would otherwise create duplicate bookings and send duplicate emails.
  const existing = await getDB().execute({
    sql: `SELECT id FROM bookings WHERE stripe_session_id = ?`,
    args: [session.id],
  })
  if (existing.rows.length > 0) {
    console.log(`[stripe-webhook] Booking already processed for session ${session.id}, skipping`)
    return
  }

  const m = session.metadata!

  const bookingId = randomUUID()

  // Save to Turso
  await getDB().execute({
    sql: `INSERT INTO bookings
            (id, room, rate_label, rate_hours, rate_price, date, start_hour,
             client_name, client_email, client_notes, status, stripe_session_id)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [
      bookingId,
      m.room,
      m.rateLabel,
      parseInt(m.rateHours),
      parseInt(m.finalPrice),
      m.date,
      parseInt(m.startHour),
      m.clientName,
      m.clientEmail,
      m.clientNotes ?? "",
      "confirmed",
      session.id,
    ],
  })

  // Send emails + iCal
  await sendBookingEmails({
    id:          bookingId,
    room:        m.room,
    rateLabel:   m.rateLabel,
    rateHours:   parseInt(m.rateHours),
    ratePrice:   parseInt(m.finalPrice),
    date:        m.date,
    startHour:   parseInt(m.startHour),
    clientName:  m.clientName,
    clientEmail: m.clientEmail,
    clientNotes: m.clientNotes ?? "",
  })
}

/* ─── Merch order fulfillment ─────────────────────────────────────────────── */

async function fulfillMerchOrder(session: Stripe.Checkout.Session) {
  await initDB()

  // Idempotency: check BEFORE doing anything with side effects (Printify order,
  // emails) — not just at insert time, since by then the Printify order would
  // already have been double-submitted and the customer double-emailed.
  const existing = await getDB().execute({
    sql: `SELECT id FROM merch_orders WHERE stripe_session_id = ?`,
    args: [session.id],
  })
  if (existing.rows.length > 0) {
    console.log(`[stripe-webhook] Merch order already processed for session ${session.id}, skipping`)
    return
  }

  type CartItemPayload = {
    variantId: number; productId: string; quantity: number; price: number; name: string; variantName?: string
  }

  const cartId = session.metadata?.cartId
  let cartItems: CartItemPayload[]

  if (cartId) {
    const cartRow = await getDB().execute({
      sql: `SELECT items FROM pending_carts WHERE id = ?`,
      args: [cartId],
    })
    if (!cartRow.rows.length) throw new Error(`No pending_carts row found for cartId ${cartId} (session ${session.id})`)
    cartItems = JSON.parse(cartRow.rows[0].items as string)
  } else if (session.metadata?.cartItems) {
    // Legacy format — sessions created before the pending_carts migration
    // stored the cart directly in metadata instead of a cartId reference.
    // Kept for backward compatibility so old unprocessed/retried webhook
    // events (like a resend of a session from before this fix existed)
    // still resolve correctly instead of failing on a missing cartId.
    cartItems = JSON.parse(session.metadata.cartItems)
  } else {
    throw new Error(`No cartId or cartItems in metadata for session ${session.id}`)
  }

  if (!cartItems.length) throw new Error(`Empty cart for cartId ${cartId} (session ${session.id})`)

  const shipping = session.collected_information?.shipping_details
  const customer = session.customer_details
  if (!shipping?.address || !customer) throw new Error(`Missing shipping/customer for session ${session.id}`)

  const fullName = shipping.name ?? customer.name ?? "Customer"
  const [firstName, ...rest] = fullName.trim().split(/\s+/)
  const lastName = rest.join(" ") || "—"

  const recipient: PrintifyOrderRecipient = {
    first_name: firstName,
    last_name:  lastName,
    address1:   shipping.address.line1 ?? "",
    address2:   shipping.address.line2 ?? undefined,
    city:       shipping.address.city ?? "",
    region:     shipping.address.state ?? "",
    country:    shipping.address.country ?? "US",
    zip:        shipping.address.postal_code ?? "",
    email:      customer.email ?? undefined,
    phone:      customer.phone ?? undefined,
  }

  const printifyItems = cartItems.map(item => ({
    product_id: item.productId,
    variant_id: item.variantId,
    quantity:   item.quantity,
  }))

  // Try Printify separately from everything else — a failure here should NOT
  // prevent the order from being recorded or the confirmation emails from
  // going out. Payment already succeeded; the customer paid, full stop.
  let printifyOrderId: string | null = null
  let printifyError: string | null = null
  try {
    const result = await createOrder({ recipient, items: printifyItems })
    printifyOrderId = result.id
  } catch (err) {
    printifyError = err instanceof Error ? err.message : String(err)
    console.error("[stripe-webhook] Printify order creation failed:", printifyError)
  }

  const orderId = randomUUID()
  const totalPaid = session.amount_total ?? 0

  await getDB().execute({
    sql: `INSERT INTO merch_orders
            (id, stripe_session_id, customer_name, customer_email, shipping_address,
             items, total_paid, discount_code, status, printify_order_id, printify_error)
          VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    args: [
      orderId,
      session.id,
      fullName,
      customer.email ?? "",
      JSON.stringify({
        line1: recipient.address1, line2: recipient.address2 ?? "",
        city: recipient.city, region: recipient.region, zip: recipient.zip, country: recipient.country,
      }),
      JSON.stringify(cartItems.map(i => ({ name: i.name, variantName: i.variantName ?? "", quantity: i.quantity, price: i.price }))),
      totalPaid,
      session.metadata?.discountCode ?? "",
      printifyOrderId ? "submitted" : "printify_failed",
      printifyOrderId,
      printifyError,
    ],
  })

  // Cart data is now safely copied into merch_orders.items — the pending
  // row was only ever needed to get past Stripe's metadata size limit.
  // Legacy sessions (old cartItems metadata format) never had one to begin with.
  if (cartId) {
    await getDB().execute({
      sql: `DELETE FROM pending_carts WHERE id = ?`,
      args: [cartId],
    })
  }

  // Email failure should never be silent — the order is already safely
  // recorded above regardless of whether this succeeds. If it fails, record
  // why directly on the order so it's visible in /admin/orders without
  // needing to go hunting through logs or a third-party dashboard.
  let emailError: string | null = null
  try {
    await sendMerchOrderEmails({
      id:              orderId,
      customerName:    fullName,
      customerEmail:   customer.email ?? "",
      shippingAddress: {
        line1: recipient.address1, line2: recipient.address2,
        city: recipient.city, region: recipient.region, zip: recipient.zip, country: recipient.country,
      },
      items:           cartItems.map(i => ({ name: i.name, variantName: i.variantName ?? "", quantity: i.quantity, price: i.price })),
      totalPaid,
      discountCode:    session.metadata?.discountCode ?? "",
      printifyOrderId,
      printifyError,
    })
  } catch (err) {
    emailError = err instanceof Error ? err.message : String(err)
    console.error("[stripe-webhook] Order email failed:", emailError)
    await getDB().execute({
      sql: `UPDATE merch_orders SET email_error = ? WHERE id = ?`,
      args: [emailError, orderId],
    })
  }

  // Surface failures to the webhook's own error log/return path too, even
  // though the order itself is already safely recorded either way.
  if (printifyError) throw new Error(`Printify order creation failed (order recorded as ${orderId}): ${printifyError}`)
  if (emailError) throw new Error(`Order email failed (order recorded as ${orderId}): ${emailError}`)
}
