import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/marketing/Reveal";

const CONTACT_PHONE = "+1 (904) 579-6156";
const CONTACT_EMAIL = "contacto@krsystem-corp.com";
const WHATSAPP_URL = `https://wa.me/${CONTACT_PHONE.replace(/[^+\d]/g, "").replace("+", "")}`;

const GRAD_TEXT = "bg-gradient-to-r from-[#6c6bff] via-[#b44cf0] to-[#ff3da0] bg-clip-text text-transparent";

/* ───────────────────────────── Afirmación ───────────────────────────── */

export function Statement() {
  return (
    <section id="nosotros" className="bg-black px-5 py-28 sm:py-40">
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

/* ─────────────────────────── Cuadrícula de funciones ─────────────────────────── */

function Pill({ children, tone = "light" }: { children: React.ReactNode; tone?: "light" | "dark" | "warn" | "ok" }) {
  const tones = {
    light: "bg-white/15 text-white border-white/25",
    dark: "bg-[#f2f2f7] text-[#1d1d1f] border-[#e3e3e8]",
    warn: "bg-[#fdf1dc] text-[#9a5b00] border-[#f3dcae]",
    ok: "bg-[#e3f6ea] text-[#1d7a45] border-[#c5ebd2]",
  };
  return <span className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold ${tones[tone]}`}>{children}</span>;
}

function Tile({
  className = "",
  tone = "light",
  title,
  children,
  delay = 0,
}: {
  className?: string;
  tone?: "light" | "dark" | "brand";
  title: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  const tones = {
    light: "bg-white text-[#1d1d1f]",
    dark: "bg-[#0b0b0f] text-white",
    brand: "bg-gradient-to-br from-[#433DDD] via-[#7E2AC0] to-[#E2098C] text-white",
  };
  return (
    <Reveal delay={delay} className={`relative overflow-hidden rounded-[2rem] p-8 sm:p-9 ${tones[tone]} ${className}`}>
      <h3 className="text-balance text-[1.7rem] font-bold leading-[1.1] tracking-[-0.03em] sm:text-[2rem]">{title}</h3>
      {children}
    </Reveal>
  );
}

export function FeatureBento() {
  return (
    <section id="funciones" className="bg-[#f5f5f7] px-5 py-24 text-[#1d1d1f] sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <h2 className="text-balance text-[clamp(2.25rem,6vw,4.75rem)] font-bold leading-[1.04] tracking-[-0.04em]">
            Todo lo que tu negocio necesita.
            <br />
            Nada que no.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-xl text-[#6e6e73] sm:text-2xl">
            Un solo sistema, en cualquier pantalla y en las monedas que usas.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:mt-16 lg:grid-cols-12 lg:auto-rows-[300px]">
          <Tile tone="dark" className="lg:col-span-7 lg:row-span-2" title="Punto de venta que no se detiene.">
            <p className="mt-3 max-w-md text-lg leading-snug text-[#a1a1a6]">
              Cobra desde el teléfono o la computadora. Si se cae el internet, sigues vendiendo y todo se sincroniza solo
              al volver.
            </p>
            {/* Illustrative cart, not live data */}
            <div
              aria-hidden="true"
              className="mx-auto mt-8 w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur lg:absolute lg:bottom-8 lg:right-8 lg:mt-0 lg:w-[330px]"
            >
              <div className="flex items-center justify-between text-sm text-[#a1a1a6]">
                <span>Carrito</span>
                <span>3 artículos</span>
              </div>
              <div className="mt-3 space-y-2 text-white">
                {["Playera básica", "Gorra ajustable", "Calcetines (par)"].map((n) => (
                  <div key={n} className="flex items-center justify-between rounded-xl bg-white/[0.07] px-3 py-2 text-sm">
                    <span>{n}</span>
                    <span className="tabular-nums text-[#a1a1a6]">× 1</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-full bg-gradient-to-r from-[#4f46e5] to-[#9333ea] py-2.5 text-center text-base font-semibold text-white">
                Completar venta
              </div>
            </div>
          </Tile>

          <Tile tone="brand" className="lg:col-span-5" title="Bs. · € · $" delay={0.05}>
            <p className="mt-3 max-w-xs text-lg leading-snug text-white/85">
              Cobra y reporta en varias monedas con la tasa del día.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Pill>Bolívares</Pill>
              <Pill>Euros</Pill>
              <Pill>Dólares</Pill>
            </div>
          </Tile>

          <Tile className="lg:col-span-5" title="Cierre de caja sin sorpresas." delay={0.1}>
            <p className="mt-3 max-w-xs text-lg leading-snug text-[#6e6e73]">Cada día cuadra, con su historial y su PDF.</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Pill tone="ok">Efectivo ✓</Pill>
              <Pill tone="ok">Transferencia ✓</Pill>
              <Pill tone="ok">Punto de venta ✓</Pill>
            </div>
          </Tile>

          <Tile className="lg:col-span-4" title="Inventario al día." delay={0.05}>
            <p className="mt-3 max-w-xs text-lg leading-snug text-[#6e6e73]">
              Alertas de stock bajo y compras a proveedores que suman stock solas.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Pill tone="ok">En stock</Pill>
              <Pill tone="warn">Stock bajo</Pill>
            </div>
          </Tile>

          <Tile className="lg:col-span-4" title="Cuentas por cobrar." delay={0.1}>
            <p className="mt-3 max-w-xs text-lg leading-snug text-[#6e6e73]">
              Quién te debe, desde cuándo y cuánto. Registra abonos en segundos.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Pill tone="warn">A crédito</Pill>
              <Pill tone="dark">Abono parcial</Pill>
            </div>
          </Tile>

          <Tile tone="dark" className="lg:col-span-4" title="Hecho a tu medida." delay={0.15}>
            <p className="mt-3 max-w-xs text-lg leading-snug text-[#a1a1a6]">
              No es una plantilla: lo ajustamos a cómo opera tu negocio.
            </p>
          </Tile>
        </div>
      </div>
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
    <section id="servicios" className="bg-black px-5 py-24 sm:py-32">
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
    <section id="sistemas" className="border-t border-white/10 bg-[#0a0a0d] px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-base font-semibold text-[#c9a6e8]">Sistemas empresariales</p>
          <h2 className="mt-2 max-w-3xl text-balance text-[clamp(2.25rem,6vw,4.25rem)] font-bold leading-[1.05] tracking-[-0.04em]">
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
    <section id="proceso" className="bg-black px-5 py-24 sm:py-32">
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

const CHANNELS = [
  { label: "WhatsApp", value: CONTACT_PHONE, href: WHATSAPP_URL, external: true },
  { label: "Correo", value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, external: false },
  { label: "Teléfono", value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE.replace(/[^+\d]/g, "")}`, external: false },
];

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
        <h2 className="text-[clamp(3rem,9vw,6rem)] font-bold leading-[1.02] tracking-[-0.045em]">¿Hablamos?</h2>
        <p className="mx-auto mt-5 max-w-xl text-balance text-xl text-white/85 sm:text-2xl">
          Cuéntanos qué necesita tu empresa. Tu primer sistema, con 14 días gratis para probarlo.
        </p>
      </Reveal>
      <div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-3">
        {CHANNELS.map((c, i) => (
          <Reveal key={c.label} delay={i * 0.06}>
            <a
              href={c.href}
              target={c.external ? "_blank" : undefined}
              rel={c.external ? "noopener noreferrer" : undefined}
              className="flex h-full flex-col items-center justify-center gap-2 rounded-3xl border border-white/30 bg-white/[0.13] px-5 py-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-xl transition-transform duration-150 ease-out hover:bg-white/[0.18] active:scale-[0.98] [@media(prefers-reduced-transparency:reduce)]:bg-[#3a2a7a] [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none"
            >
              {c.label === "WhatsApp" && (
                <Image src="/whatsapp-icon.png" alt="" width={22} height={22} className="h-5 w-5" />
              )}
              <span className="font-mono text-xs uppercase tracking-[0.12em] text-white/70">{c.label}</span>
              <span className="break-all text-lg font-semibold tracking-tight">{c.value}</span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="flex flex-col items-center gap-3 border-t border-white/10 bg-black px-5 py-10 text-center text-sm text-[#6e6e73]">
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-1">
        <Link href="/privacidad" className="inline-block transition-colors hover:text-white pointer-coarse:py-3">
          Política de Privacidad
        </Link>
        <Link href="/terminos" className="inline-block transition-colors hover:text-white pointer-coarse:py-3">
          Términos y Condiciones
        </Link>
        <Link href="/cookies" className="inline-block transition-colors hover:text-white pointer-coarse:py-3">
          Aviso de Cookies
        </Link>
      </div>
      <p>© {new Date().getFullYear()} KR System. Todos los derechos reservados.</p>
    </footer>
  );
}
