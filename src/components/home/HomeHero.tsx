"use client"
// Homepage hero: the studio photo sits in a scroll-linked parallax layer and
// the logo + lines lift off it as you scroll, Fire on the Bayou style.
import Image from "next/image"
import Link from "next/link"
import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Calendar } from "lucide-react"
import { Button } from "@flu-wop/design-system"
import { Magnetic, EASE_CINEMATIC, usePrefersLessMotion } from "@flu-wop/design-system/motion"

export function HomeHero() {
  const ref = useRef<HTMLElement>(null)
  const less = usePrefersLessMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"])
  const photoScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.12])
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0])

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 22, filter: "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 1, delay, ease: EASE_CINEMATIC },
  })

  return (
    <section ref={ref} className="relative flex h-[100svh] min-h-[620px] items-center justify-center overflow-hidden">
      <motion.div style={less ? undefined : { y: photoY, scale: photoScale }} className="absolute inset-0 -z-10 h-[115%]">
        <Image src="/images/b-room.jpg" alt="" fill priority sizes="100vw" className="object-cover object-[60%_55%]" />
      </motion.div>
      <div aria-hidden className="absolute inset-0 -z-[9] bg-studio-black/70" />
      <div aria-hidden className="absolute inset-0 -z-[9] bg-gradient-to-t from-studio-black via-transparent to-studio-black/40" />
      <div aria-hidden className="absolute inset-0 -z-[9] bg-[radial-gradient(ellipse_80%_50%_at_50%_80%,rgba(212,175,119,0.08),transparent)]" />

      <motion.div style={less ? undefined : { y: contentY, opacity: contentOpacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-10">
        <motion.div {...rise(0.15)} className="inline-flex items-center gap-2 px-3 py-1 border border-gold/30 rounded-sm mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span className="text-[11px] tracking-[0.2em] uppercase text-gold/80">New Orleans · Recording Studio</span>
        </motion.div>

        <motion.div {...rise(0.28)} className="flex justify-center mb-6">
          <div className="relative w-[280px] sm:w-[400px] md:w-[480px] aspect-[10/7]">
            <Image src="/images/logo/mcs3-logo.png" alt="Mid City Sound Studios" fill priority className="object-contain"
              sizes="(max-width: 640px) 280px, (max-width: 768px) 400px, 480px" />
          </div>
        </motion.div>

        <motion.p {...rise(0.45)} className="text-mist text-base sm:text-lg md:text-xl max-w-xl mx-auto mb-10 font-light leading-relaxed">
          Timeless music. Modern studio.<br /><em className="not-italic text-cream/75">Built on legacy.</em>
        </motion.p>

        <motion.div {...rise(0.6)} className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Magnetic strength={0.25}>
            <Button size="lg" asChild><Link href="/studio#booking-form"><Calendar className="w-4 h-4" />Book Studio Time</Link></Button>
          </Magnetic>
          <Magnetic strength={0.2}>
            <Button size="lg" variant="outline" asChild><Link href="/projects">Explore Projects</Link></Button>
          </Magnetic>
          <Link href="/merch" className="inline-flex items-center gap-1.5 h-12 px-4 text-sm text-mist hover:text-cream transition-colors">
            Shop Merch<ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </motion.div>

      <motion.div aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-mist/50">
        <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <span className="relative block h-10 w-px overflow-hidden bg-mist/20">
          <span className="absolute inset-x-0 top-0 h-1/2 bg-gold motion-safe:animate-[scrollcue_2s_ease-in-out_infinite]" />
        </span>
      </motion.div>
    </section>
  )
}
