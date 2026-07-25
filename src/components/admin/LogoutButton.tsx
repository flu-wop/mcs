"use client"
// src/components/admin/LogoutButton.tsx

import { useRouter } from "next/navigation"

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-mist/50 hover:text-gold text-xs tracking-wide transition-colors"
    >
      Log out
    </button>
  )
}
