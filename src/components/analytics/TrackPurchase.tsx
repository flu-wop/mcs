"use client"
// src/components/analytics/TrackPurchase.tsx
// Drop into any success page to fire the GA4/Meta/TikTok purchase pixels.
// Renders nothing. Turso already has the authoritative purchase row from the
// Stripe webhook (see /api/webhooks/stripe), so this only fires pixels
// (logToDb: false) and dedupes per Stripe session id via sessionStorage —
// a refresh of the success page must never double-fire a conversion pixel.

import { useEffect } from "react"
import { track, type FunnelName } from "@/lib/analytics"

export function TrackPurchase({
  funnel,
  stripeSessionId,
  value,
}: {
  funnel: FunnelName
  stripeSessionId: string | null | undefined
  value?: number
}) {
  useEffect(() => {
    if (!stripeSessionId) return
    const flag = `mcs_purchase_fired_${stripeSessionId}`
    if (sessionStorage.getItem(flag)) return
    sessionStorage.setItem(flag, "1")
    track("purchase", { funnel, value }, { logToDb: false })
  }, [funnel, stripeSessionId, value])

  return null
}
