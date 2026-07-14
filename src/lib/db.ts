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
      stripe_session_id TEXT UNIQUE,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `)
  // Existing DBs created before this constraint existed won't have it retroactively —
  // this catches those without erroring if it's already there.
  await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_session ON bookings(stripe_session_id)`)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS merch_orders (
      id                 TEXT    PRIMARY KEY,
      stripe_session_id  TEXT    NOT NULL UNIQUE,
      customer_name      TEXT    NOT NULL,
      customer_email     TEXT    NOT NULL,
      shipping_address   TEXT    NOT NULL,  -- JSON blob
      items              TEXT    NOT NULL,  -- JSON array: [{name, variantName, quantity, price}]
      total_paid         INTEGER NOT NULL,  -- cents
      discount_code      TEXT    NOT NULL DEFAULT '',
      status             TEXT    NOT NULL DEFAULT 'submitted',  -- 'submitted' | 'printify_failed'
      printify_order_id  TEXT,
      printify_error     TEXT,
      created_at         TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS pending_carts (
      id          TEXT    PRIMARY KEY,
      items       TEXT    NOT NULL,  -- full cart JSON, no size limit unlike Stripe metadata
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `)
  return client
}
