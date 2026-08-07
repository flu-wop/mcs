// src/app/api/admin/health/route.ts
// Backs /admin/system. Protected by src/middleware.ts (mcs_admin_session
// cookie) — same as every other /api/admin/* route, no separate auth scheme
// invented here.

import { NextResponse } from "next/server"
import {
  checkEnvVars, checkStripe, checkStreetbeatStripe, checkLastWebhookActivity,
  checkResend, checkTurso, checkPrintify, checkApiUsage,
} from "@/lib/health-checks"

export const dynamic = "force-dynamic"

export async function GET() {
  const [envVars, stripe, streetbeatStripe, lastWebhook, resend, turso, printify, apiUsage] = await Promise.all([
    Promise.resolve(checkEnvVars()),
    checkStripe(),
    checkStreetbeatStripe(),
    checkLastWebhookActivity(),
    checkResend(),
    checkTurso(),
    checkPrintify(),
    checkApiUsage(),
  ])

  return NextResponse.json({
    envVars,
    webhookHealth: { stripe, streetbeatStripe, lastWebhook, resend, turso, printify },
    apiUsage,
    checkedAt: new Date().toISOString(),
  })
}
