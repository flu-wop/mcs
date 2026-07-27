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
      email_error        TEXT,
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
  // Migration: email_error column was added after merch_orders already existed
  // in production — CREATE TABLE IF NOT EXISTS won't retroactively add it.
  try {
    await client.execute(`ALTER TABLE merch_orders ADD COLUMN email_error TEXT`)
  } catch {
    // Column already exists — fine, this just means the migration already ran.
  }

  // Migration: engineer payout tracking, added after bookings already existed in production.
  // engineer_slug: which engineer worked the session — set automatically for engineer-page
  //   bookings, null for generic /studio bookings until an admin assigns one.
  // payout_rate_cents: $40/hr (4000) for engineer-page bookings, $30/hr (3000) once an
  //   admin assigns an engineer to a generic booking.
  // payout_amount_cents: rate_hours * payout_rate_cents, computed once at insert/assignment time.
  // payout_status: 'unpaid' | 'paid' — flipped weekly from /admin/payouts.
  for (const stmt of [
    `ALTER TABLE bookings ADD COLUMN engineer_slug TEXT`,
    `ALTER TABLE bookings ADD COLUMN payout_rate_cents INTEGER`,
    `ALTER TABLE bookings ADD COLUMN payout_amount_cents INTEGER`,
    `ALTER TABLE bookings ADD COLUMN payout_status TEXT NOT NULL DEFAULT 'unpaid'`,
    // Links a failed order back to its preserved pending_carts row (real
    // Printify product/variant IDs) so a retry mechanism can find it.
    `ALTER TABLE merch_orders ADD COLUMN cart_id TEXT`,
  ]) {
    try { await client.execute(stmt) } catch { /* column already exists */ }
  }

  return client
}
