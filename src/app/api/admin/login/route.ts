// src/app/api/admin/login/route.ts
// Admin login: rate-limited per IP, constant-time credential check, sets the
// signed httpOnly session cookie that src/middleware.ts verifies.
import { NextResponse } from "next/server"
import { signSessionToken, safeEq, ADMIN_SESSION_COOKIE } from "@/lib/admin-session"
import { rateLimit, clientIp } from "@/lib/rate-limit"

export async function POST(req: Request) {
  const password = process.env.ADMIN_PASSWORD
  const username = process.env.ADMIN_USERNAME ?? "admin"
  if (!password) return NextResponse.json({ error: "Admin auth is not configured." }, { status: 500 })

  if (!(await rateLimit(`admin-login:${clientIp(req)}`, 8, 900))) {
    return NextResponse.json({ error: "Too many attempts. Wait 15 minutes and try again." }, { status: 429 })
  }

  let body: { username?: unknown; password?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ error: "Bad request." }, { status: 400 }) }
  const userOk = safeEq(String(body.username ?? ""), username)
  const passOk = safeEq(String(body.password ?? ""), password)
  if (!userOk || !passOk) return NextResponse.json({ error: "That username and password don't match." }, { status: 401 })

  const token = await signSessionToken()
  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/",
  })
  return response
}
