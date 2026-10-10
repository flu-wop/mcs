"use client"
// src/components/admin/LogoutButton.tsx
import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  async function logout() {
    setBusy(true)
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {})
    router.push("/admin/login")
    router.refresh()
  }
  return (
    <button onClick={logout} disabled={busy} className="inline-flex items-center gap-1.5 text-xs text-mist hover:text-gold transition-colors disabled:opacity-50">
      <LogOut className="w-3.5 h-3.5" /><span className="hidden sm:inline">Log out</span>
    </button>
  )
}
