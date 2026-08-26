"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Inspired by the Framer "Premium SaaS Navbar" concept (animated underline,
// glassy sticky bar) — rebuilt as our own code rather than a literal port,
// since the original is a Framer-editor artifact wired to half a dozen
// icon/video sub-components hosted on Framer's own asset URLs. The one
// functional gap this closes for real: the site previously had no mobile
// navigation at all below the `lg` breakpoint, just a logo and a CTA.

const LINKS = [
  { href: "#servicios", label: "Servicios" },
  { href: "#soluciones", label: "Sistemas Empresariales" },
  { href: "#proceso", label: "Proceso" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#contacto", label: "Contacto" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      className="relative py-1 transition-colors hover:text-white"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
      <motion.span
        className="absolute inset-x-0 -bottom-0.5 h-px bg-gradient-to-r from-[#433DDD] to-[#E2098C]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "left" }}
      />
    </a>
  );
}

export function SiteNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0a0912]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight">
          <Image src="/logo.png" alt="KR System" width={28} height={30} className="h-7 w-auto" />
          KR{" "}
          <span className="bg-gradient-to-r from-[#433DDD] to-[#E2098C] bg-clip-text text-transparent">
            SYSTEM
          </span>
        </span>

        <nav className="hidden gap-7 text-sm font-medium text-[#a29cbd] lg:flex">
          {LINKS.map((l) => (
            <NavLink key={l.href} {...l} />
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            href="#contacto"
            className="hidden rounded-lg bg-gradient-to-r from-[#433DDD] to-[#E2098C] px-4 py-2 text-sm font-medium text-white shadow-[0_8px_24px_-10px_rgba(226,9,140,0.6)] sm:block"
          >
            Hablemos
          </motion.a>
          <button
            type="button"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-[#f3f1f9] lg:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              {menuOpen ? (
                <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              ) : (
                <path d="M1 4H17M1 9H17M1 14H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-white/10 lg:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4 text-sm font-medium text-[#a29cbd]">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#contacto"
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-lg bg-gradient-to-r from-[#433DDD] to-[#E2098C] px-3 py-2.5 text-center font-medium text-white"
              >
                Hablemos
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
