// src/app/layout.tsx
// Root layout — wraps every page with the nav, footer, and global styles.
// Swap the metadata fields to match your real SEO info.

import type { Metadata } from "next";
import "./globals.css";
import { Navbar }  from "@/components/layout/Navbar";
import { Footer }  from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";

/* ─── SEO Metadata ──────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default: "Mid City Sound Studios | New Orleans",
    template: "%s | Mid City Sound Studios",
  },
  description:
    "Award-winning New Orleans recording studio. " +
    "Professional studio time, mixing, mastering, and music production in the heart of Mid City.",
  keywords: [
    "recording studio", "New Orleans", "Mid City", "Donald Markowitz",
    "mixing", "mastering", "music production", "Hip Hop", "Jazz",
  ],
  metadataBase: new URL("https://midcitysound.com"), // ← swap to your real domain
  icons: {
    icon:    "/favicon.png",
    apple:   "/favicon.png",
  },
  openGraph: {
    type:        "website",
    locale:      "en_US",
    url:         "https://midcitysound.com",
    siteName:    "Mid City Sound Studios",
    title:       "Mid City Sound Studios | New Orleans",
    description: "Timeless music. Modern studio. Built on legacy.",
    images: [
      {
        url:    "/images/og-image.jpg", // ← swap with real OG image
        width:  1200,
        height: 630,
        alt:    "Mid City Sound Studios, New Orleans",
      },
    ],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Mid City Sound Studios | New Orleans",
    description: "Timeless music. Modern studio. Built on legacy.",
    images:      ["/images/og-image.jpg"],
  },
  robots: {
    index:  true,
    follow: true,
  },
};

/* ─── Root Layout ───────────────────────────────────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      {/*
        Font Note:
        Google Fonts are loaded via @import in globals.css (Cormorant Garamond + DM Sans).
        If you move to next/font, remove the @import and configure here instead.
      */}
      <body className="bg-studio-black text-cream antialiased">
        {/* Sticky top navigation bar */}
        <Navbar />

        {/* Page content — each page/layout fills this */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* Site-wide footer */}
        <Footer />

        {/* Toast notification portal (for booking confirmations, etc.) */}
        <Toaster />
      </body>
    </html>
  );
}
