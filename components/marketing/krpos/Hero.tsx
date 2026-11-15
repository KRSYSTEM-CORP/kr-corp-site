"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;
const rise = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } } };
const SIGNUP = "https://krpos.krsystem-corp.com/signup";

// Portada: KR POS es el único protagonista. Un titular, una acción, y el sistema real subiendo
// desde el borde inferior con su versión móvil.
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden px-5 pt-20 text-center sm:pt-28"
      style={{ backgroundImage: "radial-gradient(80% 55% at 50% 100%, rgba(126,42,192,0.6), rgba(67,61,221,0.18) 45%, transparent 72%)" }}
    >
      <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.1 }} className="mx-auto flex max-w-5xl flex-col items-center">
        <motion.p variants={rise} className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-sm font-semibold text-[#c9a6e8]">
          Nuevo · Asistente IA que crea PDF y registra ventas
        </motion.p>
        <motion.h1 variants={rise} className="mt-5 text-balance text-[clamp(3.2rem,11vw,8rem)] font-bold leading-[0.98] tracking-[-0.05em]">
          KR{" "}
          <span className="bg-gradient-to-r from-[#6c6bff] via-[#b44cf0] to-[#ff3da0] bg-clip-text text-transparent">POS</span>
        </motion.h1>
        <motion.p variants={rise} className="mt-4 max-w-3xl text-balance text-[clamp(1.4rem,3.4vw,2.2rem)] font-semibold leading-tight tracking-tight">
          Vende, controla tu inventario y cierra tu caja. Todo en un solo sistema.
        </motion.p>
        <motion.p variants={rise} className="mt-4 max-w-2xl text-balance text-lg leading-snug text-[#a1a1a6] sm:text-xl">
          Cobra en bolívares, euros y dólares con la tasa del día, aunque se caiga el internet. Hecho para negocios de Venezuela.
        </motion.p>
        <motion.div variants={rise} className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:gap-7">
          <a
            href={SIGNUP}
            className="rounded-full bg-gradient-to-r from-[#4f46e5] to-[#9333ea] px-8 py-3.5 text-lg font-semibold text-white shadow-[0_10px_40px_rgba(79,70,229,0.5)] transition-transform duration-150 ease-out active:scale-[0.97]"
          >
            Probar 15 días gratis
          </a>
          <a href="#recorrido" className="text-lg text-[#8da2ff] transition-colors hover:text-white pointer-coarse:py-2">
            Ver cómo funciona <span aria-hidden="true">›</span>
          </a>
        </motion.div>
        <motion.p variants={rise} className="mt-4 text-sm text-[#6e6e73]">
          Sin tarjeta y sin compromiso · Plan Emprende desde $9,99 el primer mes
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 70 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.35 }}
        style={{ scale, y }}
        className="relative mx-auto mt-12 w-full max-w-5xl origin-top sm:mt-14"
      >
        <div className="relative h-[290px] overflow-hidden sm:h-[560px]">
          <div className="overflow-hidden rounded-t-2xl border border-white/15 bg-[#131020] shadow-[0_-10px_140px_rgba(126,42,192,0.55)]">
            <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.05] px-3.5 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="mx-auto hidden rounded-md bg-white/[0.07] px-4 py-0.5 font-mono text-[11px] text-[#a1a1a6] sm:block">krpos.krsystem-corp.com</span>
            </div>
            <Image src="/krpos/inicio.png" alt="Pantalla de Inicio de KR POS con ganancia del período, accesos rápidos y ventas por hora" width={1440} height={900} sizes="(min-width: 1024px) 1024px, 100vw" priority className="h-auto w-full" />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent" />
        </div>
        <div className="absolute -right-1 bottom-6 w-[27%] max-w-[190px] rotate-3 overflow-hidden rounded-[1.6rem] border-[5px] border-black shadow-[0_30px_80px_rgba(0,0,0,0.7)] sm:-right-8 sm:bottom-10">
          <Image src="/krpos/movil-pos.png" alt="KR POS en el teléfono, con el punto de venta" width={390} height={844} sizes="190px" className="h-auto w-full" />
        </div>
      </motion.div>
    </section>
  );
}
