import { ContactForm } from "@/components/marketing/ContactForm";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/marketing/Reveal";


const GRAD_TEXT = "bg-gradient-to-r from-[#6c6bff] via-[#b44cf0] to-[#ff3da0] bg-clip-text text-transparent";

/* ───────────────────────────── Afirmación ───────────────────────────── */

export function PageHeader({ eyebrow, title, text }: { eyebrow: string; title: React.ReactNode; text: string }) {
  return (
    <section className="px-5 pb-6 pt-20 sm:pt-28">
      <Reveal className="mx-auto max-w-6xl">
        <p className="text-base font-semibold text-[#c9a6e8]">{eyebrow}</p>
        <h1 className="mt-2 max-w-4xl text-balance text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[1.03] tracking-[-0.045em]">{title}</h1>
        <p className="mt-5 max-w-2xl text-xl text-[#a1a1a6]">{text}</p>
      </Reveal>
    </section>
  );
}

export function Statement() {
  return (
    <section id="nosotros" className="px-5 py-20 sm:py-28">
      <Reveal className="mx-auto max-w-4xl text-center">
        <p className="text-base font-semibold text-[#c9a6e8]">Cómo pensamos</p>
        <p className="mt-4 text-balance text-[clamp(1.9rem,5vw,3.6rem)] font-bold leading-[1.08] tracking-[-0.035em]">
          Un problema sin resolver no desaparece: se repite cada día hasta que alguien lo convierte en{" "}
          <span className={GRAD_TEXT}>sistema.</span>
        </p>
        <p className="mx-auto mt-8 max-w-2xl text-balance text-lg leading-relaxed text-[#a1a1a6] sm:text-xl">
          No partimos de una plantilla ni de una lista de funciones. Partimos del problema real de tu operación — un
          inventario que no cuadra, una caja que no cierra, una agenda en papel — y construimos el sistema que lo
          resuelve de raíz. Código propio, datos tuyos, y un equipo que sigue construyendo contigo.
        </p>
      </Reveal>
    </section>
  );
}

/* ───────────────────────────── Lo que hacemos ───────────────────────────── */

const SERVICES = [
  {
    title: "Resolución de problemas operativos",
    description: "Encontramos en tu día a día qué te está costando tiempo, dinero o control — ahí empieza el sistema.",
  },
  {
    title: "Construcción de sistemas a medida",
    description: "Software propio diseñado para cómo trabaja tu negocio, no una plantilla forzada a encajar.",
  },
  {
    title: "Consolidación de la operación",
    description: "Ventas, inventario, finanzas o citas en un mismo sistema, con información que por fin cuadra.",
  },
  {
    title: "Acompañamiento continuo",
    description: "El sistema no se entrega y se olvida: seguimos ajustándolo mientras tu negocio cambia.",
  },
];

export function WhatWeDo() {
  return (
    <section id="servicios" className="px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-base font-semibold text-[#c9a6e8]">Servicios</p>
          <h2 className="mt-2 max-w-3xl text-balance text-[clamp(2.25rem,6vw,4.25rem)] font-bold leading-[1.05] tracking-[-0.04em]">
            Lo que hacemos.
          </h2>
          <p className="mt-4 max-w-xl text-xl text-[#a1a1a6]">
            No vendemos plantillas genéricas — construimos exactamente lo que tu operación necesita.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06} className="border-t border-white/15 pt-6">
              <h3 className="text-2xl font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-2 max-w-md text-lg leading-snug text-[#a1a1a6]">{s.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────────── Sistemas ───────────────────────────────── */

const SYSTEMS = [
  {
    name: "KR POS",
    url: "https://krpos.krsystem-corp.com",
    icon: "/product-finanzas.png",
    description:
      "Punto de venta, inventario, finanzas y facturación en un solo sistema — pensado para pymes que venden en múltiples monedas y necesitan control real de su negocio.",
  },
  {
    name: "KR Citas",
    url: "https://krcitas.krsystem-corp.com",
    icon: "/product-citas.png",
    description:
      "Agenda y reservas para negocios de servicios — control de citas, clientes, especialistas y pagos, con página pública de reservas para cada negocio.",
  },
];

export function Systems() {
  return (
    <section id="sistemas" className="border-t border-white/10 px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="max-w-3xl text-balance text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.04em]">
            Ya en uso, listos para adaptarse a tu negocio.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {SYSTEMS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08} className="flex flex-col rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 sm:p-10">
              <Image src={p.icon} alt="" width={64} height={64} className="h-16 w-16 rounded-2xl" />
              <h3 className="mt-6 text-3xl font-bold tracking-tight">{p.name}</h3>
              <p className="mt-3 flex-1 text-lg leading-snug text-[#a1a1a6]">{p.description}</p>
              <Link
                href={p.url}
                className="mt-8 inline-flex w-fit items-center rounded-full bg-white px-6 py-2.5 text-base font-medium text-black transition-transform duration-150 ease-out active:scale-[0.97] pointer-coarse:py-3.5"
              >
                Entrar al sistema <span aria-hidden="true" className="ml-1">→</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Desarrollo web corporativo ─────────────────────────── */

const WEB_FEATURES = [
  { title: "Tu empresa, bien presentada", description: "Una página web rápida y elegante que explica qué haces, transmite confianza y funciona perfecto en el teléfono." },
  { title: "Se encuentra en Google", description: "Estructura, velocidad y textos pensados para que tus clientes te encuentren cuando te buscan." },
  { title: "Formularios y WhatsApp", description: "Contacto directo, cotizaciones y botones de WhatsApp que convierten visitas en conversaciones." },
  { title: "Panel para tu equipo", description: "Cambia textos, fotos, servicios y novedades tú mismo, sin depender de nadie para cada ajuste." },
  { title: "Conectada a tus sistemas", description: "Catálogo, citas, resultados o pagos conectados con tu operación: la web trabaja por ti." },
  { title: "Correos y campañas", description: "Base de contactos, envíos masivos con tu imagen y enlace de baja en cada mensaje." },
  { title: "Seguridad y soporte", description: "Protección contra bots, claves de acceso al panel y acompañamiento después de publicar." },
  { title: "Tu dominio, tu marca", description: "Dominio propio, correos con tu nombre y un diseño hecho a la medida de tu identidad." },
];

export function CorporateWeb() {
  return (
    <section id="desarrollo-web" className="px-5 pb-24 pt-16 sm:pb-32 sm:pt-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-base font-semibold text-[#c9a6e8]">Desarrollo web corporativo</p>
          <h1 className="mt-2 max-w-4xl text-balance text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[1.03] tracking-[-0.045em]">
            La página web que tu empresa <span className={GRAD_TEXT}>merece.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-xl text-[#a1a1a6]">
            Diseñamos y desarrollamos sitios web corporativos para empresas de cualquier sector: profesionales, rápidos y conectados con la forma en que trabajas.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {WEB_FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 4) * 0.05} className="border-t border-white/15 pt-6">
              <h3 className="text-xl font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-base leading-snug text-[#a1a1a6]">{f.description}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-14 flex flex-col items-start gap-5 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#a1a1a6]">Caso real</p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Laboratorio Clínico Planet</h3>
            <p className="mt-2 max-w-xl text-lg leading-snug text-[#a1a1a6]">
              Su página web corporativa, su portal para clientes y su envío de correos fueron desarrollados por KR System.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="https://laboratorioplanet.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full bg-white px-6 py-2.5 text-base font-medium text-black transition-transform duration-150 ease-out active:scale-[0.97]">
              Ver la página <span aria-hidden="true" className="ml-1">→</span>
            </a>
            <Link href="/contacto" className="inline-flex items-center rounded-full border border-white/30 px-6 py-2.5 text-base font-medium transition-colors hover:bg-white/10">
              Quiero una para mi empresa
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────────────────────────────── Proceso ───────────────────────────────── */

const PROCESS = [
  {
    title: "Conversación inicial",
    description: "Escuchamos qué se rompe, qué se repite y qué te quita tiempo cada semana, antes de hablar de tecnología.",
  },
  {
    title: "Mapa del sistema",
    description: "Convertimos esas fricciones en un diseño concreto: qué datos, qué pantallas, qué reglas de negocio.",
  },
  {
    title: "Construcción en tramos",
    description: "Ves el sistema tomar forma en entregas cortas que puedes probar, no en una sola revelación al final.",
  },
  {
    title: "Adopción y ajuste",
    description: "El sistema entra en tu operación real y seguimos afinándolo con el uso, no con suposiciones.",
  },
];

export function Process() {
  return (
    <section id="proceso" className="px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-base font-semibold text-[#c9a6e8]">Proceso</p>
          <h2 className="mt-2 max-w-3xl text-balance text-[clamp(2.25rem,6vw,4.25rem)] font-bold leading-[1.05] tracking-[-0.04em]">
            Así construimos cada sistema.
          </h2>
        </Reveal>
        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.07}>
              <li className="list-none">
                <span className="text-6xl font-bold tracking-tighter text-[#8da2ff]" aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className="mt-3 text-xl font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-base leading-snug text-[#a1a1a6]">{s.description}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ───────────────────────────── Contacto + pie ───────────────────────────── */

export function Contact() {
  return (
    <section
      id="contacto"
      className="relative overflow-hidden px-5 pb-24 pt-28 text-center sm:pt-36"
      style={{
        backgroundColor: "#1a0f3a",
        backgroundImage:
          "radial-gradient(50% 70% at 15% 20%, rgba(67,61,221,0.9), transparent 70%), radial-gradient(45% 70% at 90% 85%, rgba(226,9,140,0.85), transparent 70%), radial-gradient(40% 60% at 55% 55%, rgba(126,42,192,0.9), transparent 75%)",
      }}
    >
      <Reveal className="mx-auto max-w-4xl">
        <h1 className="text-[clamp(3rem,9vw,6rem)] font-bold leading-[1.02] tracking-[-0.045em]">¿Hablamos?</h1>
        <p className="mx-auto mt-5 max-w-xl text-balance text-xl text-white/85 sm:text-2xl">
          Cuéntanos qué necesita tu empresa: un sistema a la medida, tu página web corporativa o KR POS para tu negocio.
        </p>
      </Reveal>
      <Reveal delay={0.1} className="mx-auto mt-12 max-w-xl">
        <ContactForm />
      </Reveal>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="flex flex-col items-center gap-3 border-t border-white/10 px-5 py-10 text-center text-sm text-[#6e6e73]">
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-1">
        <Link href="/" className="inline-block transition-colors hover:text-white pointer-coarse:py-3">KR POS</Link>
        <Link href="/contacto" className="inline-block transition-colors hover:text-white pointer-coarse:py-3">Contacto</Link>
        <Link href="/privacidad" className="inline-block transition-colors hover:text-white pointer-coarse:py-3">
          Política de Privacidad
        </Link>
        <Link href="/terminos" className="inline-block transition-colors hover:text-white pointer-coarse:py-3">
          Términos y Condiciones
        </Link>
        <Link href="/cookies" className="inline-block transition-colors hover:text-white pointer-coarse:py-3">
          Aviso de Cookies
        </Link>
        <Link href="/admin" rel="nofollow" className="inline-block transition-colors hover:text-white pointer-coarse:py-3">
          Acceso del equipo
        </Link>
      </div>
      <p>© {new Date().getFullYear()} KR System. Todos los derechos reservados.</p>
    </footer>
  );
}
