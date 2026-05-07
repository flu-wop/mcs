// src/app/contact/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CONTACT PAGE  (route: /contact)
//
// Form submits to /api/contact (placeholder) which sends an email via
// Resend or SendGrid. Wire up the API route with your email credentials.
// ─────────────────────────────────────────────────────────────────────────────

"use client"

import { useState }   from "react"
import {
  Mail, MapPin, Phone, CheckCircle2, Music,
  Instagram, Twitter, Youtube,
} from "lucide-react"
import { Button }    from "@/components/ui/button"
import { Badge }     from "@/components/ui/badge"
import { Input }     from "@/components/ui/input"
import { Label }     from "@/components/ui/label"
import { Textarea }  from "@/components/ui/textarea"

/* ─── Inquiry types ────────────────────────────────────────────────────────── */
const INQUIRY_TYPES = [
  "Studio Booking",
  "Mixing / Mastering",
  "Artist Development",
  "Lil Squiggle / Merch",
  "Press / Media",
  "General",
]

/* ─────────────────────────────────────────────────────────────────────────── */
export default function ContactPage() {
  const [form, setForm] = useState({
    name: "", email: "", inquiry: "", message: "",
  })
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    setLoading(true)
    /*
      ─── EMAIL INTEGRATION POINT ───────────────────────────────────────────
      Replace this with a real API call:

        await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })

      Create /app/api/contact/route.ts using Resend:
        import { Resend } from "resend"
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: "noreply@midcitysound.com",
          to:   "midcitysound@gmail.com",
          subject: `New inquiry: ${form.inquiry}`,
          html: `<p>From: ${form.name} (${form.email})</p><p>${form.message}</p>`,
        })
      ─────────────────────────────────────────────────────────────────────
    */
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setSent(true)
  }

  const valid = form.name && form.email && form.message

  return (
    <div className="pt-16 min-h-screen bg-studio-black">

      {/* ── Page header ── */}
      <section className="py-20 px-6 bg-studio-charcoal border-b border-studio-border">
        <div className="mx-auto max-w-5xl">
          <Badge variant="outline" className="mb-4 text-[10px] tracking-widest uppercase">
            Get in Touch
          </Badge>
          <h1 className="font-display text-5xl md:text-6xl text-cream mb-4">
            Let's talk
          </h1>
          <p className="text-mist text-sm max-w-md leading-relaxed">
            Whether you're ready to book, have a project pitch, or just want to say hello —
            we read every message.
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-5xl grid md:grid-cols-[320px_1fr] gap-14">

          {/* ── Left: contact info ── */}
          <div className="space-y-8">

            {/* Info blocks */}
            <div className="space-y-5">
              {[
                {
                  icon: MapPin,
                  label: "Studio Location",
                  value: "Mid City, New Orleans, Louisiana", // ← swap real address
                },
                {
                  icon: Mail,
                  label: "General Inquiries",
                  value: "midcitysound@gmail.com", // ← swap real email
                },
                {
                  icon: Phone,
                  label: "Phone",
                  value: "+1 (504) 000-0000", // ← swap real phone
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 border border-studio-border rounded-sm flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-gold/70" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-mist mb-0.5">{label}</p>
                    <p className="text-cream text-sm">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-widest text-mist">Socials</p>
              {[
                { icon: Instagram, label: "@midcitysound",    href: "https://instagram.com" },
                { icon: Twitter,   label: "@midcitysound",    href: "https://twitter.com" },
                { icon: Youtube,   label: "Mid City Sound",   href: "https://youtube.com" },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-mist hover:text-gold transition-colors group"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{label}</span>
                </a>
              ))}
            </div>

            {/* Lil Squiggle contact */}
            <div className="border border-studio-border/60 rounded-sm p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Music className="w-3.5 h-3.5 text-gold/60" />
                <p className="text-[10px] uppercase tracking-widest text-mist">
                  Lil Squiggle
                </p>
              </div>
              <p className="text-cream text-sm">lilsquigglemon@gmail.com</p>
              <p className="text-mist text-xs">For merch, collab, and campaign inquiries</p>
            </div>
          </div>

          {/* ── Right: contact form ── */}
          {sent ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-5 text-center">
              <div className="w-16 h-16 border border-gold/40 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-gold" />
              </div>
              <h2 className="font-display text-3xl text-cream">Message sent</h2>
              <p className="text-mist text-sm max-w-xs">
                Thanks for reaching out. We'll get back to you at{" "}
                <span className="text-gold">{form.email}</span> within 1–2 business days.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Inquiry type */}
              <div className="space-y-2">
                <Label>Inquiry Type</Label>
                <div className="flex flex-wrap gap-2">
                  {INQUIRY_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => update("inquiry", type)}
                      className={[
                        "px-3 py-1.5 text-xs border rounded-sm transition-all",
                        form.inquiry === type
                          ? "border-gold bg-gold/10 text-gold"
                          : "border-studio-border text-mist hover:border-gold/40 hover:text-cream",
                      ].join(" ")}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  placeholder="Tell us what you're working on, what you need, or just say hello..."
                  className="h-40"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!valid || loading}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-studio-black/30 border-t-studio-black rounded-full animate-spin" />
                    Sending…
                  </span>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </Button>

              <p className="text-mist/50 text-[11px]">
                We respond to all messages within 1–2 business days.
                For urgent studio matters, call us directly.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
