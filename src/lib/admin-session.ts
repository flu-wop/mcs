// src/lib/admin-session.ts
// Signed admin session cookie — replaces HTTP Basic Auth with a real login page.
// The cookie value is `${expiryTimestamp}.${hmacSignature}` — signed with a
// server-only secret, so it can't be forged by setting an arbitrary cookie
// value in devtools.
//
// Uses the Web Crypto API (crypto.subtle), NOT Node's `crypto` module —
// this file is imported from middleware.ts, which always runs on Vercel's
// Edge Runtime and does not support Node's crypto.createHmac/timingSafeEqual
// at all. Web Crypto works in both Edge and Node runtimes, so this is safe
// to use everywhere.

export const ADMIN_SESSION_COOKIE = "mcs_admin_session"
const SESSION_LENGTH_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

function secret(): string {
  // Reuses ADMIN_PASSWORD as the signing secret — one less env var to manage,
  // and it's already a private server-only value.
  const s = process.env.ADMIN_PASSWORD
  if (!s) throw new Error("ADMIN_PASSWORD is not set")
  return s
}

async function getKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  )
}

function bufferToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("")
}

function hexToBuffer(hex: string): ArrayBuffer {
  const buf = new ArrayBuffer(hex.length / 2)
  const bytes = new Uint8Array(buf)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return buf
}

export async function signSessionToken(): Promise<string> {
  const expires = Date.now() + SESSION_LENGTH_MS
  const key = await getKey()
  const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(String(expires)))
  return `${expires}.${bufferToHex(sigBuffer)}`
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false
  const [expiresStr, sigHex] = token.split(".")
  if (!expiresStr || !sigHex) return false

  const expires = Number(expiresStr)
  if (!Number.isFinite(expires) || Date.now() > expires) return false

  try {
    const key = await getKey()
    const sigBytes = hexToBuffer(sigHex)
    return await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      new TextEncoder().encode(expiresStr)
    )
  } catch {
    return false
  }
}
