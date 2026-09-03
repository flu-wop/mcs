// src/app/admin/layout.tsx
// Wraps every /admin/* page in the persistent nav shell. Auth itself is
// still handled by src/middleware.ts — this only adds shared chrome.

import { AdminShell } from "@/components/admin/AdminShell"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
