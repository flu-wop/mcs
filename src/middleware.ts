// src/middleware.ts
// Protects every /admin/* route with a real login page + signed session cookie.
// Replaces the old HTTP Basic Auth prompt.
//
// Set these in Vercel (Production + Preview):
//   ADMIN_USERNAME  (defaults to "admin" if unset)
//   ADMIN_PASSWORD  (required — also doubles as the session-signing secret;
//                    if unset, ALL admin routes 500 rather than silently
//                    allowing access with no password)

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifySessionToken, ADMIN_SESSION_COOKIE } from "@/lib/admin-session"

const PUBLIC_PATHS = ["/admin/login", "/api/admin/login"]

export function middleware(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD

  if (!password) {
    // Fail closed, not open — a missing password should never mean "no auth required"
    return new NextResponse("Admin auth is not configured (ADMIN_PASSWORD missing).", { status: 500 })
  }

  const { pathname } = req.nextUrl
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next()
  }

  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (verifySessionToken(token)) {
    return NextResponse.next()
  }

  // API routes get a plain 401 (they're fetched via JS, not navigated to)
  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }

  const loginUrl = new URL("/admin/login", req.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
