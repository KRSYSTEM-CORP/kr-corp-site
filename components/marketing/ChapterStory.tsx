"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";

// Three chapters told with the real product. The device stays pinned while the
// copy changes; the screen zooms into the part of the dashboard each chapter
// is about, and the last chapter swaps to the phone. Below `lg` there is no
// pinning at all: a plain stacked layout, so it never fights phone scrolling.

type Chapter = {
  kicker: string;
  title: string;
  body: string;
  // Where the dashboard zooms to for this chapter.
  view: { scale: number; origin: string };
};

const CHAPTERS: Chapter[] = [
  {
    kicker: "01 · Ver",
    title: "Todo tu negocio, en una sola pantalla.",
    body: "Ingresos, gastos y ganancia al día, sin armar hojas de cálculo ni esperar al cierre de mes.",
    view: { scale: 1, origin: "50% 50%" },
  },
  {
    kicker: "02 · Entender",
    title: "Sabes cuánto ganas de verdad.",
    body: "Ingresos menos costo de mercancía y gastos, en bolívares, euros y dólares con la tasa del día.",
    view: { scale: 2.05, origin: "34% 24%" },
  },
  {
    kicker: "03 · Llevar",
    title: "Tu negocio cabe en el bolsillo.",
    body: "El mismo sistema en el teléfono, con navegación pensada para usarse con una sola mano.",
    view: { scale: 1, origin: "50% 50%" },
  },
];

const SPRING = { type: "spring", stiffness: 90, damping: 22, mass: 0.9 } as const;

function WindowFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#131020] shadow-[0_50px_140px_rgba(67,61,221,0.35)]">
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.05] px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
      </div>
      {children}
    </div>
  );
}

const DESKTOP_ALT = "Panel de Finanzas de KR POS con ingresos, gastos, ganancia neta y gráficos";
const MOBILE_ALT = "Panel de Finanzas de KR POS en el teléfono";

export function ChapterStory() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setActive(Math.min(CHAPTERS.length - 1, Math.max(0, Math.floor(p * CHAPTERS.length))));
  });

  const chapter = CHAPTERS[active];
  const showPhone = active === CHAPTERS.length - 1;

  return (
    <section id="soluciones" aria-label="Qué hace KR POS" className="bg-black">
      {/* Large screens: pinned device + changing copy */}
      <div ref={ref} className="relative hidden h-[330vh] lg:block">
        <div className="sticky top-0 mx-auto grid h-screen max-w-6xl grid-cols-[minmax(0,430px)_1fr] items-center gap-16 px-8">
          <div className="flex flex-col gap-9">
            {CHAPTERS.map((c, i) => (
              <div
                key={c.kicker}
                className="transition-opacity duration-300 ease-out"
                style={{ opacity: i === active ? 1 : 0.28 }}
                aria-current={i === active ? "step" : undefined}
              >
                <p className="text-base font-semibold text-[#c9a6e8]">{c.kicker}</p>
                <h2 className="mt-2 text-balance text-[2.6rem] font-bold leading-[1.06] tracking-[-0.035em]">{c.title}</h2>
                {i === active && <p className="mt-4 max-w-md text-xl leading-snug text-[#a1a1a6]">{c.body}</p>}
              </div>
            ))}
            <div className="flex gap-2" aria-hidden="true">
              {CHAPTERS.map((c, i) => (
                <span
                  key={c.kicker}
                  className={`h-1 w-12 rounded-full transition-colors duration-300 ${
                    i === active ? "bg-gradient-to-r from-[#6c6bff] to-[#ff3da0]" : "bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="relative">
            <motion.div animate={{ opacity: showPhone ? 0 : 1, scale: showPhone ? 0.96 : 1 }} transition={SPRING}>
              <WindowFrame>
                <div className="overflow-hidden">
                  <motion.div
                    animate={{ scale: chapter.view.scale }}
                    transition={SPRING}
                    style={{ transformOrigin: chapter.view.origin }}
                  >
                    <Image
                      src="/screenshot-finanzas-desktop-v2.png"
                      alt={DESKTOP_ALT}
                      width={1440}
                      height={900}
                      sizes="640px"
                      className="h-auto w-full"
                    />
                  </motion.div>
                </div>
              </WindowFrame>
            </motion.div>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ opacity: showPhone ? 1 : 0, scale: showPhone ? 1 : 1.06 }}
              transition={SPRING}
              aria-hidden={!showPhone}
            >
              <div className="w-[min(46%,250px)] overflow-hidden rounded-[2rem] border-[7px] border-black shadow-[0_40px_100px_rgba(67,61,221,0.45)]">
                <Image
                  src="/screenshot-finanzas-mobile-v2.png"
                  alt={MOBILE_ALT}
                  width={390}
                  height={844}
                  sizes="250px"
                  className="h-auto w-full"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Phones and tablets: stacked, nothing pinned */}
      <div className="mx-auto flex max-w-3xl flex-col gap-14 px-5 py-20 lg:hidden">
        {CHAPTERS.map((c) => (
          <div key={c.kicker}>
            <p className="text-sm font-semibold text-[#c9a6e8]">{c.kicker}</p>
            <h2 className="mt-2 text-balance text-4xl font-bold leading-[1.08] tracking-[-0.035em] sm:text-5xl">{c.title}</h2>
            <p className="mt-3 text-lg leading-snug text-[#a1a1a6]">{c.body}</p>
          </div>
        ))}
        <WindowFrame>
          <Image
            src="/screenshot-finanzas-desktop-v2.png"
            alt={DESKTOP_ALT}
            width={1440}
            height={900}
            sizes="(min-width: 640px) 700px, 100vw"
            className="h-auto w-full"
          />
        </WindowFrame>
      </div>
    </section>
  );
}
