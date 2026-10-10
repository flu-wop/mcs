import { Separator } from "@/components/ui/separator"
import { fmtUSD } from "@/lib/studio-rates"

export function OrderSummary({ rows, subtotal, discountPct }: {
  rows: [string, string][]
  subtotal: number
  discountPct: number | null
}) {
  const off = discountPct ? Math.round(subtotal * discountPct) : 0
  return (
    <div className="border border-studio-border rounded-sm bg-studio-card overflow-hidden">
      <div className="px-5 sm:px-6 py-4 border-b border-studio-border bg-studio-dark">
        <p className="text-[10px] tracking-widest uppercase text-gold/70">Order summary</p>
      </div>
      <dl className="p-5 sm:p-6 space-y-3 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4"><dt className="text-mist shrink-0">{k}</dt><dd className="text-cream text-right">{v}</dd></div>
        ))}
        <Separator />
        <div className="flex justify-between"><dt className="text-mist">Subtotal</dt><dd className={off ? "text-mist line-through" : "text-cream"}>{fmtUSD(subtotal)}</dd></div>
        {off > 0 && (
          <div className="flex justify-between text-[var(--if-success)]"><dt>Regular client ({Math.round(discountPct! * 100)}%)</dt><dd>−{fmtUSD(off)}</dd></div>
        )}
        <Separator />
        <div className="flex justify-between items-center"><dt className="text-mist font-medium">Total due today</dt><dd className="font-display text-3xl text-gold tabular-nums">{fmtUSD(subtotal - off)}</dd></div>
      </dl>
    </div>
  )
}
