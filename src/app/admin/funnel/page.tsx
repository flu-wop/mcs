// src/app/admin/funnel/page.tsx
// Funnel now lives in Insights; keep old bookmarks working.
import { redirect } from "next/navigation"
export default function FunnelRedirect() { redirect("/admin/insights?tab=funnel") }
