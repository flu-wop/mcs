// src/lib/insights.ts
// Server-only aggregation behind /admin (home snapshot) and /admin/insights.
// Sales come from the real bookings + merch_orders tables; browsing comes
// from site_events (/api/beacon); funnel stages from funnel_events (/api/track).
// Days are bucketed in New Orleans time. Street Beat is not in here: it lives
// in its own Stripe account and has its own page.
import "server-only"

import { getDB, initDB } from "@/lib/db"
import { ensureSiteEvents } from "@/lib/site-events"
import { ROOMS, type RoomId } from "@/lib/rooms"
import { ENGINEERS, engineerName } from "@/lib/engineers"
import { RECORDING_RATES, MIXING_RATES } from "@/lib/studio-rates"
import { addDays, localDay, localHour, todayLocal, toDate, weekdayMon0 } from "@/lib/admin-time"

/** Hours a room is bookable, for utilization: 9am–9pm, Monday–Saturday. */
export const OPEN_HOURS = { from: 9, to: 21, closedWeekdays: [6] as number[] }
export const OPEN_HOURS_LABEL = "9am–9pm, Mon–Sat"

export type MerchBrand = "mcs" | "djm" | "streetbeat" | "squiggle"
export const BRAND_LABEL: Record<MerchBrand, string> = {
  mcs: "Mid City Sound", djm: "Donald Markowitz", streetbeat: "Street Beat", squiggle: "Lil Squiggle",
}

export interface RoomStats {
  id: RoomId
  name: string
  role: string
  bookings: number
  hours: number
  revenue: number
  utilization: number            // 0–1 of open hours in range
  avgSession: number             // hours
  interest: number               // times picked in a booking flow
  topEngineer: { name: string; sessions: number } | null
  busiestWeekday: string | null
  heat: number[][]               // [weekday Mon..Sat][hour 9..20] booked hours
  live: { client: string; until: number } | null
  next: { date: string; start: number; hours: number; client: string } | null
}

export interface Insights {
  range: { days: number; start: string; end: string }
  trackingSince: string | null
  kpis: {
    revenue: number; revenuePrev: number
    studioRevenue: number; merchRevenue: number
    bookings: number; bookingsPrev: number
    orders: number; ordersPrev: number
    hours: number; hoursPrev: number
    visitors: number; visitorsPrev: number
  }
  daily: { date: string; studio: number; merch: number; visitors: number }[]
  rooms: RoomStats[]
  engineers: { slug: string | null; name: string; sessions: number; hours: number; revenue: number }[]
  packages: { label: string; sessions: number; revenue: number; picks: number }[]
  brands: { brand: MerchBrand; label: string; units: number; revenue: number }[]
  products: { name: string; brand: MerchBrand; units: number; revenue: number }[]
  funnels: {
    booking: { label: string; value: number }[]
    merch: { label: string; value: number }[]
  }
  abandoned: { kind: "booking" | "merch"; when: string; detail: string }[]
  pages: { path: string; views: number; avgTime: number }[]
  referrers: { host: string; visits: number }[]
  devices: Record<string, number>
  upcoming: { id: string; date: string; start: number; hours: number; room: string; client: string; label: string; engineer: string | null; price: number }[]
  attention: { unpaidHolds: number; failedOrders: number; unassigned: number; owed: number }
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

function guessBrand(name: string, tagged?: unknown): MerchBrand {
  if (tagged === "mcs" || tagged === "djm" || tagged === "streetbeat" || tagged === "squiggle") return tagged
  const n = name.toLowerCase()
  if (n.includes("squiggle") || n.includes("drink and dial")) return "squiggle"
  if (n.includes("street beat") || n.includes("streetbeat") || n.includes("drum")) return "streetbeat"
  if (n.includes("time of my life") || n.includes("markowitz") || n.includes("billboard") || n.includes("1987") || n.includes("djm")) return "djm"
  return "mcs"
}

/** Engineer-page bookings store "Package · Engineer" in rate_label. */
const packageOf = (label: string) => label.split(" · ")[0].trim()

export async function getInsights(days = 30): Promise<Insights> {
  days = Math.max(7, Math.min(365, Math.round(days) || 30))
  const db = await initDB()
  await ensureSiteEvents(db)

  const today = todayLocal()
  const start = addDays(today, -(days - 1))
  const prevStart = addDays(start, -days)
  const floor = addDays(prevStart, -1)
  const inCur = (d: string) => d >= start && d <= today
  const inPrev = (d: string) => d >= prevStart && d < start

  const [bookingsRes, ordersRes, eventsRes, prevVisRes, firstEvRes, funnelRes, upcomingRes, attentionRes] = await Promise.all([
    db.execute({
      sql: `SELECT id, room, rate_label, rate_hours, rate_price, date, start_hour, client_name, status,
                   engineer_slug, created_at
            FROM bookings WHERE (created_at >= ? OR date >= ?)`,
      args: [floor, prevStart],
    }),
    db.execute({ sql: `SELECT items, total_paid, created_at FROM merch_orders WHERE created_at >= ?`, args: [floor] }),
    db.execute({ sql: `SELECT ts, sid, type, path, item, value, ref, device FROM site_events WHERE ts >= ? ORDER BY ts`, args: [addDays(start, -1)] }),
    db.execute({ sql: `SELECT ts, sid FROM site_events WHERE type = 'page_view' AND ts >= ? AND ts < ?`, args: [addDays(prevStart, -1), addDays(start, 1)] }),
    db.execute(`SELECT MIN(ts) AS first FROM site_events`),
    db.execute({ sql: `SELECT session_id, event_type, data_json, created_at FROM funnel_events WHERE created_at >= ?`, args: [addDays(start, -1)] }),
    db.execute({
      sql: `SELECT id, room, rate_label, rate_hours, rate_price, date, start_hour, client_name, engineer_slug
            FROM bookings WHERE status = 'confirmed' AND date >= ? ORDER BY date, start_hour LIMIT 12`,
      args: [today],
    }),
    db.execute(`SELECT
        (SELECT COUNT(*) FROM bookings WHERE status = 'pending' AND created_at <= datetime('now','-30 minutes') AND date >= date('now','-1 day')) AS unpaid,
        (SELECT COUNT(*) FROM merch_orders WHERE status = 'printify_failed' OR email_error IS NOT NULL) AS failed,
        (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed' AND engineer_slug IS NULL) AS unassigned,
        (SELECT COALESCE(SUM(payout_amount_cents),0) FROM bookings WHERE status = 'confirmed' AND payout_status = 'unpaid' AND engineer_slug IS NOT NULL) AS owed`),
  ])

  // ── Days ────────────────────────────────────────────────────────────
  const daily = new Map<string, { date: string; studio: number; merch: number; visitors: Set<string> }>()
  for (let d = start; d <= today; d = addDays(d, 1)) daily.set(d, { date: d, studio: 0, merch: 0, visitors: new Set() })

  let openHours = 0
  for (let d = start; d <= today; d = addDays(d, 1)) {
    if (!OPEN_HOURS.closedWeekdays.includes(weekdayMon0(d))) openHours += OPEN_HOURS.to - OPEN_HOURS.from
  }

  // ── Bookings ────────────────────────────────────────────────────────
  const blankHeat = () => Array.from({ length: 6 }, () => Array(OPEN_HOURS.to - OPEN_HOURS.from).fill(0) as number[])
  const room = new Map<RoomId, {
    bookings: number; hours: number; revenue: number; interest: number
    eng: Map<string, number>; weekday: number[]; heat: number[][]
  }>()
  for (const r of ROOMS) room.set(r.id, { bookings: 0, hours: 0, revenue: 0, interest: 0, eng: new Map(), weekday: Array(7).fill(0), heat: blankHeat() })
  const eng = new Map<string, { sessions: number; hours: number; revenue: number }>()
  const pkg = new Map<string, { sessions: number; revenue: number; picks: number }>()

  let revCur = 0, revPrev = 0, bookCur = 0, bookPrev = 0, hoursCur = 0, hoursPrev = 0, studioRev = 0
  const nowDay = today, nowHour = localHour(new Date())
  const live = new Map<RoomId, { client: string; until: number }>()

  for (const b of bookingsRes.rows) {
    if (String(b.status) !== "confirmed") continue
    const price = Number(b.rate_price) / 100 || 0
    const hours = Number(b.rate_hours) || 0
    const id = String(b.room) as RoomId
    const created = toDate(b.created_at)
    const saleDay = created ? localDay(created) : null

    // Sales: counted on the day they were paid for.
    if (saleDay && inCur(saleDay)) {
      revCur += price; studioRev += price; bookCur++
      daily.get(saleDay)!.studio += price
      const p = pkg.get(packageOf(String(b.rate_label))) ?? { sessions: 0, revenue: 0, picks: 0 }
      p.sessions++; p.revenue += price; pkg.set(packageOf(String(b.rate_label)), p)
    } else if (saleDay && inPrev(saleDay)) { revPrev += price; bookPrev++ }

    // Room use: counted on the session date.
    const sDay = String(b.date)
    if (sDay === nowDay && nowHour >= Number(b.start_hour) && nowHour < Number(b.start_hour) + hours) {
      live.set(id, { client: String(b.client_name), until: Number(b.start_hour) + hours })
    }
    if (inPrev(sDay)) hoursPrev += hours
    if (!inCur(sDay)) continue
    hoursCur += hours
    const rs = room.get(id)
    if (rs) {
      rs.bookings++; rs.hours += hours; rs.revenue += price
      const wd = weekdayMon0(sDay)
      rs.weekday[wd] += hours
      if (wd < 6) {
        for (let h = Number(b.start_hour); h < Number(b.start_hour) + hours; h++) {
          const col = h - OPEN_HOURS.from
          if (col >= 0 && col < rs.heat[wd].length) rs.heat[wd][col]++
        }
      }
      const slug = b.engineer_slug ? String(b.engineer_slug) : ""
      if (slug) rs.eng.set(slug, (rs.eng.get(slug) ?? 0) + 1)
    }
    const key = b.engineer_slug ? String(b.engineer_slug) : "__none"
    const e = eng.get(key) ?? { sessions: 0, hours: 0, revenue: 0 }
    e.sessions++; e.hours += hours; e.revenue += price; eng.set(key, e)
  }

  // ── Merch ───────────────────────────────────────────────────────────
  let ordersCur = 0, ordersPrev = 0, merchRev = 0
  const brands = new Map<MerchBrand, { units: number; revenue: number }>()
  const products = new Map<string, { brand: MerchBrand; units: number; revenue: number }>()
  for (const o of ordersRes.rows) {
    const dt = toDate(o.created_at); if (!dt) continue
    const day = localDay(dt)
    const total = Number(o.total_paid) / 100 || 0
    if (inPrev(day)) { revPrev += total; ordersPrev++; continue }
    if (!inCur(day)) continue
    revCur += total; merchRev += total; ordersCur++
    daily.get(day)!.merch += total
    let items: { name?: string; quantity?: number; price?: number; brand?: string }[] = []
    try { items = JSON.parse(String(o.items)) } catch { /* skip */ }
    for (const it of items) {
      const name = String(it.name ?? "Item")
      const units = Number(it.quantity) || 1
      const rev = (Number(it.price) || 0) * units
      const brand = guessBrand(name, it.brand)
      const bs = brands.get(brand) ?? { units: 0, revenue: 0 }; bs.units += units; bs.revenue += rev; brands.set(brand, bs)
      const ps = products.get(name) ?? { brand, units: 0, revenue: 0 }; ps.units += units; ps.revenue += rev; products.set(name, ps)
    }
  }

  // ── Site events ─────────────────────────────────────────────────────
  const sessions = new Map<string, { studio: boolean; book: boolean; merch: boolean; roomPick: boolean }>()
  const pages = new Map<string, { views: number; time: Map<string, number> }>()
  const refs = new Map<string, number>()
  const devices: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 }
  for (const e of eventsRes.rows) {
    const dt = toDate(e.ts); if (!dt) continue
    const day = localDay(dt); if (!inCur(day)) continue
    const sid = String(e.sid), type = String(e.type), path = String(e.path ?? "")
    let s = sessions.get(sid)
    if (!s) {
      s = { studio: false, book: false, merch: false, roomPick: false }; sessions.set(sid, s)
      const dev = String(e.device ?? "desktop"); devices[dev] = (devices[dev] ?? 0) + 1
    }
    if (type === "page_view") {
      daily.get(day)?.visitors.add(sid)
      const pg = pages.get(path) ?? { views: 0, time: new Map() }; pg.views++; pages.set(path, pg)
      if (path === "/studio") s.studio = true
      if (path.startsWith("/book/")) s.book = true
      if (path.startsWith("/merch")) s.merch = true
      if (e.ref) refs.set(String(e.ref), (refs.get(String(e.ref)) ?? 0) + 1)
    } else if (type === "page_time") {
      const pg = pages.get(path) ?? { views: 0, time: new Map() }
      pg.time.set(sid, (pg.time.get(sid) ?? 0) + (Number(e.value) || 0)); pages.set(path, pg)
    } else if (type === "room_select") {
      s.roomPick = true
      const rs = room.get(String(e.item) as RoomId); if (rs) rs.interest++
    } else if (type === "package_select") {
      const label = [...STUDIO_PACKAGE_LABELS.entries()].find(([id]) => id === String(e.item))?.[1]
      if (label) { const p = pkg.get(label) ?? { sessions: 0, revenue: 0, picks: 0 }; p.picks++; pkg.set(label, p) }
    }
  }
  const prevVisitors = new Set<string>()
  for (const r of prevVisRes.rows) { const dt = toDate(r.ts); if (dt && inPrev(localDay(dt))) prevVisitors.add(String(r.sid)) }

  // ── Funnel events (distinct sessions per stage) ─────────────────────
  const stage = { booking: new Map<string, Set<string>>(), merch: new Map<string, Set<string>>() }
  const begins: { kind: "booking" | "merch"; sid: string; at: Date; data: Record<string, unknown> }[] = []
  const purchases: { kind: string; sid: string; at: Date }[] = []
  for (const f of funnelRes.rows) {
    const dt = toDate(f.created_at); if (!dt || !inCur(localDay(dt))) continue
    let data: Record<string, unknown> = {}
    try { data = JSON.parse(String(f.data_json ?? "{}")) } catch { /* skip */ }
    const kind = data.funnel === "merch" ? "merch" : data.funnel === "booking" ? "booking" : null
    if (!kind) continue
    const type = String(f.event_type)
    const set = stage[kind].get(type) ?? new Set<string>(); set.add(String(f.session_id)); stage[kind].set(type, set)
    if (type === "begin_checkout") begins.push({ kind, sid: String(f.session_id), at: dt, data })
    if (type === "purchase") purchases.push({ kind, sid: String(f.session_id), at: dt })
  }
  const n = (k: "booking" | "merch", t: string) => stage[k].get(t)?.size ?? 0
  const abandoned = begins
    .filter(b => Date.now() - b.at.getTime() > 3 * 3600_000 &&
      // Same browser session paid (webhook logs purchase under the checkout's session id).
      !purchases.some(p => p.kind === b.kind && p.sid === b.sid && p.at >= b.at))
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 25)
    .map(b => ({
      kind: b.kind, when: b.at.toISOString(),
      detail: b.kind === "booking"
        ? [b.data.service, b.data.rate_cents ? `$${Math.round(Number(b.data.rate_cents) / 100)}` : null, b.data.engineer_slug ? `with ${engineerName(String(b.data.engineer_slug))}` : null].filter(Boolean).join(" · ")
        : [b.data.item_count ? `${b.data.item_count} items` : null, b.data.value ? `$${Number(b.data.value).toFixed(2)}` : null].filter(Boolean).join(" · ") || "Merch checkout",
    }))

  // ── Assemble ────────────────────────────────────────────────────────
  const avg = (m: Map<string, number>) => (m.size ? [...m.values()].reduce((a, b) => a + b, 0) / m.size : 0)
  const att = attentionRes.rows[0] ?? {}
  const roomUpcoming = new Map<RoomId, Insights["rooms"][number]["next"]>()
  for (const u of upcomingRes.rows) {
    const id = String(u.room) as RoomId
    const endsPast = String(u.date) === today && Number(u.start_hour) + Number(u.rate_hours) <= nowHour
    if (!roomUpcoming.has(id) && !endsPast) {
      roomUpcoming.set(id, { date: String(u.date), start: Number(u.start_hour), hours: Number(u.rate_hours), client: String(u.client_name) })
    }
  }

  return {
    range: { days, start, end: today },
    trackingSince: firstEvRes.rows[0]?.first ? String(firstEvRes.rows[0].first) : null,
    kpis: {
      revenue: revCur, revenuePrev: revPrev, studioRevenue: studioRev, merchRevenue: merchRev,
      bookings: bookCur, bookingsPrev: bookPrev, orders: ordersCur, ordersPrev,
      hours: hoursCur, hoursPrev, visitors: sessions.size, visitorsPrev: prevVisitors.size,
    },
    daily: [...daily.values()].map(d => ({ date: d.date, studio: round2(d.studio), merch: round2(d.merch), visitors: d.visitors.size })),
    rooms: ROOMS.map(r => {
      const s = room.get(r.id)!
      const top = [...s.eng.entries()].sort((a, b) => b[1] - a[1])[0]
      const busiest = s.weekday.some(v => v > 0) ? WEEKDAYS[s.weekday.indexOf(Math.max(...s.weekday))] : null
      return {
        id: r.id, name: r.name, role: r.role,
        bookings: s.bookings, hours: s.hours, revenue: round2(s.revenue),
        utilization: openHours ? Math.min(1, s.hours / openHours) : 0,
        avgSession: s.bookings ? s.hours / s.bookings : 0,
        interest: s.interest,
        topEngineer: top ? { name: engineerName(top[0]), sessions: top[1] } : null,
        busiestWeekday: busiest,
        heat: s.heat,
        live: live.get(r.id) ?? null,
        next: roomUpcoming.get(r.id) ?? null,
      }
    }),
    engineers: [
      ...ENGINEERS.map(e => ({ slug: e.slug, name: e.name, ...(eng.get(e.slug) ?? { sessions: 0, hours: 0, revenue: 0 }) })),
      ...(eng.has("__none") ? [{ slug: null, name: "Unassigned", ...eng.get("__none")! }] : []),
    ].map(e => ({ ...e, revenue: round2(e.revenue) })).sort((a, b) => b.hours - a.hours),
    packages: [...pkg.entries()].map(([label, p]) => ({ label, ...p, revenue: round2(p.revenue) })).sort((a, b) => b.revenue - a.revenue || b.picks - a.picks),
    brands: (Object.keys(BRAND_LABEL) as MerchBrand[]).map(b => ({ brand: b, label: BRAND_LABEL[b], units: brands.get(b)?.units ?? 0, revenue: round2(brands.get(b)?.revenue ?? 0) }))
      .sort((a, b) => b.revenue - a.revenue),
    products: [...products.entries()].map(([name, p]) => ({ name, ...p, revenue: round2(p.revenue) })).sort((a, b) => b.revenue - a.revenue).slice(0, 12),
    funnels: {
      booking: [
        { label: "Visited the site", value: sessions.size },
        { label: "Opened a booking page", value: [...sessions.values()].filter(s => s.studio || s.book).length },
        { label: "Picked a room", value: [...sessions.values()].filter(s => s.roomPick).length },
        { label: "Started checkout", value: n("booking", "begin_checkout") },
        { label: "Paid", value: n("booking", "purchase") },
      ],
      merch: [
        { label: "Visited the site", value: sessions.size },
        { label: "Viewed a product", value: n("merch", "view_item") },
        { label: "Added to cart", value: n("merch", "add_to_cart") },
        { label: "Started checkout", value: n("merch", "begin_checkout") },
        { label: "Paid", value: n("merch", "purchase") },
      ],
    },
    abandoned,
    pages: [...pages.entries()].map(([path, p]) => ({ path, views: p.views, avgTime: Math.round(avg(p.time)) })).sort((a, b) => b.views - a.views).slice(0, 12),
    referrers: [...refs.entries()].map(([host, visits]) => ({ host, visits })).sort((a, b) => b.visits - a.visits).slice(0, 8),
    devices,
    upcoming: upcomingRes.rows
      .filter(u => !(String(u.date) === today && Number(u.start_hour) + Number(u.rate_hours) <= nowHour))
      .slice(0, 8)
      .map(u => ({
        id: String(u.id), date: String(u.date), start: Number(u.start_hour), hours: Number(u.rate_hours),
        room: String(u.room), client: String(u.client_name), label: packageOf(String(u.rate_label)),
        engineer: u.engineer_slug ? engineerName(String(u.engineer_slug)) : null, price: Number(u.rate_price) / 100,
      })),
    attention: {
      unpaidHolds: Number(att.unpaid ?? 0), failedOrders: Number(att.failed ?? 0),
      unassigned: Number(att.unassigned ?? 0), owed: Number(att.owed ?? 0) / 100,
    },
  }
}

function round2(n: number) { return Math.round(n * 100) / 100 }

const STUDIO_PACKAGE_LABELS = new Map([...RECORDING_RATES, ...MIXING_RATES].map(r => [r.id, r.label]))
