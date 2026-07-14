// src/lib/rate-limit.ts
// Turso-backed rate limiter — in-memory limiters die on serverless since
// each invocation is a fresh instance, so this uses the site's existing DB.

import { getDB } from "./db"

// Fixed window. key = `${route}:${ip}`. Returns true if allowed.
export async function rateLimit(key: string, limit: number, windowSecs: number): Promise<boolean> {
  const db = getDB()
  const windowStart = Math.floor(Date.now() / 1000 / windowSecs) * windowSecs
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS rate_limits (k TEXT, w INTEGER, c INTEGER, PRIMARY KEY (k, w))`,
    args: [],
  })
  const r = await db.execute({
    sql: `INSERT INTO rate_limits (k, w, c) VALUES (?, ?, 1)
          ON CONFLICT(k, w) DO UPDATE SET c = c + 1 RETURNING c`,
    args: [key, windowStart],
  })
  return Number(r.rows[0].c) <= limit
}

export function clientIp(req: Request): string {
  return (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim()
}
