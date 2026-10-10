"use client"
// Contact form. Posts to /api/contact (Resend, rate-limited). A ?ref= link
// (e.g. /contact?ref=toml from Projects) pre-picks the inquiry type.
import { useEffect, useState } from "react"
import { CheckCircle2, Loader2, Mail, AlertCircle } from "lucide-react"
import { Button, Input } from "@flu-wop/design-system"
import { cn } from "@/lib/utils"

const INQUIRY_TYPES = ["Studio Booking", "Mixing / Mastering", "Artist Development", "Lil Squiggle / Merch", "Press / Media", "General"]
const REF_TO_INQUIRY: Record<string, string> = { toml: "Press / Media", squiggle: "Lil Squiggle / Merch", booking: "Studio Booking", mix: "Mixing / Mastering" }

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", inquiry: "", message: "" })
  const [touched, setTouched] = useState({ name: false, email: false, message: false })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref")?.toLowerCase()
    if (ref && REF_TO_INQUIRY[ref]) setForm(f => ({ ...f, inquiry: REF_TO_INQUIRY[ref] }))
  }, [])

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
  const valid = form.name.trim() && emailOk && form.message.trim()
  const update = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ name: true, email: true, message: true })
    if (!valid) return
    setLoading(true); setError(null)
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Something went wrong.")
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send your message. Please try again.")
    } finally { setLoading(false) }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-5 text-center border border-studio-border rounded-sm bg-studio-card" role="status">
        <div className="w-16 h-16 border border-gold/40 rounded-full grid place-items-center"><CheckCircle2 className="w-8 h-8 text-gold" /></div>
        <h2 className="font-display text-3xl text-cream">Message sent</h2>
        <p className="text-mist text-sm max-w-xs">Thanks for reaching out. We&apos;ll reply to <span className="text-gold">{form.email}</span> within 1–2 business days.</p>
        <button type="button" onClick={() => { setSent(false); setForm({ name: "", email: "", inquiry: "", message: "" }); setTouched({ name: false, email: false, message: false }) }}
          className="text-xs text-mist underline underline-offset-4 hover:text-cream">Send another message</button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Name *" id="name" autoComplete="name" value={form.name} onChange={e => update("name", e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, name: true }))} error={touched.name && !form.name.trim() ? "Add your name." : undefined} placeholder="Your name" />
        <Input label="Email *" id="email" type="email" inputMode="email" autoComplete="email" value={form.email} onChange={e => update("email", e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, email: true }))} error={touched.email && !emailOk ? "Enter an email we can reply to." : undefined} placeholder="you@example.com" />
      </div>
      <fieldset className="space-y-2">
        <legend className="if-label">What&apos;s it about?</legend>
        <div className="flex flex-wrap gap-2 pt-1">
          {INQUIRY_TYPES.map(type => (
            <button key={type} type="button" aria-pressed={form.inquiry === type} onClick={() => update("inquiry", form.inquiry === type ? "" : type)}
              className={cn("px-3 h-9 text-xs border rounded-sm transition-all",
                form.inquiry === type ? "border-gold bg-gold/10 text-gold" : "border-studio-border text-mist hover:border-gold/40 hover:text-cream")}>
              {type}
            </button>
          ))}
        </div>
      </fieldset>
      <Input multiline label="Message *" id="message" value={form.message} onChange={e => update("message", e.target.value)}
        onBlur={() => setTouched(t => ({ ...t, message: true }))} error={touched.message && !form.message.trim() ? "Tell us a little about what you need." : undefined}
        placeholder="Tell us what you're working on, what you need, or just say hello…" inputClassName="h-40" />
      {error && <p role="alert" className="text-[var(--if-danger-text)] text-xs flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Sending…</> : <><Mail className="w-4 h-4" />Send message</>}
        </Button>
        <p className="text-mist/50 text-[11px]">We respond to every message within 1–2 business days.</p>
      </div>
    </form>
  )
}
