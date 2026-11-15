import { Reveal } from "@/components/marketing/Reveal";

const SIGNUP = "https://krpos.krsystem-corp.com/signup";

const PLANS = [
  { name: "Emprende", price: "$12,99", note: "Primer mes $9,99", tag: "Todo el sistema para empezar", items: ["Todos los módulos excepto Contabilidad", "1 usuario: el dueño o gerente", "Hasta 100 productos", "1 sucursal", "Learning y Asistente IA (1 crédito por consulta)"], featured: false },
  { name: "Pyme", price: "$23,99", note: "por mes", tag: "Más equipo, inventario e IA", items: ["Todo lo de Emprende", "Módulo de Contabilidad incluido", "100 créditos de Asistente IA al mes", "5 usuarios", "Hasta 500 productos y varias sucursales"], featured: true },
  { name: "Corporativo", price: "$44,99", note: "por mes", tag: "Para equipos grandes", items: ["Todo lo de Pyme", "200 créditos de Asistente IA al mes", "10 usuarios", "Productos ilimitados", "Un módulo personalizado para tu empresa, una creación por mes"], featured: false },
];

export function Plans() {
  return (
    <section id="planes" aria-label="Planes de KR POS" className="bg-black px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <p className="text-base font-semibold text-[#c9a6e8]">Planes</p>
          <h2 className="mx-auto mt-2 max-w-3xl text-balance text-[clamp(2.25rem,6vw,4.25rem)] font-bold leading-[1.05] tracking-[-0.04em]">Elige el tamaño de tu negocio.</h2>
          <p className="mx-auto mt-4 max-w-xl text-xl text-[#a1a1a6]">Precios en dólares, pagados en bolívares a la tasa BCV del día.</p>
        </Reveal>
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08} className={`relative flex flex-col rounded-[2rem] p-8 sm:p-10 ${p.featured ? "border border-[#8da2ff]/60 bg-gradient-to-b from-[#2a2470] to-[#150f33] shadow-[0_30px_100px_rgba(79,70,229,0.4)]" : "border border-white/10 bg-white/[0.04]"}`}>
              {p.featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-xs font-bold text-black">Más elegido</span>}
              <h3 className="text-2xl font-bold">{p.name}</h3>
              <p className="mt-1 text-[#a1a1a6]">{p.tag}</p>
              <p className="mt-6 text-5xl font-bold tracking-tight">{p.price}</p>
              <p className="mt-1 text-sm text-[#c9a6e8]">{p.note}</p>
              <ul className="mt-7 flex flex-1 flex-col gap-3 text-base">
                {p.items.map((it) => (
                  <li key={it} className="flex gap-3"><span aria-hidden="true" className="mt-0.5 text-[#8da2ff]">✓</span>{it}</li>
                ))}
              </ul>
              <a href={SIGNUP} className={`mt-8 rounded-full px-6 py-3 text-center text-base font-semibold transition-transform duration-150 active:scale-[0.97] ${p.featured ? "bg-white text-black" : "border border-white/30 hover:bg-white/10"}`}>
                Probar 14 días gratis
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
