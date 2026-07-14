// app/api/checkout/route.ts
// Creates a Stripe Checkout session from the cart contents.
// Called by CartProvider's checkout() function.
// Lives in MCS repo only — all purchases flow through here.

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import type { CartItem } from '@/lib/cart'
import { rateLimit, clientIp } from '@/lib/rate-limit'
import { DISCOUNT_CODES } from '@/lib/discount-codes'

function getStripe() { return new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia', }) }

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? 'https://midcitysound.vercel.app'


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

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',

      line_items: items.map(item => {
        // Stickers stay full price even with a code applied — margin's too thin to discount
        const applies = discountPct > 0 && item.type !== 'sticker'
        const finalPrice = applies
          ? Math.round(item.price * (1 - discountPct) * 100) / 100
          : item.price

        return {
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
        }
      }),

      // Collect shipping address for Printify order creation
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'NL', 'SE', 'JP'],
      },

      // Automatic tax calculation — enable in Stripe dashboard if desired
      // automatic_tax: { enabled: true },

      // Store full cart in metadata so the webhook can reconstruct the Printify order
      // and record/email a real order with size/color, not just product name.
      // Stripe metadata values max 500 chars — fine for typical small-cart sizes here.
      metadata: {
        cartItems: JSON.stringify(
          items.map(i => ({
            variantId:   i.variantId,
            productId:   i.productId,
            quantity:    i.quantity,
            price:       i.price,
            name:        i.name,
            variantName: i.variantName,
          }))
        ),
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
