"use client";

import { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/marketing/Reveal";

// Demostración del Asistente IA con datos de ejemplo: pregunta, gráfico, PDF y venta con vista previa.
const BARS = [38, 52, 44, 71, 63, 88, 100];
const DAYS = ["L", "M", "X", "J", "V", "S", "D"];

type Step = 0 | 1 | 2 | 3;

export function AssistantDemo() {
  const [step, setStep] = useState<Step>(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => ((s + 1) % 4) as Step), 3800);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="asistente" aria-label="Asistente IA" className="px-5 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <p className="text-base font-semibold text-[#c9a6e8]">Asistente IA</p>
          <h2 className="mt-2 text-balance text-[clamp(2.25rem,6vw,4.25rem)] font-bold leading-[1.05] tracking-[-0.04em]">
            Pregúntale a tu negocio. <span className="bg-gradient-to-r from-[#6c6bff] via-[#b44cf0] to-[#ff3da0] bg-clip-text text-transparent">Te responde con datos reales.</span>
          </h2>
          <p className="mt-5 max-w-xl text-xl leading-snug text-[#a1a1a6]">
            Gráficos, tablas, fotos de tus productos y reportes en PDF con vista previa. Y si se lo pides, prepara una venta para que la confirmes.
          </p>
          <ul className="mt-6 flex flex-col gap-3 text-lg">
            {["Responde con las cifras de tu base de datos, nunca inventadas", "Genera PDF de inventario, cuentas por cobrar, gastos y más", "Propone ventas y gastos: tú confirmas y puedes deshacer 24 h", "1 crédito por consulta · 5 por documento o consulta grande"].map((b) => (
              <li key={b} className="flex gap-3">
                <span aria-hidden="true" className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-[#433ddd]/30 text-xs text-[#a8a4ff]">✓</span>
                {b}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="overflow-hidden rounded-[28px] border border-white/15 bg-[#0f0c1c] shadow-[0_40px_120px_rgba(126,42,192,0.4)]">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-sm font-semibold">
              <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-[#6c6bff] to-[#ff3da0] text-xs">✦</span>
              Asistente IA
              <span className="ml-auto rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-[#d2d2d7]">Créditos: 96</span>
            </div>
            <div className="flex min-h-[380px] flex-col gap-3 p-4" aria-live="off">
              <div className="self-end rounded-2xl rounded-br-md bg-[#4f46e5] px-4 py-2.5 text-[15px] font-medium">
                {step < 2 ? "Muéstrame las ventas de la semana y dame el PDF" : "Vende 2 camisas a María Pérez, pago móvil"}
              </div>
              <AnimatePresence mode="wait">
                <m.div
                  key={step < 2 ? "a" : "b"}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="max-w-[92%] self-start rounded-2xl rounded-bl-md bg-white/[0.08] p-3.5"
                >
                  {step < 2 ? (
                    <>
                      <p className="text-[15px]">Esta semana vendiste <b>$1.214</b>, un 18 % más que la anterior. El sábado fue tu mejor día.</p>
                      <div className="mt-3 flex h-28 items-end gap-2 rounded-xl bg-black/30 p-3" role="img" aria-label="Gráfico de ventas por día">
                        {BARS.map((h, i) => (
                          <div key={i} className="flex flex-1 flex-col items-center gap-1">
                            <m.div initial={{ height: 0 }} animate={{ height: step >= 0 ? `${h}%` : 0 }} transition={{ delay: i * 0.07, duration: 0.5 }} className="w-full rounded-md bg-gradient-to-t from-[#4f46e5] to-[#b44cf0]" />
                            <span className="text-[10px] text-[#a1a1a6]">{DAYS[i]}</span>
                          </div>
                        ))}
                      </div>
                      <AnimatePresence>
                        {step === 1 && (
                          <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex items-center gap-3 rounded-xl bg-black/30 p-3">
                            <span aria-hidden="true" className="grid size-10 place-items-center rounded-lg bg-[#e2098c]/25 text-sm font-bold text-[#ff8bc9]">PDF</span>
                            <span className="min-w-0 flex-1 text-sm"><b className="block">ventas-por-dia.pdf</b><span className="text-[#a1a1a6]">Vista previa lista</span></span>
                            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black">Descargar</span>
                          </m.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <>
                      <p className="text-[15px]">Listo, revisa la venta antes de confirmar:</p>
                      <div className="mt-3 rounded-xl bg-black/30 p-3 text-sm">
                        <div className="flex justify-between"><span>2 × Camisa azul</span><b>$36,00</b></div>
                        <div className="mt-1 flex justify-between text-[#a1a1a6]"><span>Cliente: María Pérez</span><span>Pago Móvil</span></div>
                        <div className="mt-2 flex justify-between border-t border-white/15 pt-2 text-base"><b>Total</b><b>$36,00</b></div>
                      </div>
                      <AnimatePresence>
                        {step === 3 && (
                          <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-3 flex gap-2">
                            <span className="rounded-full bg-[#4f46e5] px-4 py-2 text-sm font-semibold">Confirmar y aplicar</span>
                            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">Descartar</span>
                          </m.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </m.div>
              </AnimatePresence>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-[#8e8e93]">Demostración con datos de ejemplo.</p>
        </Reveal>
      </div>
    </section>
  );
}
