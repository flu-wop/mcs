// src/app/api/admin/content-plan/route.ts
// Weekly content plan for /admin/insights?tab=content, one row per week keyed
// by its Monday. Auth: src/middleware.ts guards every /api/admin/* route.
import { NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { ensureSiteEvents } from "@/lib/site-events"
import { PILLARS, CLIP_CHECKLIST } from "@/components/admin/insights/content"

export const dynamic = "force-dynamic"

type Day = { pillar: number; note: string; checks: boolean[] }
const CHECKS = CLIP_CHECKLIST.length

const emptyPlan = () => ({ days: Array.from({ length: 7 }, () => ({ pillar: 0, note: "", checks: Array(CHECKS).fill(false) })) })

function sanitize(input: unknown): { days: Day[] } | null {
  const days = (input as { days?: unknown })?.days
  if (!Array.isArray(days) || days.length !== 7) return null
  return {
    days: days.map(d => {
      const day = d as Partial<Day>
      const p = Number(day.pillar)
      return {
        pillar: Number.isInteger(p) && p >= 0 && p < PILLARS.length ? p : 0,
        note: typeof day.note === "string" ? day.note.slice(0, 200) : "",
        checks: Array.from({ length: CHECKS }, (_, i) => Boolean(Array.isArray(day.checks) && day.checks[i])),
      }
    }),
  }
}
const validWeek = (w: unknown): w is string => typeof w === "string" && /^\d{4}-\d{2}-\d{2}$/.test(w)

export async function GET(req: Request) {
  const week = new URL(req.url).searchParams.get("week")
  if (!validWeek(week)) return NextResponse.json({ error: "Bad week" }, { status: 400 })
  try {
    const db = getDB(); await ensureSiteEvents(db)
    const r = await db.execute({ sql: "SELECT plan FROM content_plans WHERE week_start = ?", args: [week] })
    const plan = r.rows[0] ? sanitize(JSON.parse(String(r.rows[0].plan))) : null
    return NextResponse.json({ week, plan: plan ?? emptyPlan(), saved: !!plan })
  } catch (err) {
    console.error("[content-plan] GET:", err)
    return NextResponse.json({ error: "Could not load plan" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const plan = sanitize(body.plan)
    if (!validWeek(body.week) || !plan) return NextResponse.json({ error: "Bad plan" }, { status: 400 })
    const db = getDB(); await ensureSiteEvents(db)
    await db.execute({
      sql: `INSERT INTO content_plans (week_start, plan, updated_at) VALUES (?, ?, datetime('now'))
            ON CONFLICT(week_start) DO UPDATE SET plan = excluded.plan, updated_at = excluded.updated_at`,
      args: [body.week, JSON.stringify(plan)],
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[content-plan] PUT:", err)
    return NextResponse.json({ error: "Could not save plan" }, { status: 500 })
  }
}
