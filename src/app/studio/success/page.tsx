// src/app/studio/success/page.tsx
"use client"

import { Suspense }       from "react"
import { useSearchParams } from "next/navigation"
import Link               from "next/link"
import { CheckCircle2 }   from "lucide-react"
import { Button }         from "@/components/ui/button"
import { Badge }          from "@/components/ui/badge"
import { TrackPurchase }  from "@/components/analytics/TrackPurchase"

function StudioSuccessContent() {
  const params = useSearchParams()
  const sessionId = params.get("session_id")

  return (
    <div className="pt-16 min-h-screen bg-studio-black flex items-center justify-center px-6">
      <TrackPurchase funnel="booking" stripeSessionId={sessionId} />
      <div className="max-w-md w-full text-center space-y-7">

        <div className="w-20 h-20 border border-gold/40 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-gold" />
        </div>

        <div>
          <Badge variant="outline" className="mb-4 text-[10px] tracking-widest uppercase">
            Booking Confirmed
          </Badge>
          <h1 className="font-display text-4xl text-cream mb-3">You're booked.</h1>
          <p className="text-mist text-sm leading-relaxed max-w-xs mx-auto">
            Payment received. A calendar invite and confirmation email are on their way.
            We'll assign an engineer and confirm your session within 24 hours.
          </p>
        </div>

        <div className="border border-studio-border rounded-sm p-5 text-left text-sm space-y-2">
          <p className="text-cream font-medium mb-3">What happens next</p>
          <div className="space-y-2">
            {[
              "Check your email for the confirmation + .ics calendar invite",
              "Studio team will assign an engineer and reach out within 24 hours",
              "Questions? Email midcitysound1@gmail.com",
            ].map((step, i) => (
              <div key={i} className="flex gap-3 text-mist text-xs">
                <span className="text-gold font-display text-sm shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/studio">Book Another Session</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function StudioSuccessPage() {
  return (
    <Suspense fallback={
      <div className="pt-16 min-h-screen bg-studio-black flex items-center justify-center">
        <p className="text-mist text-sm tracking-widest uppercase">Loading…</p>
      </div>
    }>
      <StudioSuccessContent />
    </Suspense>
  )
}
