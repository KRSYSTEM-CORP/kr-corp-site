"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "@/components/marketing/Reveal";

const MODULES = [
  { id: "pos", tab: "Vender", title: "Un punto de venta que no se detiene", text: "Cobra en segundos desde el teléfono o la computadora, con pagos mixtos, descuentos, cupones y ventas a crédito. Si se cae el internet sigues vendiendo y todo se sincroniza solo.", bullets: ["Bs, € y $ con la tasa BCV del día", "Cupones y descuentos con un toque", "Modo sin internet"], img: "/krpos/pos.png", alt: "Punto de venta de KR POS con productos, carrito y cobro" },
  { id: "inventario", tab: "Inventario", title: "Sabes qué tienes, siempre", text: "Productos con foto, existencias por sucursal, alertas de stock bajo y carga masiva por Excel. Las compras a proveedores suman stock solas.", bullets: ["Alertas de stock bajo", "Carga y descarga por Excel", "Traspasos entre sucursales"], img: "/krpos/inventario.png", alt: "Inventario de KR POS con existencias y alertas de stock" },
  { id: "caja", tab: "Caja Chica", title: "Abre y cierra tu caja sin sorpresas", text: "Abres el turno, registras entradas y salidas, y al cerrar cuentas el efectivo: el sistema te dice si cuadra. Cada cierre queda con su historial y su PDF.", bullets: ["Corte Z en PDF", "Conteo de efectivo y diferencia", "Historial de cierres"], img: "/krpos/caja.png", alt: "Caja Chica de KR POS con abrir caja, cerrar caja y efectivo esperado" },
  { id: "estadisticas", tab: "Estadísticas", title: "Cuánto ganas de verdad", text: "Ventas, costos, gastos y utilidad calculados con fórmulas financieras: ventas netas sin IVA, punto de equilibrio, rotación y reposición sugerida.", bullets: ["Cascada de utilidad", "Punto de equilibrio y meta", "Reposición sugerida"], img: "/krpos/estadisticas.png", alt: "Estadísticas de KR POS con cascada de utilidad y punto de equilibrio" },
  { id: "admin", tab: "Administración", title: "Tus cuentas, claras", text: "Cuentas por cobrar con antigüedad, compras que descuentan de la cuenta de origen, nómina por partes y adelantos, bancos con saldo y libros fiscales.", bullets: ["Cuentas por cobrar y abonos", "Pagos desde tus cuentas bancarias", "Nómina a tu medida"], img: "/krpos/administracion.png", alt: "Administración de KR POS con Balance, Cuentas por cobrar y Compras" },
  { id: "marketing", tab: "Marketing", title: "Haz que vuelvan", text: "Conoce a tus clientes, agrúpalos por visitas y gasto, crea promociones con código y envíalas por WhatsApp. Cuando canjean, queda registrado.", bullets: ["Mapa de clientes", "Promociones con código", "Envío por WhatsApp"], img: "/krpos/marketing.png", alt: "Marketing de KR POS con clientes y promociones" },
] as const;

export function Tour() {
  const [id, setId] = useState<(typeof MODULES)[number]["id"]>("pos");
  const m = MODULES.find((x) => x.id === id) ?? MODULES[0];
  const [dir, setDir] = useState(1);
  const pick = (next: (typeof MODULES)[number]["id"]) => {
    setDir(MODULES.findIndex((x) => x.id === next) >= MODULES.findIndex((x) => x.id === id) ? 1 : -1);
    setId(next);
  };
  return (
    <section id="recorrido" aria-label="Recorrido por KR POS" className="px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <p className="text-base font-semibold text-[#c9a6e8]">Todo en uno</p>
          <h2 className="mx-auto mt-2 max-w-4xl text-balance text-[clamp(2.25rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.04em]">
            Todo tu negocio en una sola pantalla.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-[#a1a1a6] sm:text-2xl">Toca un módulo y míralo funcionando.</p>
        </Reveal>

        <div role="tablist" aria-label="Módulos de KR POS" className="mx-auto mt-10 flex max-w-full gap-2 overflow-x-auto pb-2 sm:justify-center">
          {MODULES.map((x) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={id === x.id}
              onClick={() => pick(x.id)}
              className={`shrink-0 rounded-full px-5 py-2.5 text-base font-semibold transition-colors ${id === x.id ? "bg-white text-black" : "bg-white/[0.08] text-[#d2d2d7] hover:bg-white/15"}`}
            >
              {x.tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={m.id}
            initial={{ opacity: 0, x: 70 * dir, scale: 0.97, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -70 * dir, scale: 0.97, filter: "blur(8px)" }}
            transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
            className="mt-10 grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
          >
            <div>
              <h3 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{m.title}</h3>
              <p className="mt-4 text-lg leading-snug text-[#a1a1a6] sm:text-xl">{m.text}</p>
              <ul className="mt-6 flex flex-col gap-2.5">
                {m.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-lg">
                    <span aria-hidden="true" className="grid size-6 place-items-center rounded-full bg-[#433ddd]/30 text-sm text-[#a8a4ff]">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#131020] shadow-[0_40px_120px_rgba(67,61,221,0.35)]">
              <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.05] px-3.5 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              </div>
              <Image src={m.img} alt={m.alt} width={1440} height={900} sizes="(min-width: 1024px) 700px, 100vw" className="h-auto w-full" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
