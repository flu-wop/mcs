// src/app/api/admin/retry-printify/route.ts
// Retries Printify order creation for an order that failed the first time
// (e.g. missing phone number before phone_number_collection was enabled).
// Only works for orders created after the cart_id/pending_carts-preservation
// fix — older failed orders lost their product/variant ID data and need to
// be placed manually in Printify's dashboard instead (the admin/orders page
// says so directly under those).
// Protected by src/middleware.ts (admin session cookie).

import { NextResponse } from "next/server"
import { getDB, initDB } from "@/lib/db"
import { createOrder, type PrintifyOrderRecipient, type PrintifyOrderLineItem } from "@/lib/printify"

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json()
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 })
    }

    await initDB()
    const orderResult = await getDB().execute({
      sql: `SELECT customer_name, customer_email, shipping_address, cart_id, printify_order_id
            FROM merch_orders WHERE id = ?`,
      args: [orderId],
    })
    if (orderResult.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    const order = orderResult.rows[0] as unknown as {
      customer_name: string; customer_email: string; shipping_address: string
      cart_id: string | null; printify_order_id: string | null
    }

    if (order.printify_order_id) {
      return NextResponse.json({ error: "This order already has a Printify order — nothing to retry." }, { status: 400 })
    }
    if (!order.cart_id) {
      return NextResponse.json({
        error: "No cart data preserved for this order (it failed before the retry fix existed) — create it manually in Printify instead.",
      }, { status: 400 })
    }

    const cartResult = await getDB().execute({
      sql: `SELECT items FROM pending_carts WHERE id = ?`,
      args: [order.cart_id],
    })
    if (cartResult.rows.length === 0) {
      return NextResponse.json({
        error: "Cart data no longer exists for this order — create it manually in Printify instead.",
      }, { status: 400 })
    }

    const cartItems = JSON.parse(cartResult.rows[0].items as string) as
      { variantId: number; productId: string; quantity: number }[]
    const address = JSON.parse(order.shipping_address) as
      { line1: string; line2?: string; city: string; region: string; zip: string; country: string }

    const [firstName, ...rest] = order.customer_name.trim().split(/\s+/)
    const recipient: PrintifyOrderRecipient = {
      first_name: firstName,
      last_name:  rest.join(" ") || "—",
      address1:   address.line1,
      address2:   address.line2 || undefined,
      city:       address.city,
      region:     address.region,
      country:    address.country,
      zip:        address.zip,
      email:      order.customer_email,
      phone:      "000-000-0000", // no real phone on file for pre-fix orders
    }

    const printifyItems: PrintifyOrderLineItem[] = cartItems.map(item => ({
      product_id: item.productId,
      variant_id: item.variantId,
      quantity:   item.quantity,
    }))

    const result = await createOrder({ recipient, items: printifyItems })

    await getDB().execute({
      sql: `UPDATE merch_orders SET printify_order_id = ?, printify_error = NULL, status = 'submitted' WHERE id = ?`,
      args: [result.id, orderId],
    })
    await getDB().execute({
      sql: `DELETE FROM pending_carts WHERE id = ?`,
      args: [order.cart_id],
    })

    return NextResponse.json({ ok: true, printifyOrderId: result.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
