"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// A translucent glass bar pinned to the top, like Apple's: it blurs whatever
// scrolls underneath, and gives way to a plain dark bar when the visitor asks
// for reduced transparency.
const LINKS = [
  { href: "#soluciones", label: "Soluciones" },
  { href: "#sistemas", label: "Sistemas" },
  { href: "#proceso", label: "Proceso" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#contacto", label: "Contacto" },
];

export function SiteNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl backdrop-saturate-150 [@media(prefers-reduced-transparency:reduce)]:bg-black [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-5">
        <a href="#" className="flex items-center gap-2 text-base font-semibold tracking-tight" aria-label="KR System, inicio">
          <Image src="/logo.png" alt="" width={22} height={24} className="h-6 w-auto" />
          KR System
        </a>

        <nav className="hidden items-center gap-8 text-[13px] text-[#d2d2d7] lg:flex" aria-label="Principal">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors duration-150 hover:text-white">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#contacto"
            className="hidden rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-black transition-transform duration-150 ease-out active:scale-[0.96] sm:block"
          >
            Hablemos
          </a>
          <button
            type="button"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#f5f5f7] lg:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              {menuOpen ? (
                <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              ) : (
                <path d="M2 5H16M2 13H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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
            aria-label="Menú móvil"
          >
            <div className="flex flex-col px-5 py-3 text-lg font-medium text-[#f5f5f7]">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-white/10 py-3.5 transition-colors hover:text-white"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#contacto"
                onClick={() => setMenuOpen(false)}
                className="my-4 rounded-full bg-white py-3 text-center text-base font-medium text-black"
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
