"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Cada opción abre su propia pantalla: la portada es solo KR POS y el resto de la información
// (cómo creamos sistemas, sistemas a medida, desarrollo web corporativo, contacto) vive aparte.
const LINKS = [
  { href: "/", label: "KR POS" },
  { href: "/como-creamos-sistemas", label: "Cómo creamos sistemas" },
  { href: "/sistemas-a-medida", label: "Sistemas a medida" },
  { href: "/desarrollo-web-corporativo", label: "Desarrollo web corporativo" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl backdrop-saturate-150 [@media(prefers-reduced-transparency:reduce)]:bg-black [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight" aria-label="KR System, inicio">
          <Image src="/logo.png" alt="" width={22} height={24} className="h-6 w-auto" />
          KR System
        </Link>

        <nav className="hidden items-center gap-7 text-[13px] text-[#d2d2d7] lg:flex" aria-label="Principal">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active(l.href) ? "page" : undefined}
              className={`transition-colors duration-150 hover:text-white ${active(l.href) ? "font-semibold text-white" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://krpos.krsystem-corp.com/signup"
            className="hidden rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-black transition-transform duration-150 ease-out active:scale-[0.96] sm:block"
          >
            Probar gratis
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
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className={`border-b border-white/10 py-3.5 transition-colors hover:text-white ${active(l.href) ? "text-white" : "text-[#d2d2d7]"}`}
                >
                  {l.label}
                </Link>
              ))}
              <a
                href="https://krpos.krsystem-corp.com/signup"
                className="my-4 rounded-full bg-white py-3 text-center text-base font-medium text-black"
              >
                Probar KR POS gratis
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
