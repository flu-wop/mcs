// src/lib/site-events.ts
// First-party, cookieless browsing events for /admin/insights (page views,
// time on page, room/package picks). New table, so CREATE IF NOT EXISTS is
// enough; any later column needs its own ALTER TABLE migration.
import type { Client } from "@libsql/client"

let ready: Promise<void> | null = null

export function ensureSiteEvents(db: Client): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS site_events (
          id     INTEGER PRIMARY KEY AUTOINCREMENT,
          ts     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
          sid    TEXT NOT NULL,
          type   TEXT NOT NULL,
          path   TEXT,
          item   TEXT,
          value  REAL,
          ref    TEXT,
          device TEXT
        )
      `)
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_site_events_ts ON site_events (ts)`)
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_site_events_sid ON site_events (sid)`)
      await db.execute(`
        CREATE TABLE IF NOT EXISTS content_plans (
          week_start TEXT PRIMARY KEY,
          plan       TEXT NOT NULL,
          updated_at TEXT DEFAULT (datetime('now'))
        )
      `)
    })().catch(err => { ready = null; throw err })
  }
  return ready
}
