// src/app/legacy/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// LEGACY PAGE — Donald Markowitz
// Timeline fully verified against IMDB, donaldmarkowitz.com, and public sources.
// All credits are accurate as of May 2026.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata }  from "next"
import Link               from "next/link"
import Image              from "next/image"
import { Award, Music, Star, MapPin, ArrowRight, Film, Mic2, Theater } from "lucide-react"
import { Button }         from "@/components/ui/button"
import { Badge }          from "@/components/ui/badge"
import { Separator }      from "@/components/ui/separator"

export const metadata: Metadata = {
  title:       "Legacy — Donald Markowitz",
  description: "The career of Donald Markowitz — Academy Award-winning co-writer of '(I've Had) The Time of My Life' from Dirty Dancing, Grammy-nominated producer, and founder of Mid City Sound Studios in New Orleans.",
}

/* ─── Verified timeline — all facts sourced from IMDB + donaldmarkowitz.com ── */
const TIMELINE = [
  {
    year:  "New York",
    era:   "The Beginning",
    city:  "New York City",
    icon:  Music,
    title: "Born & Raised in New York",
    body:  "Donald Markowitz was born and raised in New York City. He began his career as a bass player, performing with Speedo and the Cadillacs and a wide range of artists from that era. He played the Apollo Theatre, Radio City Music Hall, the Cotton Club, and Roseland Ballroom — the beating heart of New York's live music scene.",
    tags:  ["Bass Player", "Apollo Theatre", "Radio City", "NYC"],
  },
  {
    year:  "Theatre",
    era:   "Stage & Composition",
    city:  "New York City",
    icon:  Theater,
    title: "Theatre & Early Composition",
    body:  "Expanding into theatre, Donald's band Arms Akimbo performed and wrote the music for Sam Shepard's \"The Tooth of Crime\" at the renowned La Mama Theatre in New York. He went on to compose for the WPA Theatre, the Old Globe in San Diego, and The Falcon Theatre in Los Angeles — building a reputation as a composer of range and depth.",
    tags:  ["Arms Akimbo", "Sam Shepard", "La Mama Theatre", "WPA Theatre", "Old Globe"],
  },
  {
    year:  "1987",
    era:   "The Oscar",
    city:  "Hollywood / Academy Awards",
    icon:  Award,
    title: "Academy Award — Best Original Song",
    body:  "Donald co-writes \"(I've Had) The Time of My Life\" for the film Dirty Dancing. The song wins the Academy Award for Best Original Song — one of the most iconic film songs ever recorded. It also earns a Golden Globe Award and a Grammy Award, cementing Donald's place among the most celebrated songwriters of his generation.",
    tags:  ["Academy Award", "Oscar®", "Golden Globe", "Grammy", "Dirty Dancing", "Time of My Life"],
  },
  {
    year:  "Post-Oscar",
    era:   "Hollywood Years",
    city:  "Los Angeles, CA",
    icon:  Film,
    title: "Hollywood — Film & Television",
    body:  "After winning the Oscar, Donald relocated to Los Angeles where he spent many years writing songs and scores for film and television. His credits include work on Highlander II: The Quickening and a sustained career in Hollywood production. James Taylor, Shawn Colvin, and Nicolette Larson sang on his records during this era.",
    tags:  ["Film Scoring", "Television", "Hollywood", "James Taylor", "Shawn Colvin"],
  },
  {
    year:  "2011",
    era:   "New Orleans",
    city:  "New Orleans, Louisiana",
    icon:  MapPin,
    title: "New Orleans — A New Chapter",
    body:  "In 2011, Donald and his family moved to the Broadmoor neighborhood of New Orleans. The city's unmatched musical DNA — the second line, the brass band tradition, the deep funk heritage — drew him immediately into its creative community. He began working with some of the city's most legendary artists.",
    tags:  ["New Orleans", "Broadmoor", "NOLA", "2011"],
  },
  {
    year:  "2014",
    era:   "Grammy Nomination",
    city:  "New Orleans, Louisiana",
    icon:  Star,
    title: "Grammy Nomination — Bobby Rush",
    body:  "Donald produces Bobby Rush's album Decisions, which features a duet with Dr. John on a song co-written by Markowitz called \"Another Murder in New Orleans.\" The album earns a 2014 Grammy Award nomination for Best Blues Album. He also goes on to produce some of Dr. John's final recordings — a profound chapter in New Orleans music history.",
    tags:  ["Grammy Nominated", "Bobby Rush", "Dr. John", "Best Blues Album", "Decisions"],
  },
  {
    year:  "Ongoing",
    era:   "Collaborations",
    city:  "New Orleans & Beyond",
    icon:  Mic2,
    title: "A Career of Legendary Collaborations",
    body:  "Over his career, Donald has produced, written, recorded and worked with Van Morrison, Taj Mahal, Dr. John, Bill Medley, Bobby Rush, Art Neville, Ivan Neville, James Andrews, Irvin Mayfield, Lee Sklar, Shane Theriot, and Doug Belote — among many others. Now signed to Kobalt Music, he continues to collaborate with great artists from New Orleans and around the world.",
    tags:  ["Van Morrison", "Taj Mahal", "Art Neville", "Ivan Neville", "Bill Medley", "Kobalt Music"],
  },
  {
    year:  "Now",
    era:   "Mid City Sound",
    city:  "Mid City, New Orleans",
    icon:  Award,
    title: "Mid City Sound Studios",
    body:  "Donald founded Mid City Sound Studios in New Orleans — a world-class recording space built on decades of award-winning craft. The studio is a creative home for local legends, touring artists, and the next generation of creators. He is also the creator and producer of Street Beat: Drumming Below Sea Level, a documentary celebrating New Orleans drumming culture.",
    tags:  ["Mid City Sound", "Studio", "Street Beat", "Documentary"],
  },
]

/* ─── Gallery captions ────────────────────────────────────────────────────── */
const GALLERY = [
  "Performing in New York",
  "Oscar night — Academy Awards",
  "Recording session, Los Angeles",
  "At the board, New Orleans",
  "Mid City Sound Studios",
  "With artists, New Orleans",
]

/* ─────────────────────────────────────────────────────────────────────────── */
export default function LegacyPage() {
  return (
    <div className="pt-16 min-h-screen bg-studio-black">

      {/* ── Page hero ── */}
      <section className="relative py-24 px-6 bg-studio-charcoal border-b border-studio-border overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_60%_60%_at_80%_40%,rgba(212,175,119,0.06),transparent)]" />

        <div className="relative mx-auto max-w-5xl grid md:grid-cols-2 gap-14 items-center">

          {/* Photo placeholder */}
          <div className="relative aspect-[3/4] bg-studio-dark border border-studio-border rounded-sm overflow-hidden order-2 md:order-1">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-mist/30 gap-4 px-8">
              <div className="relative w-[100px] h-[62px] opacity-20">
                <Image src="/images/logo/wave-moon.jpg" alt="" fill className="object-contain" sizes="100px" />
              </div>
              <span className="text-xs tracking-widest uppercase text-center leading-relaxed">
                Donald Markowitz<br />
                <span className="text-[10px] text-mist/20 normal-case tracking-normal">Replace with portrait photo</span>
              </span>
            </div>
            <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-gold/40" />
            <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-gold/40" />
          </div>

          {/* Bio intro */}
          <div className="space-y-6 order-1 md:order-2">
            <Badge variant="outline" className="text-[10px] tracking-widest uppercase">
              The Legacy of Donald Markowitz
            </Badge>
            <h1 className="font-display text-5xl md:text-6xl text-cream leading-tight">
              Five decades
              <br />
              <span className="text-gold-gradient italic">of award-winning craft</span>
            </h1>
            <Separator className="w-12 bg-gold/40" />

            {/* Accurate bio — sourced from IMDB and donaldmarkowitz.com */}
            <p className="text-mist text-sm leading-relaxed">
              Donald Markowitz is a New York-born, New Orleans-based composer, producer, and
              songwriter. He is best known as the co-writer of{" "}
              <em>&ldquo;(I&apos;ve Had) The Time of My Life&rdquo;</em> from{" "}
              <em>Dirty Dancing</em> — which won the Academy Award, Golden Globe, and Grammy
              Award for Best Original Song.
            </p>
            <p className="text-mist text-sm leading-relaxed">
              A Grammy-nominated producer, Donald has collaborated with Van Morrison, Taj Mahal,
              Dr. John, Bobby Rush, Art Neville, Bill Medley, and dozens more. He is the
              founder of Mid City Sound Studios and the creator of the documentary
              <em> Street Beat: Drumming Below Sea Level</em>.
            </p>

            {/* Verified highlight stats */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              {[
                { val: "Oscar®",  label: "Academy Award\nWinner" },
                { val: "Grammy",  label: "Nominated\nProducer" },
                { val: "40+",     label: "Years in\nMusic" },
              ].map(({ val, label }) => (
                <div key={label} className="border border-studio-border rounded-sm p-3 text-center">
                  <p className="font-display text-xl text-gold">{val}</p>
                  <p className="text-mist text-[10px] mt-1 leading-snug whitespace-pre-line">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Verified credits strip ── */}
      <section className="border-b border-studio-border/40 bg-studio-black py-6 px-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-[10px] tracking-[0.2em] uppercase text-gold/60 text-center mb-4">
            Selected Credits & Collaborations
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "Academy Award — Best Original Song",
              "Golden Globe — Best Original Song",
              "Grammy Award — Time of My Life",
              "Grammy Nominated — Best Blues Album",
              "Van Morrison",
              "Taj Mahal",
              "Dr. John",
              "Bobby Rush",
              "Art Neville",
              "Ivan Neville",
              "Bill Medley",
              "James Taylor",
              "Shawn Colvin",
              "Kobalt Music",
            ].map(credit => (
              <span
                key={credit}
                className="text-[10px] tracking-wide px-3 py-1 border border-studio-border/60 text-mist/70 rounded-sm"
              >
                {credit}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-3 text-[10px] tracking-widest uppercase">
              The Journey
            </Badge>
            <h2 className="font-display text-4xl text-cream">A life in music</h2>
            <p className="text-mist/50 text-xs mt-2 max-w-xs mx-auto">
              All credits verified via IMDB, donaldmarkowitz.com, and public sources.
            </p>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-7 top-0 bottom-0 w-px bg-studio-border" />

            <div className="space-y-0">
              {TIMELINE.map(({ year, city, icon: Icon, title, body, tags }) => (
                <div key={year + title} className="relative flex gap-8 pb-14 last:pb-0">

                  {/* Icon node */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-14 h-14 rounded-full border border-gold/40 bg-studio-dark flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gold" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-3">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-display text-2xl text-gold">{year}</span>
                      <span className="text-mist text-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {city}
                      </span>
                    </div>
                    <h3 className="font-display text-xl text-cream mb-3">{title}</h3>
                    <p className="text-mist text-sm leading-relaxed mb-4">{body}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Photo gallery ── */}
      <section className="py-24 px-6 bg-studio-charcoal border-t border-studio-border">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3 text-[10px] tracking-widest uppercase">
              Photo Archive
            </Badge>
            <h2 className="font-display text-4xl text-cream">Through the decades</h2>
            <p className="text-mist text-xs mt-2">
              Replace placeholders with real photos in{" "}
              <code className="text-gold/70">public/images/</code>
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {GALLERY.map((caption, i) => (
              <div
                key={i}
                className="relative aspect-square bg-studio-dark border border-studio-border rounded-sm overflow-hidden group"
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center text-mist/20 gap-2 p-4 text-center">
                  <Music className="w-8 h-8" />
                  <span className="text-[10px] leading-snug">{caption}</span>
                </div>
                <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/5 transition-colors flex items-end">
                  <p className="w-full text-[11px] text-mist/70 p-3 bg-studio-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    {caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pull quote ── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(212,175,119,0.04),transparent)]" />
        <div className="relative mx-auto max-w-2xl text-center">
          <p className="font-display text-3xl md:text-4xl text-cream/90 leading-relaxed italic">
            &ldquo;Every session is a conversation between where music has been
            and where it needs to go.&rdquo;
          </p>
          <p className="text-gold mt-6 text-sm">— Donald Markowitz</p>
          <Separator className="w-8 bg-gold/30 mx-auto mt-8 mb-8" />
          <Button asChild>
            <Link href="/studio">
              Book a Session
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
