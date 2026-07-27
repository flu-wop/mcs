"use client"
// src/components/admin/MarkResolvedButton.tsx

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2 } from "lucide-react"

export function MarkResolvedButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [printifyOrderId, setPrintifyOrderId] = useState("")

  async function handleConfirm() {
    setBusy(true)
    try {
      const res = await fetch("/api/admin/mark-order-resolved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, printifyOrderId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to update")
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update")
      setBusy(false)
    }
  }

  if (!showInput) {
    return (
      <button
        onClick={() => setShowInput(true)}
        className="flex items-center gap-1 text-green-400/70 hover:text-green-400 text-[11px] transition-colors"
      >
        <CheckCircle2 className="w-3 h-3" />
        Mark as Fixed
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <input
        type="text"
        value={printifyOrderId}
        onChange={e => setPrintifyOrderId(e.target.value)}
        placeholder="Printify order ID (optional)"
        className="bg-studio-black border border-studio-border rounded-sm px-2 py-1 text-cream text-[11px] w-44
                   focus:outline-none focus:border-gold/50"
      />
      <button
        onClick={handleConfirm}
        disabled={busy}
        className="text-green-400 hover:text-green-300 text-[11px] transition-colors"
      >
        {busy ? "Saving…" : "Confirm"}
      </button>
      <button
        onClick={() => setShowInput(false)}
        className="text-mist/40 hover:text-mist text-[11px] transition-colors"
      >
        Cancel
      </button>
    </div>
  )
}
