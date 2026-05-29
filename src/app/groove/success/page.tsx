// src/app/groove/success/page.tsx
import { redirect } from "next/navigation"
import Stripe       from "stripe"
import Link         from "next/link"
import { Download, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

export default async function GrooveSuccess({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams

  if (!session_id) redirect("/groove")

  try {
    const stripe  = getStripe()
    const session = await stripe.checkout.sessions.retrieve(session_id)
    if (session.payment_status !== "paid") redirect("/groove")
  } catch {
    redirect("/groove")
  }

  return (
    <div className="bg-studio-black min-h-screen flex items-center justify-center px-6 py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(212,175,119,0.04),transparent)]" />
      <div className="relative mx-auto max-w-md text-center space-y-8">

        <div className="flex justify-center">
          <CheckCircle2 className="w-16 h-16 text-gold" strokeWidth={1} />
        </div>

        <div className="space-y-3">
          <p className="text-[10px] tracking-widest uppercase text-gold/60">
            Mid City Sound Studios · New Orleans
          </p>
          <h1 className="font-display text-5xl text-cream italic">Thank you.</h1>
          <p className="text-mist text-sm leading-relaxed">
            Your groove is ready. Click below to save the full track.
          </p>
        </div>

        <div className="border border-studio-border rounded-sm bg-studio-card p-6 space-y-4">
          <p className="text-[10px] tracking-widest uppercase text-gold/60">
            Groove of the Week — Full Track
          </p>
          <a
            href="/audio/groove-full.mp3"
            download="midcitysound-groove-of-the-week.mp3"
            className="block"
          >
            <Button className="w-full" size="lg">
              <Download className="w-4 h-4" />Download Full Track
            </Button>
          </a>
          <p className="text-mist/40 text-[11px]">
            High-quality MP3 · Yours to keep forever.
          </p>
        </div>

        <Link
          href="/groove"
          className="inline-block text-mist/40 text-xs hover:text-mist transition-colors"
        >
          ← Back to Groove of the Week
        </Link>

      </div>
    </div>
  )
}
