import Image from "next/image";
import Link from "next/link";
import { HeroParticles } from "@/components/marketing/HeroParticles";
import { RevealOnScroll } from "@/components/marketing/RevealOnScroll";

const CONTACT_PHONE = "+1 (904) 579-6156";
const CONTACT_EMAIL = "contacto@krsystem-corp.com";
const WHATSAPP_URL = `https://wa.me/${CONTACT_PHONE.replace(/[^+\d]/g, "").replace("+", "")}`;

const products = [
  {
    name: "App Finanzas",
    url: "https://appfinanzas.krsystem-corp.com",
    icon: "/product-finanzas.png",
    description:
      "Punto de venta, inventario, finanzas y facturación en un solo sistema — pensado para pymes que venden en múltiples monedas y necesitan control real de su negocio.",
  },
  {
    name: "App Citas",
    url: "https://appcitas.krsystem-corp.com",
    icon: "/product-citas.png",
    description:
      "Agenda y reservas para negocios de servicios — control de citas, clientes, especialistas y pagos, con página pública de reservas para cada negocio.",
  },
];

const services = [
  {
    title: "Apps a medida",
    description:
      "Aplicaciones web y móviles diseñadas específicamente para cómo trabaja tu negocio, no al revés.",
  },
  {
    title: "Sistemas de gestión",
    description:
      "Ventas, inventario, finanzas y contabilidad en un solo sistema, con respaldo de base de datos real.",
  },
  {
    title: "Automatización",
    description:
      "Reportes, facturación y procesos repetitivos resueltos con software, no con hojas de cálculo.",
  },
  {
    title: "Soporte y evolución",
    description:
      "Tu sistema crece contigo — seguimos agregando funciones a medida que tu empresa lo necesita.",
  },
];

const process = [
  {
    title: "Diagnóstico",
    description: "Entendemos cómo opera tu negocio hoy: qué se resuelve con software y qué no.",
  },
  {
    title: "Arquitectura",
    description: "Diseñamos el sistema y sus datos antes de escribir la primera línea de código.",
  },
  {
    title: "Build",
    description: "Desarrollo iterativo, con entregas que puedes ver, probar y usar desde temprano.",
  },
  {
    title: "Entrega y soporte",
    description: "El sistema queda operando en tu negocio, y seguimos evolucionándolo contigo.",
  },
];

const capabilities = [
  "VES · USD · EUR",
  "Tasa BCV automática",
  "Pago Móvil",
  "Binance Pay",
  "IVA y control fiscal",
  "Offline-first",
  "Multi-sucursal",
];

const channels = [
  {
    label: "WhatsApp",
    value: CONTACT_PHONE,
    href: WHATSAPP_URL,
  },
  {
    label: "Correo",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
  },
  {
    label: "Teléfono",
    value: CONTACT_PHONE,
    href: `tel:${CONTACT_PHONE.replace(/[^+\d]/g, "")}`,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0912] text-[#f3f1f9]">
      <RevealOnScroll />

      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0a0912]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Image src="/logo.png" alt="KR System" width={28} height={30} className="h-7 w-auto" />
            KR{" "}
            <span className="bg-gradient-to-r from-[#433DDD] to-[#E2098C] bg-clip-text text-transparent">
              SYSTEM
            </span>
          </span>
          <nav className="hidden gap-7 text-sm font-medium text-[#a29cbd] lg:flex">
            <a href="#servicios" className="transition-colors hover:text-white">
              Servicios
            </a>
            <a href="#soluciones" className="transition-colors hover:text-white">
              Sistemas Empresariales
            </a>
            <a href="#proceso" className="transition-colors hover:text-white">
              Proceso
            </a>
            <a href="#capacidad" className="transition-colors hover:text-white">
              Capacidad
            </a>
            <a href="#nosotros" className="transition-colors hover:text-white">
              Nosotros
            </a>
            <a href="#contacto" className="transition-colors hover:text-white">
              Contacto
            </a>
          </nav>
          <a
            href="#contacto"
            className="rounded-lg bg-gradient-to-r from-[#433DDD] to-[#E2098C] px-4 py-2 text-sm font-medium text-white shadow-[0_8px_24px_-10px_rgba(226,9,140,0.6)] transition-opacity hover:opacity-90"
          >
            Hablemos
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <HeroParticles />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
          <span
            className="load-in rounded-full border border-white/10 bg-white/5 px-4 py-1 font-mono text-xs uppercase tracking-[0.14em] text-[#c9a6e8]"
            style={{ animationDelay: "0ms" }}
          >
            Software · Finanzas · Citas · Automatización
          </span>
          <h1
            className="load-in max-w-3xl text-4xl font-extrabold tracking-tight text-balance sm:text-6xl"
            style={{ animationDelay: "120ms" }}
          >
            Sistemas que se manejan{" "}
            <span className="bg-gradient-to-r from-[#433DDD] via-[#7E2AC0] to-[#E2098C] bg-clip-text text-transparent">
              solos.
            </span>
          </h1>
          <p
            className="load-in max-w-2xl text-lg text-[#a29cbd] sm:text-xl"
            style={{ animationDelay: "240ms" }}
          >
            Diseñamos el sistema central de tu operación — ventas, inventario, finanzas o
            citas — y nos quedamos hasta que corre sin ti.
          </p>
          <div className="load-in mt-4 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "360ms" }}>
            <a
              href="#contacto"
              className="rounded-lg bg-gradient-to-r from-[#433DDD] to-[#E2098C] px-6 py-3 text-base font-semibold text-white shadow-[0_10px_30px_-10px_rgba(226,9,140,0.55)] transition-opacity hover:opacity-90"
            >
              Cuéntanos tu proyecto
            </a>
            <a
              href="#soluciones"
              className="rounded-lg border border-white/15 px-6 py-3 text-base font-medium text-[#f3f1f9] transition-colors hover:bg-white/5"
            >
              Ver nuestras soluciones
            </a>
          </div>
        </div>
      </section>

      {/* Manifiesto */}
      <section className="border-b border-white/10 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#e2098c]">
            Manifiesto
          </span>
          <p className="mt-5 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            El mejor sistema es el que dejas de notar.
          </p>
          <p className="mt-4 text-[#a29cbd]">
            No vendemos proyectos: construimos sistemas que se vuelven parte invisible de cómo
            opera tu negocio. Código propio, control en tus manos, y un equipo que sigue ahí
            cuando el sistema necesita crecer.
          </p>
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="reveal mb-12 max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#e2098c]">
            Servicios
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance">
            Lo que hacemos
          </h2>
          <p className="mt-3 text-[#a29cbd]">
            No vendemos plantillas genéricas — construimos exactamente lo que tu operación
            necesita.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <div
              key={s.title}
              className="reveal rounded-xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/20"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <h3 className="font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-[#a29cbd]">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sistemas Empresariales / productos destacados */}
      <section id="soluciones" className="border-y border-white/10 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="reveal mb-10 max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#e2098c]">
              Sistemas Empresariales
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance">
              Sistemas ya en uso, listos para adaptarse a tu negocio
            </h2>
          </div>
          <div className="flex flex-col gap-6">
            {products.map((p) => (
              <div
                key={p.name}
                className="reveal flex flex-col items-start gap-8 rounded-2xl border border-white/10 bg-[#131020] p-8 sm:flex-row sm:items-center"
              >
                <Image
                  src={p.icon}
                  alt=""
                  width={56}
                  height={56}
                  className="h-14 w-14 shrink-0 rounded-xl"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white">{p.name}</h3>
                  <p className="mt-2 text-[#a29cbd]">{p.description}</p>
                </div>
                <Link
                  href={p.url}
                  className="shrink-0 rounded-lg bg-gradient-to-r from-[#433DDD] to-[#E2098C] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Entrar al sistema →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proceso */}
      <section id="proceso" className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="reveal mb-12 max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#e2098c]">
            Proceso
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance">
            Cómo es un build con nosotros
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {process.map((step, i) => (
            <div key={step.title} className="reveal bg-[#0a0912] p-7">
              <span className="font-mono text-3xl font-bold bg-gradient-to-r from-[#433DDD] to-[#E2098C] bg-clip-text text-transparent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-[#a29cbd]">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Capacidad especializada */}
      <section id="capacidad" className="border-y border-white/10 bg-white/[0.02] px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <span className="reveal font-mono text-xs uppercase tracking-[0.14em] text-[#e2098c]">
            Capacidad especializada
          </span>
          <h2 className="reveal mt-3 text-3xl font-bold tracking-tight text-balance">
            Software financiero pensado para Latinoamérica
          </h2>
          <p className="reveal mt-4 max-w-2xl text-[#a29cbd]">
            La mayoría del software de gestión asume una sola moneda y un solo método de pago.
            El nuestro nació resolviendo lo contrario: negocios que cobran en bolívares, dólares
            y euros el mismo día, con una tasa que cambia, y que necesitan seguir vendiendo
            aunque se caiga el internet.
          </p>
          <div className="reveal mt-8 flex flex-wrap gap-3">
            {capabilities.map((c) => (
              <span
                key={c}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-xs uppercase tracking-wide text-[#c9a6e8]"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Nosotros */}
      <section id="nosotros" className="mx-auto max-w-6xl px-6 py-20">
        <div className="reveal max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#e2098c]">
            Nosotros
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance">Quiénes somos</h2>
          <p className="mt-4 text-[#a29cbd]">
            Somos un equipo enfocado en diseñar software que resuelve problemas reales de
            pequeñas y medianas empresas. Trabajamos de cerca con cada cliente para entender cómo
            opera su negocio antes de escribir una sola línea de código — el resultado es un
            sistema que se siente hecho a la medida, porque lo está.
          </p>
        </div>
      </section>

      {/* Contacto */}
      <section
        id="contacto"
        className="bg-gradient-to-br from-[#433DDD] via-[#7E2AC0] to-[#E2098C] px-6 py-20 text-white"
      >
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-balance">
            ¿Tienes un proyecto en mente?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Escríbenos y conversemos sobre qué necesita tu empresa.
          </p>
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            {channels.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.label === "WhatsApp" ? "_blank" : undefined}
                rel={c.label === "WhatsApp" ? "noopener noreferrer" : undefined}
                className="flex flex-col items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-6 transition-colors hover:bg-white/15"
              >
                {c.label === "WhatsApp" && (
                  <Image src="/whatsapp-icon.png" alt="" width={22} height={22} className="h-5 w-5" />
                )}
                <span className="font-mono text-xs uppercase tracking-wide text-white/70">
                  {c.label}
                </span>
                <span className="font-medium">{c.value}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-sm text-[#6b6684]">
        © {new Date().getFullYear()} KR System. Todos los derechos reservados.
      </footer>
    </div>
  );
}
