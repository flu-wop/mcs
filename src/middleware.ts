// src/middleware.ts
// Protects every /admin/* route with HTTP Basic Auth.
// Browser handles the login prompt natively — no session/cookie/login page needed.
//
// Set these in Vercel (Production + Preview):
//   ADMIN_USERNAME  (defaults to "admin" if unset)
//   ADMIN_PASSWORD  (required — if unset, ALL admin routes 500 rather than
//                    silently allowing access with no password)

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD
  const username = process.env.ADMIN_USERNAME ?? "admin"

  if (!password) {
    // Fail closed, not open — a missing password should never mean "no auth required"
    return new NextResponse("Admin auth is not configured (ADMIN_PASSWORD missing).", { status: 500 })
  }

  const authHeader = req.headers.get("authorization")

  if (authHeader?.startsWith("Basic ")) {
    const decoded = atob(authHeader.slice(6))
    const separatorIndex = decoded.indexOf(":")
    const user = decoded.slice(0, separatorIndex)
    const pass = decoded.slice(separatorIndex + 1)

    if (user === username && pass === password) {
      return NextResponse.next()
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Mid City Sound Admin"' },
  })
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
