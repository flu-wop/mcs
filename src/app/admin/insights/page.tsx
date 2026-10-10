// src/app/admin/insights/page.tsx
// Studio insights. Server-rendered from lib/insights; the tab and range live
// in the URL (?tab=room&days=90), so refreshes and shared links keep them.
import { getInsights, OPEN_HOURS_LABEL } from "@/lib/insights"
import { AdminPage, AdminPageHeader, Notice, TabLinks, longDate } from "@/components/admin/ui"
import { RangePicker } from "@/components/admin/RangePicker"
import { Overview } from "@/components/admin/insights/Overview"
import { RoomMap } from "@/components/admin/insights/RoomMap"
import { StudioTab } from "@/components/admin/insights/StudioTab"
import { MerchTab } from "@/components/admin/insights/MerchTab"
import { FunnelTab } from "@/components/admin/insights/FunnelTab"
import { ContentPlanner } from "@/components/admin/insights/ContentPlanner"
import { Playbook } from "@/components/admin/insights/Playbook"

export const dynamic = "force-dynamic"
export const metadata = { title: "Insights · Admin", robots: { index: false } }

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "room", label: "Room Map" },
  { id: "studio", label: "Studio" },
  { id: "merch", label: "Merch" },
  { id: "funnel", label: "Funnel" },
  { id: "content", label: "Content" },
  { id: "playbook", label: "Playbook" },
]
const NEEDS_DATA = new Set(["overview", "room", "studio", "merch", "funnel"])

export default async function InsightsPage({ searchParams }: { searchParams: Promise<{ tab?: string; days?: string }> }) {
  const sp = await searchParams
  const tab = TABS.some(t => t.id === sp.tab) ? sp.tab! : "overview"
  const days = [7, 30, 90, 365].includes(Number(sp.days)) ? Number(sp.days) : 30
  const needsData = NEEDS_DATA.has(tab)
  let data: Awaited<ReturnType<typeof getInsights>> | null = null
  let failed = false
  if (needsData) {
    try { data = await getInsights(days) } catch (err) { console.error("[insights]", err); failed = true }
  }

  return (
    <AdminPage>
      <AdminPageHeader eyebrow="Studio" title="Insights"
        description={data ? `${longDate(data.range.start)} – ${longDate(data.range.end)}` : "How the studio, shop and content are doing"}
        actions={needsData ? <RangePicker days={days} /> : undefined} />
      <TabLinks tabs={TABS} active={tab} base="/admin/insights" keep={{ days: days === 30 ? undefined : String(days) }} />

      {needsData && data && !data.trackingSince && (
        <Notice>Visitor tracking is live. Sales history is complete; visitors, page times and room picks start counting from today.</Notice>
      )}
      {needsData && data?.trackingSince && data.trackingSince.slice(0, 10) > data.range.start && (
        <Notice>Visitor numbers start {longDate(data.trackingSince)}, when tracking went live. Sales cover the full range.</Notice>
      )}
      {failed && <Notice tone="alert">Couldn&apos;t reach the database. Refresh in a moment.</Notice>}

      {tab === "overview" && data && <Overview data={data} />}
      {tab === "room" && data && <RoomMap rooms={data.rooms} days={data.range.days} openLabel={OPEN_HOURS_LABEL} />}
      {tab === "studio" && data && <StudioTab data={data} />}
      {tab === "merch" && data && <MerchTab data={data} />}
      {tab === "funnel" && data && <FunnelTab data={data} />}
      {tab === "content" && <ContentPlanner />}
      {tab === "playbook" && <Playbook />}
    </AdminPage>
  )
}
