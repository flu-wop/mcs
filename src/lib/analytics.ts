// src/lib/analytics.ts
// Client-side funnel tracking — fires to GA4 + Meta Pixel + TikTok Pixel
// simultaneously (each a no-op if its env var isn't set), plus a fire-and-
// forget log to /api/track (Turso funnel_events table).
//
// MCS has two funnels sharing this one table, distinguished by `funnel` in
// the event payload: "booking" (studio + engineer pages, Stripe-hosted
// checkout) and "merch" (cart + Printify checkout). Stages: view_item →
// add_to_cart (merch only) → begin_checkout → purchase.
//
// `purchase` is logged to Turso from the Stripe webhook (source of truth —
// see /api/webhooks/stripe), NOT from the client. Client-side purchase calls
// on the success pages pass { logToDb: false } and exist only to fire the
// ad-platform pixels, which need a browser context.

export type FunnelEventName = "view_item" | "add_to_cart" | "begin_checkout" | "purchase"
export type FunnelName = "booking" | "merch"
export type FunnelEventData = Record<string, string | number | boolean | undefined> & {
  funnel: FunnelName
}

export function getSessionId(): string {
  if (typeof window === "undefined") return ""
  const key = "mcs_session_id"
  let id = sessionStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(key, id)
  }
  return id
}

function fireGA4(event: FunnelEventName, data: FunnelEventData) {
  if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return
  if (typeof window === "undefined" || typeof (window as any).gtag !== "function") return
  ;(window as any).gtag("event", event, data)
}

function fireMeta(event: FunnelEventName, data: FunnelEventData) {
  if (!process.env.NEXT_PUBLIC_META_PIXEL_ID) return
  if (typeof window === "undefined" || typeof (window as any).fbq !== "function") return
  const map: Record<FunnelEventName, string> = {
    view_item: "ViewContent",
    add_to_cart: "AddToCart",
    begin_checkout: "InitiateCheckout",
    purchase: "Purchase",
  }
  ;(window as any).fbq("track", map[event], data)
}

function fireTikTok(event: FunnelEventName, data: FunnelEventData) {
  if (!process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID) return
  if (typeof window === "undefined" || typeof (window as any).ttq !== "object") return
  const map: Record<FunnelEventName, string> = {
    view_item: "ViewContent",
    add_to_cart: "AddToCart",
    begin_checkout: "InitiateCheckout",
    purchase: "CompletePayment",
  }
  ;(window as any).ttq.track(map[event], data)
}

function logToTurso(event: FunnelEventName, data: FunnelEventData) {
  const payload = { session_id: getSessionId(), event_type: event, data }
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // fire-and-forget — never let analytics block the UI
  }
}

export function track(
  event: FunnelEventName,
  data: FunnelEventData,
  options: { logToDb?: boolean } = {}
) {
  fireGA4(event, data)
  fireMeta(event, data)
  fireTikTok(event, data)
  if (options.logToDb !== false) logToTurso(event, data)
}
