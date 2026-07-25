"use client"
// src/app/admin/login/page.tsx

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Login failed")
      }
      router.push("/admin")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-studio-black flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-[10px] tracking-widest uppercase text-gold/60 mb-1 text-center">Mid City Sound</p>
        <h1 className="font-display text-3xl text-cream mb-8 text-center">Admin Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4 border border-studio-border bg-studio-charcoal rounded-sm p-6">
          <div>
            <label className="text-mist/60 text-xs mb-1.5 block">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full bg-studio-black border border-studio-border rounded-sm px-3 py-2 text-cream text-sm
                         focus:outline-none focus:border-gold/50"
              required
            />
          </div>
          <div>
            <label className="text-mist/60 text-xs mb-1.5 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full bg-studio-black border border-studio-border rounded-sm px-3 py-2 text-cream text-sm
                         focus:outline-none focus:border-gold/50"
              required
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  )
}
