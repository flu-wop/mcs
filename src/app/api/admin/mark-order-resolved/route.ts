// src/app/api/admin/mark-order-resolved/route.ts
// For orders someone fixed by hand directly in Printify's dashboard (rather
// than through the Retry button) - clears the failure state so it stops
// showing as broken on /admin/orders.
// Protected by src/middleware.ts (admin session cookie).

import { NextResponse } from "next/server"
import { getDB, initDB } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { orderId, printifyOrderId } = await req.json()
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 })
    }

    await initDB()
    await getDB().execute({
      sql: `UPDATE merch_orders
            SET printify_error = NULL, status = 'submitted', printify_order_id = ?
            WHERE id = ?`,
      args: [printifyOrderId?.trim() || "manually placed in Printify", orderId],
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
