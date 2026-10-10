"use client"
// src/components/studio/StudioExperience.tsx
// Everything on /studio below the metadata: header, booking flow, the rooms,
// rates, policy and closing line. Client-side so "Book this room" and the
// rate-card buttons can drive the booking flow directly.

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, CheckCircle2, Clock, Mic2, Music2, Tag, ArrowRight, Mail } from "lucide-react"
import { Badge, Button } from "@flu-wop/design-system"
import { Reveal, Magnetic, Parallax } from "@flu-wop/design-system/motion"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/sections/PageHeader"
import { SectionIntro } from "@/components/sections/SectionIntro"
import { ROOMS, type Room } from "@/lib/rooms"
import { RECORDING_RATES, MIXING_RATES, fmtUSD, type StudioRate } from "@/lib/studio-rates"
import { cn } from "@/lib/utils"
import { BookingFlow, type BookingFlowHandle } from "./BookingFlow"

const LEGACY_CREDITS = ["Academy Award — Time of My Life", "Grammy Nominated", "Van Morrison", "Dr. John", "Art Neville", "Taj Mahal"]

export function StudioExperience() {
  const booking = useRef<BookingFlowHandle>(null)
  const toBooking = () => booking.current?.scrollIntoView()

  return (
    <div className="bg-studio-black">
      <PageHeader
        eyebrow="Mid City Sound Studios · New Orleans"
        title={<>Book the <span className="text-gold-gradient italic">Studio</span></>}
        lede="New Orleans' premier recording experience. Award-winning production in the heart of Mid City."
        image="/images/b-room.jpg"
        imageAlt="Studio B live room at Mid City Sound"
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Magnetic strength={0.25}>
            <Button size="lg" onClick={toBooking}><Calendar className="w-4 h-4" />Start a booking</Button>
          </Magnetic>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-mist">
            {[
              { Icon: Clock, text: "Sessions from $100/hr" },
              { Icon: Mic2, text: "Studio A · B · C" },
              { Icon: CheckCircle2, text: "Approved within 24 hrs" },
            ].map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-2"><Icon className="w-4 h-4 text-gold/60" />{text}</li>
            ))}
          </ul>
        </div>
      </PageHeader>

      {/* Legacy credits ticker */}
      <div className="border-b border-studio-border/40 bg-studio-charcoal/70 overflow-hidden" aria-label="Legacy credits">
        <div className="flex w-max animate-marquee motion-reduce:animate-none py-3">
          {[0, 1].map(k => (
            <ul key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
              {LEGACY_CREDITS.map(c => (
                <li key={c} className="flex items-center gap-8 pr-8 text-[10px] tracking-[0.2em] uppercase text-gold/60 whitespace-nowrap">
                  {c}<span className="text-gold/30">✦</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <BookingFlow ref={booking} />

      <RoomsShowcase onBook={id => booking.current?.focusRoom(id)} />

      <Rates onBook={toBooking} />

      {/* Policy */}
      <section className="py-16 px-6 border-b border-studio-border/40">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <p className="text-center text-[11px] tracking-[0.25em] uppercase text-gold/70 mb-6">Cancellation policy</p>
            <dl className="grid sm:grid-cols-3 border border-studio-border/50 rounded-sm divide-y sm:divide-y-0 sm:divide-x divide-studio-border/50">
              {[
                ["48+ hours notice", "Full refund, no questions asked."],
                ["Under 48 hours", "50% studio credit toward your next session."],
                ["Day-of / no show", "Non-refundable. Contact us to reschedule."],
              ].map(([k, v]) => (
                <div key={k} className="p-6"><dt className="text-cream text-sm font-medium mb-1">{k}</dt><dd className="text-mist text-xs leading-relaxed">{v}</dd></div>
              ))}
            </dl>
            <p className="text-center text-mist/60 text-xs mt-5">
              Questions? <a href="mailto:midcitysound1@gmail.com" className="inline-flex items-center gap-1 text-gold/80 hover:text-gold underline-offset-4 hover:underline"><Mail className="w-3 h-3" />midcitysound1@gmail.com</a>
            </p>
          </Reveal>
        </div>
      </section>

      {/* Close */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(212,175,119,0.06),transparent)]" />
        <Reveal className="relative mx-auto max-w-xl text-center">
          <h2 className="font-display text-5xl md:text-6xl text-cream mb-5 leading-[0.98]">Ready to make<br /><span className="text-gold-gradient italic">something timeless?</span></h2>
          <p className="text-mist text-sm mb-9">Returning clients get 30% off — enter your code at checkout.</p>
          <Magnetic strength={0.3} className="inline-block">
            <Button size="lg" onClick={toBooking}><Calendar className="w-4 h-4" />Book your session</Button>
          </Magnetic>
        </Reveal>
      </section>
    </div>
  )
}

/* ── Rooms ────────────────────────────────────────────────────────────── */

function RoomsShowcase({ onBook }: { onBook: (id: Room["id"]) => void }) {
  return (
    <section className="py-20 md:py-28 px-6 border-b border-studio-border/40">
      <div className="mx-auto max-w-6xl">
        <SectionIntro center eyebrow="The rooms" title="Three rooms. One sound."
          lede="Three purpose-built environments, each with professional gear and its own character." />
        <div className="space-y-16 md:space-y-24">
          {ROOMS.map((room, i) => (
            <article key={room.id} className={cn("grid md:grid-cols-2 gap-8 md:gap-14 items-center", i % 2 === 1 && "md:[&>*:first-child]:order-2")}>
              <Reveal>
                <RoomVisual room={room} />
              </Reveal>
              <Reveal delay={0.1}>
                <p className="font-display text-[5.5rem] leading-none text-gold/15 -mb-6 select-none" aria-hidden>{room.id}</p>
                <p className="text-[10px] tracking-[0.22em] uppercase text-gold/70 mb-2">{room.role}</p>
                <h3 className="font-display text-4xl text-cream mb-4">{room.name}</h3>
                <p className="text-mist text-sm leading-relaxed mb-6 max-w-md">{room.about}</p>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mb-8">
                  {room.gear.map(g => (
                    <li key={g} className="flex items-start gap-2.5 text-xs text-cream/80"><span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-gold/50 shrink-0" />{g}</li>
                  ))}
                </ul>
                <Button variant="outline" onClick={() => onBook(room.id)}>
                  {room.byArrangement ? "Request this room" : `Book ${room.name}`}<ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Reveal>
            </article>
          ))}
        </div>
        <Reveal className="mt-16 border border-studio-border/40 bg-studio-dark rounded-sm p-4 flex items-start gap-3 max-w-3xl mx-auto">
          <Calendar className="w-4 h-4 text-gold/50 shrink-0 mt-0.5" />
          <p className="text-mist text-xs leading-relaxed"><span className="text-cream font-medium">Real-time availability.</span> The booking calendar above shows each room's open times. Live iCloud calendar sync is coming soon.</p>
        </Reveal>
      </div>
    </section>
  )
}

function RoomVisual({ room }: { room: Room }) {
  if (room.image) {
    return (
      <div className="group relative aspect-[4/3] overflow-hidden rounded-sm border border-studio-border bg-studio-dark">
        <Parallax speed={-0.12} className="absolute inset-0 -top-[10%] h-[120%]">
          <Image src={room.image} alt={room.imageAlt ?? room.name} fill sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]" />
        </Parallax>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-studio-black/60 via-transparent to-transparent" />
        <div aria-hidden className="absolute top-4 left-4 w-8 h-8 border-t border-l border-gold/50" />
        <div aria-hidden className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-gold/50" />
        <span className="absolute bottom-4 left-4 text-[10px] tracking-[0.22em] uppercase text-cream/80">{room.name}</span>
      </div>
    )
  }
  // No photo yet (Studio C): a type-led plate instead of an empty frame.
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-studio-border bg-studio-charcoal grid place-items-center">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_45%,rgba(212,175,119,0.10),transparent)]" />
      <div className="relative text-center px-6">
        <p className="font-display text-[9rem] leading-none text-gold-gradient">{room.id}</p>
        <p className="text-[10px] tracking-[0.25em] uppercase text-gold/70 mt-2">{room.role}</p>
        {room.byArrangement && <Badge variant="outline" className="mt-4 text-[9px]">By arrangement</Badge>}
      </div>
      <div aria-hidden className="absolute top-4 left-4 w-8 h-8 border-t border-l border-gold/40" />
      <div aria-hidden className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-gold/40" />
    </div>
  )
}

/* ── Rates ────────────────────────────────────────────────────────────── */

function Rates({ onBook }: { onBook: () => void }) {
  return (
    <section id="rates" className="py-20 md:py-28 px-6 border-b border-studio-border/40 bg-studio-charcoal scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        <SectionIntro eyebrow="Rates & packages" title="Clear pricing, no surprises"
          lede="Every price below is what you pay at checkout. Returning clients take 30% off with their code."
          aside={<Button variant="outline" onClick={onBook}>Book now<ArrowRight className="w-3.5 h-3.5" /></Button>} />

        <RateGroup icon={<Mic2 className="w-4 h-4 text-gold/60" />} title="Recording sessions" rates={RECORDING_RATES} cols="md:grid-cols-3" />
        <div className="h-14" />
        <RateGroup icon={<Music2 className="w-4 h-4 text-gold/60" />} title="Mixing services" rates={MIXING_RATES.slice(0, 3)} cols="sm:grid-cols-2 lg:grid-cols-3" />
        <div className="h-4" />
        <RateGroup rates={MIXING_RATES.slice(3)} cols="sm:grid-cols-2" />

        <Reveal className="mt-14 border border-gold/30 bg-gold/5 rounded-sm p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-start gap-3">
            <Tag className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <div>
              <p className="text-cream font-medium text-sm">Regular client discounts</p>
              <p className="text-mist text-xs mt-0.5">Returning clients and referrals receive 30% off all sessions. <Link href="/contact" className="text-gold/80 hover:text-gold underline underline-offset-4">Ask us how to qualify.</Link></p>
            </div>
          </div>
          <Button size="sm" onClick={onBook} className="shrink-0">Book now</Button>
        </Reveal>
      </div>
    </section>
  )
}

function RateGroup({ icon, title, rates, cols }: { icon?: React.ReactNode; title?: string; rates: StudioRate[]; cols: string }) {
  return (
    <div>
      {title && <Reveal className="flex items-center gap-3 mb-6">{icon}<h3 className="font-display text-3xl text-cream">{title}</h3></Reveal>}
      <div className={cn("grid gap-4", cols)}>
        {rates.map((rate, i) => (
          <Reveal key={rate.id} delay={i * 0.06} className="h-full">
            <div className={cn("relative h-full border rounded-sm bg-studio-card p-6 transition-colors hover:border-gold/40",
              rate.popular ? "border-gold/30 shadow-[0_0_30px_rgba(212,175,119,0.06)]" : "border-studio-border")}>
              {rate.badge && <Badge variant={rate.popular ? "gold" : "outline"} className="absolute top-4 right-4 text-[9px] leading-[1.6]">{rate.badge}</Badge>}
              <p className="text-[10px] tracking-widest uppercase text-mist/50 mb-1">{rate.duration ?? (rate.id === "mix-atmos" ? "Spatial audio" : rate.id === "mix-bundle" ? "Bundle" : "Mixing")}</p>
              <p className="font-display text-xl text-cream mb-2 pr-20">{rate.label}</p>
              <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1 mb-2">
                <p className="font-display text-3xl text-gold">{fmtUSD(rate.price)}{rate.id === "hourly" && <span className="text-base text-gold/70">/hr</span>}</p>
                {rate.perHour && rate.id !== "hourly" && <p className="text-mist text-xs">{fmtUSD(rate.perHour)}/hr</p>}
                {rate.regularPrice && <p className="text-mist text-xs"><span className="text-gold/80 font-medium">{fmtUSD(rate.regularPrice)}</span> for regulars</p>}
              </div>
              <p className="text-mist text-xs leading-relaxed mb-4">{rate.desc}</p>
              <Separator className="mb-4" />
              <ul className="space-y-1.5">
                {rate.includes.map(inc => (
                  <li key={inc} className="flex items-center gap-2 text-xs text-mist/80"><span className="w-1.5 h-1.5 rounded-full bg-gold/40 shrink-0" />{inc}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
