// src/lib/admin-session.ts
// Signed admin session cookie — replaces HTTP Basic Auth with a real login page.
// The cookie value is `${expiryTimestamp}.${hmacSignature}` — signed with a
// server-only secret, so it can't be forged by setting an arbitrary cookie
// value in devtools. Verification just recomputes the HMAC and compares.

import { createHmac, timingSafeEqual } from "crypto"

export const ADMIN_SESSION_COOKIE = "mcs_admin_session"
const SESSION_LENGTH_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

function secret(): string {
  // Reuses ADMIN_PASSWORD as the signing secret — one less env var to manage,
  // and it's already a private server-only value.
  const s = process.env.ADMIN_PASSWORD
  if (!s) throw new Error("ADMIN_PASSWORD is not set")
  return s
}

export function signSessionToken(): string {
  const expires = Date.now() + SESSION_LENGTH_MS
  const sig = createHmac("sha256", secret()).update(String(expires)).digest("hex")
  return `${expires}.${sig}`
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false
  const [expiresStr, sig] = token.split(".")
  if (!expiresStr || !sig) return false

  const expires = Number(expiresStr)
  if (!Number.isFinite(expires) || Date.now() > expires) return false

  const expected = createHmac("sha256", secret()).update(expiresStr).digest("hex")
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
