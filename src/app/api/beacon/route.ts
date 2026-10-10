// src/app/api/beacon/route.ts
// Cookieless browsing events for /admin/insights, sent with sendBeacon from
// lib/beacon.ts. Stores no IP, name or email: only an anonymous per-tab id.
// (Funnel events for the ad pixels still go to /api/track.)
import { NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { ensureSiteEvents } from "@/lib/site-events"
import { rateLimit, clientIp } from "@/lib/rate-limit"

const TYPES = new Set(["page_view", "page_time", "room_select", "package_select"])
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|embedly|monitor/i

function clean(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null
  const s = v.replace(/[\u0000-\u001f]/g, "").trim()
  return s ? s.slice(0, max) : null
}

export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") ?? ""
  if (!ua || BOT.test(ua)) return new NextResponse(null, { status: 204 })

  const raw = await req.text()
  if (raw.length > 2048) return new NextResponse(null, { status: 413 })
  let body: Record<string, unknown>
  try { body = JSON.parse(raw) } catch { return new NextResponse(null, { status: 400 }) }

  const type = clean(body.type, 32)
  const sid = clean(body.sid, 40)
  const path = clean(body.path, 200)
  if (!type || !TYPES.has(type) || !sid || !/^[a-z0-9-]+$/i.test(sid)) return new NextResponse(null, { status: 400 })
  if (path && (path.startsWith("/admin") || path.startsWith("/api"))) return new NextResponse(null, { status: 204 })

  const n = Number(body.value)
  const value = Number.isFinite(n) ? Math.max(0, Math.min(n, 100000)) : null
  const device = /Mobi|Android|iPhone/i.test(ua) ? "mobile" : /iPad|Tablet/i.test(ua) ? "tablet" : "desktop"

  try {
    if (!(await rateLimit(`beacon:${clientIp(req)}`, 240, 60))) return new NextResponse(null, { status: 204 })
    const db = getDB()
    await ensureSiteEvents(db)
    await db.execute({
      sql: "INSERT INTO site_events (ts, sid, type, path, item, value, ref, device) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: [new Date().toISOString(), sid, type, path, clean(body.item, 200), value, clean(body.ref, 120), device],
    })
  } catch (err) {
    console.error("[beacon] insert failed:", err)
  }
  return new NextResponse(null, { status: 204 })
}
