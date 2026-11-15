import Image from "next/image";
import { Reveal } from "@/components/marketing/Reveal";

const FEATURES = [
  { title: "Bs · € · $", text: "Cobra y reporta en varias monedas con la tasa BCV del día, y la tasa se actualiza sola." },
  { title: "Funciona sin internet", text: "Si se cae la conexión sigues vendiendo; todo se sincroniza al volver." },
  { title: "Cierre de caja que cuadra", text: "Cuentas el efectivo, ves el faltante o sobrante y guardas el Corte Z en PDF." },
  { title: "Cuentas por cobrar", text: "Quién te debe, desde cuándo y cuánto, con abonos en segundos." },
  { title: "Compras y proveedores", text: "Registra compras, elige de qué cuenta sale el dinero y se descuenta del banco." },
  { title: "Nómina a tu medida", text: "Tú decides cuánto, cuándo y desde qué cuenta; paga por partes o adelanta." },
  { title: "Varias sucursales", text: "Cada sede con su inventario y su caja, y una vista de toda tu red." },
  { title: "Learning en el sistema", text: "Videos cortos de 59 segundos que enseñan cada módulo, para ti y tu equipo." },
  { title: "Datos fiscales y facturación", text: "IVA, libros de ventas y compras, notas de entrega y documentos listos para imprimir." },
];

export function Features() {
  return (
    <section id="funciones" aria-label="Funciones de KR POS" className="bg-[#0a0a0d] px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-base font-semibold text-[#c9a6e8]">Pensado para tu día a día</p>
          <h2 className="mt-2 max-w-3xl text-balance text-[clamp(2.25rem,6vw,4.25rem)] font-bold leading-[1.05] tracking-[-0.04em]">Nada que no necesites. Todo lo que sí.</h2>
        </Reveal>
        <div className="mt-14 grid gap-x-12 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.05} className="border-t border-white/15 pt-5">
              <h3 className="text-xl font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-lg leading-snug text-[#a1a1a6]">{f.text}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="mx-auto mt-20 max-w-xs">
          <div className="overflow-hidden rounded-[2rem] border-[6px] border-[#1c1a2b] shadow-[0_40px_100px_rgba(67,61,221,0.4)]">
            <Image src="/krpos/movil-inicio.png" alt="Inicio de KR POS en el teléfono" width={390} height={844} sizes="320px" className="h-auto w-full" />
          </div>
          <p className="mt-4 text-center text-sm text-[#a1a1a6]">También en tu teléfono, como una app.</p>
        </Reveal>
      </div>
    </section>
  );
}
