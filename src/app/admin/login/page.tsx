"use client"
// src/app/admin/login/page.tsx
// Admin sign-in. Posts to /api/admin/login (rate-limited); on success the
// signed session cookie lets middleware.ts through to /admin.

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button, Input } from "@flu-wop/design-system"

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Couldn't sign in.")
      router.push("/admin")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't sign in.")
      setLoading(false)
    }
  }

  return (
    <div className="admin-root relative min-h-[100svh] bg-studio-black flex items-center justify-center px-5 overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(212,175,119,0.10),transparent)]" />
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-gold text-sm mb-2" aria-hidden>✦</p>
          <p className="font-display text-3xl text-cream">Mid City Sound</p>
          <p className="text-[10px] tracking-[0.26em] uppercase text-mist/60 mt-1">Admin</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 border border-studio-border bg-studio-charcoal/90 backdrop-blur rounded-sm p-6">
          <Input label="Username" id="username" autoComplete="username" autoCapitalize="none" spellCheck={false}
            value={username} onChange={e => setUsername(e.target.value)} required />
          <div className="relative">
            <Input label="Password" id="password" type={show ? "text" : "password"} autoComplete="current-password"
              value={password} onChange={e => setPassword(e.target.value)} required inputClassName="pr-11" />
            <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-1 bottom-1 w-9 h-9 grid place-items-center text-mist hover:text-cream">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {error && <p role="alert" className="text-[var(--if-danger-text)] text-xs flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}
          <Button type="submit" disabled={loading || !username || !password} className="w-full">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</> : "Sign in"}
          </Button>
        </form>
        <p className="text-center mt-6"><Link href="/" className="text-xs text-mist/60 hover:text-gold">← Back to the site</Link></p>
      </div>
    </div>
  )
}
