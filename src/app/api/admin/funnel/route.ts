// src/app/api/admin/funnel/route.ts
// Backs /admin/funnel. Protected by src/middleware.ts (mcs_admin_session
// cookie) — same as every other /api/admin/* route, no separate auth here.

import { NextResponse } from "next/server"
import { getDB, initDB } from "@/lib/db"

export const dynamic = "force-dynamic"

const STAGES = ["view_item", "add_to_cart", "begin_checkout", "purchase"] as const
const FUNNELS = ["booking", "merch"] as const

export async function GET() {
  await initDB()
  const db = getDB()

  const stageCounts: Record<(typeof FUNNELS)[number], Record<string, number>> = {
    booking: {}, merch: {},
  }

  for (const funnel of FUNNELS) {
    for (const stage of STAGES) {
      const result = await db.execute({
        sql: `SELECT COUNT(DISTINCT session_id) as cnt FROM funnel_events
              WHERE event_type = ? AND json_extract(data_json, '$.funnel') = ?
                AND created_at >= datetime('now', '-30 days')`,
        args: [stage, funnel],
      })
      stageCounts[funnel][stage] = Number(result.rows[0]?.cnt ?? 0)
    }
  }

  // Abandoned = began checkout, no matching purchase within 3 hours, and
  // that 3-hour window has already elapsed (so a session still mid-checkout
  // right now doesn't show up as "abandoned" prematurely).
  const abandoned: Record<(typeof FUNNELS)[number], unknown[]> = { booking: [], merch: [] }

  for (const funnel of FUNNELS) {
    const result = await db.execute({
      sql: `SELECT b.session_id, b.data_json, b.created_at FROM funnel_events b
            WHERE b.event_type = 'begin_checkout'
              AND json_extract(b.data_json, '$.funnel') = ?
              AND b.created_at >= datetime('now', '-30 days')
              AND datetime(b.created_at, '+3 hours') < datetime('now')
              AND NOT EXISTS (
                SELECT 1 FROM funnel_events p
                WHERE p.event_type = 'purchase'
                  AND json_extract(p.data_json, '$.funnel') = ?
                  AND p.created_at BETWEEN b.created_at AND datetime(b.created_at, '+3 hours')
              )
            ORDER BY b.created_at DESC LIMIT 100`,
      args: [funnel, funnel],
    })
    abandoned[funnel] = result.rows.map(r => ({
      session_id: r.session_id,
      data: JSON.parse((r.data_json as string) ?? "{}"),
      created_at: r.created_at,
    }))
  }

  return NextResponse.json({ stageCounts, abandoned, checkedAt: new Date().toISOString() })
}
