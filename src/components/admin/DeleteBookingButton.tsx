"use client"
// src/components/admin/DeleteBookingButton.tsx

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

export function DeleteBookingButton({ bookingId, clientName }: { bookingId: string; clientName: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function handleDelete() {
    if (!confirm(`Delete this booking for ${clientName}? This can't be undone.`)) return
    setBusy(true)
    try {
      const res = await fetch("/api/admin/delete-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to delete")
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete booking")
      setBusy(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      className="flex items-center gap-1 text-mist/30 hover:text-red-400 text-[10px] transition-colors"
      title="Delete booking"
    >
      <Trash2 className="w-3 h-3" />
      {busy ? "Deleting…" : "Delete"}
    </button>
  )
}
