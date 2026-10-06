"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

const rise = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

// The portada: one idea (the headline), one action, and the product itself
// rising from the bottom edge. The stage shrinks very slightly as the page
// scrolls past, the way Apple's product pages let a device recede.
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-black px-5 pt-32 text-center sm:pt-40"
      style={{
        backgroundImage:
          "radial-gradient(80% 55% at 50% 100%, rgba(126,42,192,0.55), rgba(67,61,221,0.16) 45%, transparent 72%)",
      }}
    >
      <motion.div
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.1 }}
        className="mx-auto flex max-w-5xl flex-col items-center"
      >
        <motion.p variants={rise} className="text-lg font-semibold tracking-tight text-[#c9a6e8] sm:text-xl">
          KR POS <span aria-hidden="true">·</span> KR Citas
        </motion.p>
        <motion.h1
          variants={rise}
          className="mt-3 text-balance text-[clamp(2.75rem,8.2vw,6.25rem)] font-bold leading-[1.03] tracking-[-0.045em]"
        >
          Tu negocio,
          <br />
          <span className="bg-gradient-to-r from-[#6c6bff] via-[#b44cf0] to-[#ff3da0] bg-clip-text text-transparent">
            en un solo sistema.
          </span>
        </motion.h1>
        <motion.p
          variants={rise}
          className="mt-6 max-w-2xl text-balance text-xl leading-snug tracking-tight text-[#a1a1a6] sm:text-2xl"
        >
          Ventas, inventario, finanzas y citas. Construidos a la medida de cómo trabajas.
        </motion.p>
        <motion.div variants={rise} className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:gap-7">
          <a
            href="#contacto"
            className="rounded-full bg-gradient-to-r from-[#4f46e5] to-[#9333ea] px-7 py-3 text-lg font-medium text-white transition-transform duration-150 ease-out active:scale-[0.97] pointer-coarse:py-3.5"
          >
            Cuéntanos tu proyecto
          </a>
          <a
            href="#soluciones"
            className="text-lg text-[#8da2ff] transition-colors hover:text-white pointer-coarse:py-2"
          >
            Ver soluciones <span aria-hidden="true">›</span>
          </a>
        </motion.div>
        <motion.p variants={rise} className="mt-5 text-sm text-[#6e6e73]">
          14 días gratis para probar KR POS y KR Citas, sin tarjeta y sin compromiso.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 70 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.35 }}
        style={{ scale, y }}
        className="relative mx-auto mt-14 w-full max-w-5xl origin-top sm:mt-16"
      >
        <div className="relative h-[300px] overflow-hidden sm:h-[560px]">
          <div className="overflow-hidden rounded-t-2xl border border-white/15 bg-[#131020] shadow-[0_-10px_140px_rgba(126,42,192,0.55)]">
            <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.05] px-3.5 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="mx-auto hidden rounded-md bg-white/[0.07] px-4 py-0.5 font-mono text-[11px] text-[#a1a1a6] sm:block">
                krpos.krsystem-corp.com
              </span>
            </div>
            <Image
              src="/screenshot-finanzas-desktop-v2.png"
              alt="Panel de Finanzas de KR POS en computador, con ingresos, gastos, ganancia neta y gráficos de ventas"
              width={1440}
              height={900}
              sizes="(min-width: 1024px) 1024px, 100vw"
              priority
              className="h-auto w-full"
            />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent" />
        </div>
        <div className="absolute -right-1 bottom-6 w-[27%] max-w-[190px] rotate-3 overflow-hidden rounded-[1.6rem] border-[5px] border-black shadow-[0_30px_80px_rgba(0,0,0,0.7)] sm:-right-8 sm:bottom-10">
          <Image
            src="/screenshot-finanzas-mobile-v2.png"
            alt="KR POS en el teléfono, con la barra de navegación inferior"
            width={390}
            height={844}
            sizes="190px"
            className="h-auto w-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
