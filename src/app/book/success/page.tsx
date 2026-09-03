// src/app/book/success/page.tsx
import { redirect }    from "next/navigation"
import Link            from "next/link"
import Stripe          from "stripe"
import { CheckCircle2, Calendar, Clock, User, Music2 } from "lucide-react"
import { Button }      from "@/components/ui/button"
import { TrackPurchase } from "@/components/analytics/TrackPurchase"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

export default async function BookSuccess({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams
  if (!session_id) redirect("/studio")

  let session: Stripe.Checkout.Session
  try {
    session = await getStripe().checkout.sessions.retrieve(session_id)
    if (session.payment_status !== "paid") redirect("/studio")
  } catch {
    redirect("/studio")
  }

  const m = session.metadata ?? {}

  return (
    <div className="bg-studio-black min-h-screen pt-16">
      <TrackPurchase funnel="booking" stripeSessionId={session.id} value={(session.amount_total ?? 0) / 100} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_20%,rgba(212,175,119,0.05),transparent)]" />

      <div className="relative mx-auto max-w-lg px-6 py-20 text-center space-y-8">

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 border border-gold/30 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-gold" strokeWidth={1.5} />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <p className="text-[10px] tracking-widest uppercase text-gold/60">Mid City Sound Studios</p>
          <h1 className="font-display text-5xl text-cream italic">You're booked.</h1>
          <p className="text-mist text-sm leading-relaxed">
            Payment received. Studio management will confirm your session within 24 hours
            and send a calendar invite to{" "}
            <span className="text-cream">{m.clientEmail ?? session.customer_email}</span>.
          </p>
        </div>

        {/* Booking summary */}
        <div className="border border-studio-border rounded-sm bg-studio-card text-left divide-y divide-studio-border">
          <div className="px-5 py-3 bg-studio-dark">
            <p className="text-[10px] tracking-widest uppercase text-gold/60">Booking Summary</p>
          </div>
          <div className="px-5 py-4 space-y-3 text-sm">
            {m.engineerName && (
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gold/50 shrink-0" />
                <span className="text-mist">Engineer</span>
                <span className="text-cream ml-auto">{m.engineerName}</span>
              </div>
            )}
            {m.room && (
              <div className="flex items-center gap-3">
                <Music2 className="w-4 h-4 text-gold/50 shrink-0" />
                <span className="text-mist">Room</span>
                <span className="text-cream ml-auto">Studio {m.room}</span>
              </div>
            )}
            {m.rateLabel && (
              <div className="flex items-center gap-3">
                <Music2 className="w-4 h-4 text-gold/50 shrink-0" />
                <span className="text-mist">Session</span>
                <span className="text-cream ml-auto">{m.rateLabel}</span>
              </div>
            )}
            {m.date && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gold/50 shrink-0" />
                <span className="text-mist">Date</span>
                <span className="text-cream ml-auto">
                  {new Date(m.date).toLocaleDateString("en-US",{weekday:"short",month:"long",day:"numeric",year:"numeric"})}
                </span>
              </div>
            )}
            {m.startHour && (
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gold/50 shrink-0" />
                <span className="text-mist">Start time</span>
                <span className="text-cream ml-auto">
                  {Number(m.startHour) < 12
                    ? `${m.startHour}:00 AM`
                    : Number(m.startHour) === 12
                    ? "12:00 PM"
                    : `${Number(m.startHour)-12}:00 PM`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline">
            <Link href="/studio">Back to Studio</Link>
          </Button>
          <Button asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>

        <p className="text-mist/30 text-[11px]">
          Questions? Email us at midcitysound1@gmail.com
        </p>

      </div>
    </div>
  )
}
