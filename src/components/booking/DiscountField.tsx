"use client"
// Regular-client code. Checked by /api/booking-discount; the code list never
// reaches the browser and the checkout route re-applies it server-side.
import { useState } from "react"
import { AlertCircle, Check, Loader2 } from "lucide-react"
import { Button, Input, Label } from "@flu-wop/design-system"

export function DiscountField({ code, onCode, applied, onApplied }: {
  code: string
  onCode: (c: string) => void
  applied: number | null
  onApplied: (pct: number | null) => void
}) {
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function apply() {
    const c = code.trim()
    if (!c) return
    setChecking(true); setError(null)
    try {
      const res = await fetch("/api/booking-discount", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: c }),
      })
      const data = await res.json()
      if (data.valid) onApplied(data.percent)
      else { onApplied(null); setError(data.error ?? "That code isn't recognized. Reach out if you're a regular client.") }
    } catch {
      setError("Couldn't check the code. Check your connection and try again.")
    } finally { setChecking(false) }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="discount">Regular client code</Label>
      <div className="flex gap-2 max-w-sm">
        <Input id="discount" value={code} autoComplete="off" spellCheck={false}
          onChange={e => { onCode(e.target.value); setError(null); onApplied(null) }}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); apply() } }}
          placeholder="Enter your code" className="w-full" inputClassName="font-mono uppercase" />
        <Button type="button" variant="outline" onClick={apply} disabled={checking || !code.trim()} className="shrink-0 min-w-[84px]">
          {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
        </Button>
      </div>
      <div aria-live="polite" className="min-h-[18px]">
        {applied !== null && <p className="text-xs flex items-center gap-1.5 text-[var(--if-success)]"><Check className="w-3.5 h-3.5" />{Math.round(applied * 100)}% off applied</p>}
        {error && <p className="text-xs flex items-center gap-1.5 text-[var(--if-danger-text)]"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}
        {applied === null && !error && <p className="text-mist/50 text-[11px]">Returning clients and referrals get 30% off. Ask us for your code.</p>}
      </div>
    </div>
  )
}
