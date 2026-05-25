// src/lib/db.ts
// Turso (libSQL) client — lazy singleton, only connects when first used.
// Env vars:  TURSO_URL   (libsql://your-db.turso.io)
//            TURSO_TOKEN (your auth token)

import { createClient } from "@libsql/client"

declare global {
  // eslint-disable-next-line no-var
  var __tursoClient: ReturnType<typeof createClient> | undefined
}

export function getDB() {
  if (!process.env.TURSO_URL) {
    throw new Error("TURSO_URL env var is not set")
  }
  if (!global.__tursoClient) {
    global.__tursoClient = createClient({
      url:       process.env.TURSO_URL,
      authToken: process.env.TURSO_TOKEN,
    })
  }
  return global.__tursoClient
}

// Convenience alias — only call inside request handlers, never at module scope
export const db = { get: getDB }

/* ─── Schema bootstrap ────────────────────────────────────────────────────── */
export async function initDB() {
  const client = getDB()
  await client.execute(`
    CREATE TABLE IF NOT EXISTS bookings (
      id          TEXT    PRIMARY KEY,
      room        TEXT    NOT NULL,
      rate_label  TEXT    NOT NULL,
      rate_hours  INTEGER NOT NULL,
      rate_price  INTEGER NOT NULL,
      date        TEXT    NOT NULL,
      start_hour  INTEGER NOT NULL,
      client_name TEXT    NOT NULL,
      client_email TEXT   NOT NULL,
      client_notes TEXT   NOT NULL DEFAULT '',
      status      TEXT    NOT NULL DEFAULT 'pending',
      stripe_session_id TEXT,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `)
  return client
}
