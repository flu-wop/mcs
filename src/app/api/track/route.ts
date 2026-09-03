// src/app/api/track/route.ts
// Ingests client-side funnel events (see src/lib/analytics.ts) into the
// funnel_events table. Rate-limited, event-type allowlisted, payload
// size-capped — same posture as every other public POST route on this site.

import { NextResponse } from "next/server"
import { getDB, initDB } from "@/lib/db"
import { rateLimit, clientIp } from "@/lib/rate-limit"

const ALLOWED_EVENTS = new Set(["view_item", "add_to_cart", "begin_checkout", "purchase"])
const MAX_PAYLOAD_BYTES = 4096

export async function POST(req: Request) {
  const ok = await rateLimit(`track:${clientIp(req)}`, 60, 60)
  if (!ok) return NextResponse.json({ ok: false }, { status: 429 })

  const raw = await req.text()
  if (raw.length > MAX_PAYLOAD_BYTES) return NextResponse.json({ ok: false }, { status: 413 })

  let body: { session_id?: string; event_type?: string; data?: unknown }
  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const { session_id, event_type, data } = body
  if (
    typeof session_id !== "string" || !session_id || session_id.length > 128 ||
    typeof event_type !== "string" || !ALLOWED_EVENTS.has(event_type)
  ) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  try {
    await initDB()
    await getDB().execute({
      sql: `INSERT INTO funnel_events (session_id, event_type, data_json) VALUES (?, ?, ?)`,
      args: [session_id, event_type, JSON.stringify(data ?? {})],
    })
  } catch (err) {
    // Never fail the client over an analytics write.
    console.error("[/api/track]", err)
  }

  return NextResponse.json({ ok: true })
}
