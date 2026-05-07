// src/app/not-found.tsx
// Custom 404 page — keeps brand vibe on dead links.

import Link   from "next/link"
import { Music } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="pt-16 min-h-screen bg-studio-black flex items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 mx-auto border border-studio-border rounded-full flex items-center justify-center">
          <Music className="w-7 h-7 text-gold/50" />
        </div>
        <div>
          <p className="font-display text-7xl text-gold/30 mb-2">404</p>
          <h1 className="font-display text-3xl text-cream">Track not found</h1>
          <p className="text-mist text-sm mt-3">
            This page doesn't exist — but the music does.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link href="/">Back Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/studio">Book Studio</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
