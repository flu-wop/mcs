"use client"
// Animated container for one booking step: slides in the direction of travel.
import { AnimatePresence, motion } from "framer-motion"
import { EASE_CINEMATIC, usePrefersLessMotion } from "@flu-wop/design-system/motion"
import type { ReactNode } from "react"

export function StepPanel({ stepKey, dir, children }: { stepKey: string | number; dir: 1 | -1; children: ReactNode }) {
  const less = usePrefersLessMotion()
  return (
    <AnimatePresence mode="wait" initial={false} custom={dir}>
      <motion.div key={stepKey} custom={dir}
        initial={less ? { opacity: 0 } : { opacity: 0, x: 32 * dir }}
        animate={{ opacity: 1, x: 0 }}
        exit={less ? { opacity: 0 } : { opacity: 0, x: -32 * dir }}
        transition={{ duration: 0.45, ease: EASE_CINEMATIC }}>
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
