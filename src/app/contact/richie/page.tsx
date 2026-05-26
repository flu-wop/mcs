// src/app/contact/richie/page.tsx
// Standalone booking page for Richie Mayfield
"use client"

import { useState }   from "react"
import Link           from "next/link"
import Image          from "next/image"
import { Badge }      from "@/components/ui/badge"
import { Button }     from "@/components/ui/button"
import { Input }      from "@/components/ui/input"
import { Label }      from "@/components/ui/label"
import { Textarea }   from "@/components/ui/textarea"
import { CheckCircle2, ExternalLink, ArrowLeft } from "lucide-react"

// ── Social / linktree placeholder ─────────────────────────────────────────────
// Replace LINKTREE_URL with Richie's actual link once available
const LINKTREE_URL = "#" // e.g. "https://linktr.ee/richiemayfield"

const SERVICES = [
  "Studio Session",
  "Live Performance",
  "Collaboration",
  "Production",
  "General Inquiry",
]

export default function RichieMayfieldPage() {
  const [form, setForm]       = useState({ name: "", email: "", service: "", date: "", message: "" })
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)

  function update(f: string, v: string) { setForm(p => ({ ...p, [f]: v })) }

  async function handleSubmit() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="pt-16 min-h-screen bg-studio-black">

      {/* ── Hero ── */}
      <section className="py-16 px-6 border-b border-studio-border/40 bg-studio-charcoal">
        <div className="mx-auto max-w-4xl grid md:grid-cols-[1fr_260px] gap-10 items-center">
          <div>
            <Link href="/contact" className="flex items-center gap-2 text-mist/50 hover:text-mist text-xs mb-6 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Contact
            </Link>
            <Badge variant="outline" className="mb-4 text-[10px] tracking-widest uppercase">Book a Session</Badge>
            <h1 className="font-display text-5xl md:text-6xl text-cream mb-4 leading-tight">
              Richie
              <br /><span className="text-gold-gradient italic">Mayfield</span>
            </h1>
            <p className="text-mist text-sm max-w-md leading-relaxed mb-6">
              New Orleans musician and collaborator at Mid City Sound Studios.
              Fill out the form below and we&apos;ll be in touch within 24 hours.
            </p>

            {/* Social linktree link */}
            {LINKTREE_URL !== "#" && (
              <a
                href={LINKTREE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-gold/70 hover:text-gold transition-colors border border-gold/20 hover:border-gold/40 px-4 py-2 rounded-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Links & Social
              </a>
            )}
            {LINKTREE_URL === "#" && (
              <div className="inline-flex items-center gap-2 text-xs text-mist/30 border border-studio-border px-4 py-2 rounded-sm">
                <ExternalLink className="w-3.5 h-3.5" />
                Links & Social — coming soon
              </div>
            )}
          </div>

          {/* Photo placeholder */}
          <div className="relative aspect-[3/4] rounded-sm border border-studio-border overflow-hidden bg-studio-dark hidden md:flex flex-col items-center justify-center gap-2 text-center p-4">
            <div className="w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-gold/30" />
            </div>
            <p className="text-mist/30 text-[10px]">Add richie-mayfield.jpg<br />to /public/images/</p>
          </div>
        </div>
      </section>

      {/* ── Booking form ── */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-2xl">
          {sent ? (
            <div className="text-center space-y-4 py-16">
              <div className="w-16 h-16 border border-gold/40 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-gold" />
              </div>
              <h2 className="font-display text-3xl text-cream">Request Sent</h2>
              <p className="text-mist text-sm">We&apos;ll be in touch within 24 hours.</p>
              <Button variant="outline" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-mist text-xs uppercase tracking-widest">Name</Label>
                  <Input
                    id="name" placeholder="Your name"
                    value={form.name} onChange={e => update("name", e.target.value)}
                    className="bg-studio-charcoal border-studio-border text-cream"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-mist text-xs uppercase tracking-widest">Email</Label>
                  <Input
                    id="email" type="email" placeholder="your@email.com"
                    value={form.email} onChange={e => update("email", e.target.value)}
                    className="bg-studio-charcoal border-studio-border text-cream"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-mist text-xs uppercase tracking-widest">Service</Label>
                  <div className="flex flex-wrap gap-2">
                    {SERVICES.map(s => (
                      <button
                        key={s}
                        onClick={() => update("service", s)}
                        className={`px-3 py-1.5 text-xs rounded-sm border transition-all ${
                          form.service === s
                            ? "border-gold text-gold bg-gold/10"
                            : "border-studio-border text-mist hover:border-gold/40"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-mist text-xs uppercase tracking-widest">Preferred Date</Label>
                  <Input
                    id="date" type="date"
                    value={form.date} onChange={e => update("date", e.target.value)}
                    className="bg-studio-charcoal border-studio-border text-cream"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-mist text-xs uppercase tracking-widest">Message</Label>
                <Textarea
                  id="message" placeholder="Tell us about your project..."
                  rows={5} value={form.message}
                  onChange={e => update("message", e.target.value)}
                  className="bg-studio-charcoal border-studio-border text-cream resize-none"
                />
              </div>

              <Button
                onClick={handleSubmit} disabled={loading}
                className="w-full"
              >
                {loading ? "Sending..." : "Send Booking Request"}
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
