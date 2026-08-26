"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Framer Motion replacement for the old IntersectionObserver + CSS-class
// version (see git history) — same easing signature (ease-out-expo) and
// timing as the hero's own load-in, so scroll reveals and the hero share one
// motion identity. `once: true` matches the old behavior: a section commits
// to visible the first time it's seen and never re-hides on scroll-up.
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
