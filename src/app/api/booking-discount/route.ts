// src/app/api/booking-discount/route.ts
// Checks a studio discount code for the booking pages' "Apply" button.
// Rate-limited so codes can't be guessed by brute force.
import { NextResponse } from "next/server"
import { rateLimit, clientIp } from "@/lib/rate-limit"
import { bookingDiscount } from "@/lib/booking-discounts"

export async function POST(req: Request) {
  const ok = await rateLimit(`booking-discount:${clientIp(req)}`, 10, 600)
  if (!ok) return NextResponse.json({ valid: false, error: "Too many tries. Wait a few minutes and try again." }, { status: 429 })
  let code: unknown
  try { ({ code } = await req.json()) } catch { return NextResponse.json({ valid: false }, { status: 400 }) }
  if (typeof code !== "string" || code.length > 40) return NextResponse.json({ valid: false }, { status: 400 })
  const pct = bookingDiscount(code)
  return NextResponse.json(pct > 0 ? { valid: true, percent: pct } : { valid: false })
}
