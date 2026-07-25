// src/app/api/admin/login/route.ts
import { NextResponse } from "next/server"
import { signSessionToken, ADMIN_SESSION_COOKIE } from "@/lib/admin-session"

export async function POST(req: Request) {
  const password = process.env.ADMIN_PASSWORD
  const username = process.env.ADMIN_USERNAME ?? "admin"

  if (!password) {
    return NextResponse.json({ error: "Admin auth is not configured." }, { status: 500 })
  }

  const { username: inputUser, password: inputPass } = await req.json()

  if (inputUser !== username || inputPass !== password) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 })
  }

  const token = signSessionToken()
  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
  return response
}
