// src/lib/discount-codes.ts
// Single source of truth for merch discount codes. Used by:
//   - /api/checkout/route.ts — the real, authoritative discount applied to the charge
//   - CartProvider.tsx — the "Apply" preview shown in the cart drawer before checkout
// Keeping both in one file means the preview can never promise a different
// discount than what actually gets charged.

import type { CartItem } from './cart'

export const DISCOUNT_CODES: Record<string, number> = {
  LOCAL10: 0.10,
}

export interface DiscountResult {
  valid: boolean
  code: string
  percent: number       // e.g. 0.10
  discountedTotal: number
  savings: number
}

// Stickers stay full price even with a code applied — margin's too thin to discount.
export function applyDiscount(items: CartItem[], rawCode: string): DiscountResult {
  const code = rawCode.trim().toUpperCase()
  const percent = DISCOUNT_CODES[code] ?? 0

  const original = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  if (!percent) {
    return { valid: false, code, percent: 0, discountedTotal: original, savings: 0 }
  }

  const discountedTotal = items.reduce((sum, i) => {
    const applies = i.type !== 'sticker'
    const price = applies ? i.price * (1 - percent) : i.price
    return sum + price * i.quantity
  }, 0)

  return {
    valid: true,
    code,
    percent,
    discountedTotal,
    savings: original - discountedTotal,
  }
}
