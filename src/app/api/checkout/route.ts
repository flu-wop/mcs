// app/api/checkout/route.ts
// Creates a Stripe Checkout session from the cart contents.
// Called by CartProvider's checkout() function.
// Lives in MCS repo only — all purchases flow through here.

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import type { CartItem } from '@/lib/cart'
import { rateLimit, clientIp } from '@/lib/rate-limit'
import { DISCOUNT_CODES } from '@/lib/discount-codes'
import { initDB, getDB } from '@/lib/db'
import { randomUUID } from 'crypto'

function getStripe() { return new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia', }) }

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? 'https://midcitysound.com'

// Free shipping over this subtotal (post-discount), flat rate under it.
const FREE_SHIPPING_THRESHOLD = 75.00
const FLAT_SHIPPING_RATE      = 5.99


export async function POST(req: Request) {
  try {
    const ok = await rateLimit(`checkout:${clientIp(req)}`, 10, 600) // 10 per 10 min
    if (!ok) return NextResponse.json({ error: 'Too many requests — try again shortly.' }, { status: 429 })

    const body = await req.json() as { items: CartItem[]; discountCode?: string }
    const { items, discountCode } = body

    if (!items?.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Validate all items have required fields
    for (const item of items) {
      if (!item.variantId || !item.productId || !item.price || !item.quantity) {
        return NextResponse.json(
          { error: `Invalid cart item: ${item.name}` },
          { status: 400 }
        )
      }
    }

    const discountPct = discountCode
      ? (DISCOUNT_CODES[discountCode.toUpperCase()] ?? 0)
      : 0

    // Compute each item's final (post-discount) price once — used for both
    // the Stripe line items and the free-shipping threshold check below, so
    // the two can never drift out of sync with each other.
    const pricedItems = items.map(item => {
      const applies = discountPct > 0 && item.type !== 'sticker'
      const finalPrice = applies
        ? Math.round(item.price * (1 - discountPct) * 100) / 100
        : item.price
      return { item, finalPrice }
    })

    const subtotal = pricedItems.reduce((sum, { item, finalPrice }) => sum + finalPrice * item.quantity, 0)
    const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD

    // Full cart goes to Turso, not Stripe metadata — a single metadata value
    // caps at 500 characters, which a cart of even 4-5 items with real
    // product/variant names blows past easily. Only a short reference ID
    // goes to Stripe; the webhook looks the real cart up by that ID.
    const cartId = randomUUID()
    await initDB()
    await getDB().execute({
      sql: `INSERT INTO pending_carts (id, items) VALUES (?, ?)`,
      args: [
        cartId,
        JSON.stringify(items.map(i => ({
          variantId:   i.variantId,
          productId:   i.productId,
          quantity:    i.quantity,
          price:       i.price,
          name:        i.name,
          variantName: i.variantName,
        }))),
      ],
    })

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',

      line_items: pricedItems.map(({ item, finalPrice }) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.variantName,
            images: item.thumbnailUrl ? [item.thumbnailUrl] : [],
            metadata: {
              brand:      item.brand,
              type:       item.type,
              slug:       item.slug,
            },
          },
          unit_amount: Math.round(finalPrice * 100), // Stripe uses cents
        },
        quantity: item.quantity,
      })),

      shipping_options: [
        freeShipping
          ? {
              shipping_rate_data: {
                type: 'fixed_amount',
                fixed_amount: { amount: 0, currency: 'usd' },
                display_name: `Free shipping (orders $${FREE_SHIPPING_THRESHOLD.toFixed(0)}+)`,
                delivery_estimate: {
                  minimum: { unit: 'business_day', value: 3 },
                  maximum: { unit: 'business_day', value: 7 },
                },
              },
            }
          : {
              shipping_rate_data: {
                type: 'fixed_amount',
                fixed_amount: { amount: Math.round(FLAT_SHIPPING_RATE * 100), currency: 'usd' },
                display_name: 'Standard shipping',
                delivery_estimate: {
                  minimum: { unit: 'business_day', value: 3 },
                  maximum: { unit: 'business_day', value: 7 },
                },
              },
            },
      ],

      // Collect shipping address for Printify order creation
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'NL', 'SE', 'JP'],
      },

      // Printify requires a phone number on the shipping address (address_to.phone)
      // to create an order — without this, Printify order creation fails validation
      // AFTER the customer has already been charged. Stripe does not collect phone
      // by default; this must be explicitly enabled.
      phone_number_collection: {
        enabled: true,
      },

      // Sales tax collection — NOT enabled yet. This is separate from any tax
      // Printify charges you on production cost (that's Printify's own tax
      // obligation, unrelated to what a customer owes their state).
      // To turn this on: activate Stripe Tax in the Stripe Dashboard, confirm
      // your registered tax jurisdictions there, then set:
      //   automatic_tax: { enabled: true },
      // Stripe calculates the correct destination-based rate automatically
      // once that's active — deliberately not flipping this on in code alone,
      // since collecting tax you're not registered for is a compliance issue,
      // not just a settings toggle.

      // Only a short reference goes here — the real cart lives in Turso
      // (pending_carts table), looked up by this ID in the webhook. Stripe
      // metadata values cap at 500 characters; a real cart's JSON doesn't.
      metadata: {
        cartId,
        source: 'mcs-merch',
        discountCode: discountPct > 0 ? discountCode!.toUpperCase() : '',
      },

      // Branding
      custom_text: {
        submit: {
          message: 'Ships from New Orleans via Printify · Usually 3–7 business days',
        },
      },

      success_url: `${BASE_URL}/merch/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${BASE_URL}/merch`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/checkout]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
