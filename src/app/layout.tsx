// src/app/layout.tsx
// Root layout — wraps every page with the nav, footer, and global styles.

import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Navbar }   from "@/components/layout/Navbar";
import { Footer }   from "@/components/layout/Footer";
import { Toaster }  from "@/components/ui/toaster";
import CartProvider from "@/components/merch/CartProvider";

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
  metadataBase: new URL("https://midcitysound.com"),
  icons: {
    icon:  "/favicon.png",
    apple: "/favicon.png",
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
        url:    "/images/og-image.jpg",
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
        <CartProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <Toaster />
        </CartProvider>

        {/* Funnel analytics pixels — each a no-op until its env var is set in Vercel */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
            `}</Script>
          </>
        )}

        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <Script id="meta-pixel-init" strategy="afterInteractive">{`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
            (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}</Script>
        )}

        {process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID && (
          <Script id="tiktok-pixel-init" strategy="afterInteractive">{`
            !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
            ttq.load('${process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID}');ttq.page();}(window,document,'ttq');
          `}</Script>
        )}
      </body>
    </html>
  );
}
