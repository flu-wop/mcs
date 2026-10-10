// src/lib/booking-discounts.ts
// Studio session discount codes. Server-only: the booking pages check a code
// through /api/booking-discount, so the list never ships in the browser bundle.
import "server-only"

const BOOKING_DISCOUNT_CODES: Record<string, number> = {
  REGULAR30: 0.30,
  STUDIO10:  0.10,
}

export function bookingDiscount(code: unknown): number {
  if (typeof code !== "string") return 0
  return BOOKING_DISCOUNT_CODES[code.trim().toUpperCase()] ?? 0
}
