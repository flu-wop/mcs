// app/api/checkout/route.ts
// Creates a Stripe Checkout session from the cart contents.
// Called by CartProvider's checkout() function.
// Lives in MCS repo only — all purchases flow through here.

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import type { CartItem } from '@/lib/cart'

function getStripe() { return new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia', }) }

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? 'https://midcitysound.vercel.app'

export async function POST(req: Request) {
  try {
    const body = await req.json() as { items: CartItem[] }
    const { items } = body

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

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',

      line_items: items.map(item => ({
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
          unit_amount: Math.round(item.price * 100), // Stripe uses cents
        },
        quantity: item.quantity,
      })),

      // Collect shipping address for Printify order creation
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'NL', 'SE', 'JP'],
      },

      // Automatic tax calculation — enable in Stripe dashboard if desired
      // automatic_tax: { enabled: true },

      // Store full cart in metadata so the webhook can reconstruct the Printify order
      // Stripe metadata values max 500 chars — serialize only what Printify needs
      // (Printify requires BOTH product_id and variant_id per line item)
      metadata: {
        cartItems: JSON.stringify(
          items.map(i => ({
            variantId: i.variantId,
            productId: i.productId,
            quantity:  i.quantity,
            price:     i.price,
            name:      i.name,
          }))
        ),
        source: 'mcs-merch',
      },

      // Branding
      custom_text: {
        submit: {
          message: 'Ships from New Orleans via Printify · Usually 3–7 business days',
        },
      },

      success_url: `${BASE_URL}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${BASE_URL}/shop`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/checkout]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
