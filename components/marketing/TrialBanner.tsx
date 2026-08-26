"use client";

import { motion } from "framer-motion";

// Slides down once on load, above the nav — the site's main surface for the
// 14-day-trial offer (the login pages of each product carry a smaller,
// floating version of the same message — see SiteFooter-adjacent usage).
export function TrialBanner() {
  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-30 overflow-hidden border-b border-white/10 bg-gradient-to-r from-[#433DDD] via-[#7E2AC0] to-[#E2098C] px-4 py-2 text-center text-sm font-medium text-white"
    >
      <span aria-hidden="true">✦</span>{" "}
      14 días gratis en KR POS, KR Citas y KR ChatBot — sin tarjeta, sin compromiso.{" "}
      <a href="#contacto" className="underline underline-offset-2 hover:no-underline">
        Empieza hoy →
      </a>
    </motion.div>
  );
}
