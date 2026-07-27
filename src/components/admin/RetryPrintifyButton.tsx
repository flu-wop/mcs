"use client"
// src/components/admin/RetryPrintifyButton.tsx

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"

export function RetryPrintifyButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function handleRetry() {
    setBusy(true)
    try {
      const res = await fetch("/api/admin/retry-printify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Retry failed")
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Retry failed")
      setBusy(false)
    }
  }

  return (
    <button
      onClick={handleRetry}
      disabled={busy}
      className="flex items-center gap-1 text-gold/70 hover:text-gold text-[11px] transition-colors"
    >
      <RefreshCw className={`w-3 h-3 ${busy ? "animate-spin" : ""}`} />
      {busy ? "Retrying…" : "Retry Printify Order"}
    </button>
  )
}
