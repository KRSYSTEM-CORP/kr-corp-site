"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Reveal } from "@/components/marketing/Reveal";
import { TrialBanner } from "@/components/marketing/TrialBanner";
import { FluidText } from "@/components/marketing/FluidText";
import { TextMotion } from "@/components/marketing/TextMotion";
import { SiteNavbar } from "@/components/marketing/SiteNavbar";
import { MotionTile } from "@/components/marketing/MotionTile";

// Both pull in a heavy runtime (three.js is ~720KB minified; the fluid sim
// is a big chunk of its own GLSL source) that has no reason to sit in the
// page's initial JS — the button is a hover effect and the fluid sim is
// below the fold, so both load in the background after the page is
// already interactive instead of blocking first paint.
const FluidGlassButton = dynamic(
  () => import("@/components/marketing/FluidGlassButton").then((m) => m.FluidGlassButton),
  {
    ssr: false,
    loading: () => (
      <span className="rounded-lg bg-gradient-to-r from-[#433DDD] to-[#E2098C] px-6 py-3 text-base font-semibold text-white shadow-[0_10px_30px_-10px_rgba(226,9,140,0.55)]">
        Cuéntanos tu proyecto
      </span>
    ),
  }
);
const LiquidFluidBackground = dynamic(
  () => import("@/components/marketing/LiquidFluidBackground").then((m) => m.LiquidFluidBackground),
  { ssr: false }
);

const CONTACT_PHONE = "+1 (904) 579-6156";
const CONTACT_EMAIL = "contacto@krsystem-corp.com";
const WHATSAPP_URL = `https://wa.me/${CONTACT_PHONE.replace(/[^+\d]/g, "").replace("+", "")}`;

const EASE = [0.16, 1, 0.3, 1] as const;

const products = [
  {
    name: "KR POS",
    url: "https://krpos.krsystem-corp.com",
    icon: "/product-finanzas.png",
    desktopShot: "/screenshot-finanzas-desktop.png",
    mobileShot: "/screenshot-finanzas-mobile.png",
    description:
      "Punto de venta, inventario, finanzas y facturación en un solo sistema — pensado para pymes que venden en múltiples monedas y necesitan control real de su negocio.",
  },
  {
    name: "KR Citas",
    url: "https://krcitas.krsystem-corp.com",
    icon: "/product-citas.png",
    desktopShot: "/screenshot-citas-desktop.png",
    mobileShot: "/screenshot-citas-mobile.png",
    description:
      "Agenda y reservas para negocios de servicios — control de citas, clientes, especialistas y pagos, con página pública de reservas para cada negocio.",
  },
  {
    name: "KR ChatBot",
    url: "https://krchatbot.krsystem-corp.com",
    icon: "/product-chatbot.png",
    desktopShot: "/screenshot-chatbot-desktop.png",
    mobileShot: "/screenshot-chatbot-mobile.png",
    description:
      "Bandeja compartida de WhatsApp con IA — responde, etiqueta y crea tickets sola o en modo pasivo junto a tu equipo, con automatizaciones y envíos masivos.",
  },
];

const services = [
  {
    title: "Resolución de problemas operativos",
    description:
      "Encontramos en tu día a día qué te está costando tiempo, dinero o control — ahí empieza el sistema.",
  },
  {
    title: "Construcción de sistemas a medida",
    description:
      "Software propio diseñado para cómo trabaja tu negocio, no una plantilla forzada a encajar.",
  },
  {
    title: "Consolidación de la operación",
    description:
      "Ventas, inventario, finanzas o citas en un mismo sistema, con información que por fin cuadra.",
  },
  {
    title: "Acompañamiento continuo",
    description:
      "El sistema no se entrega y se olvida: seguimos ajustándolo mientras tu negocio cambia.",
  },
];

const process = [
  {
    title: "Conversación inicial",
    description:
      "Escuchamos qué se rompe, qué se repite y qué te quita tiempo cada semana, antes de hablar de tecnología.",
  },
  {
    title: "Mapa del sistema",
    description:
      "Convertimos esas fricciones en un diseño concreto: qué datos, qué pantallas, qué reglas de negocio.",
  },
  {
    title: "Construcción en tramos",
    description:
      "Ves el sistema tomar forma en entregas cortas que puedes probar, no en una sola revelación al final.",
  },
  {
    title: "Adopción y ajuste",
    description:
      "El sistema entra en tu operación real y seguimos afinándolo con el uso, no con suposiciones.",
  },
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

const heroStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const heroItem = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0912] text-[#f3f1f9]">
      <TrialBanner />

      <SiteNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <motion.div
          initial="hidden"
          animate="show"
          variants={heroStagger}
          className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32"
        >
          <motion.span
            variants={heroItem}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-1 font-mono text-xs uppercase tracking-[0.14em] text-[#c9a6e8]"
          >
            ✦ 14 días gratis · Software · Finanzas · Citas · WhatsApp con IA
          </motion.span>
          <motion.div variants={heroItem} className="w-full max-w-4xl">
            <FluidText
              lines={[
                { text: "Cada problema de tu negocio puede ser un" },
                { text: "sistema que lo resuelve.", gradient: true },
              ]}
              headingClassName="font-heading text-4xl font-bold tracking-tight text-balance sm:text-6xl"
            />
          </motion.div>
          <motion.p variants={heroItem} className="max-w-2xl text-lg text-[#a29cbd] sm:text-xl">
            Construimos el software detrás de tu operación — ventas, inventario, finanzas o
            citas — partiendo siempre de lo mismo: qué te está costando tiempo o dinero hoy.
          </motion.p>
          <motion.div variants={heroItem} className="mt-4 flex flex-col items-center gap-3 sm:flex-row">
            <FluidGlassButton text="Cuéntanos tu proyecto" href="#contacto" baseColor="#0a0912" glassColor="#7E2AC0" />
            <motion.a
              whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.06)" }}
              whileTap={{ scale: 0.97 }}
              href="#soluciones"
              className="rounded-lg border border-white/15 px-6 py-3 text-base font-medium text-[#f3f1f9]"
            >
              Ver nuestras soluciones
            </motion.a>
          </motion.div>
        </motion.div>
      </section>

      {/* Manifiesto */}
      <section className="border-b border-white/10 px-6 py-20">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#e2098c]">
            Cómo pensamos
          </span>
          <p className="mt-5 font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            Un problema sin resolver no desaparece: se repite cada día hasta que alguien lo
            convierte en sistema.
          </p>
          <p className="mt-4 text-[#a29cbd]">
            No partimos de una plantilla ni de una lista de funciones. Partimos del problema real
            de tu operación — un inventario que no cuadra, una caja que no cierra, una agenda en
            papel — y construimos el sistema que lo resuelve de raíz. Código propio, datos tuyos,
            y un equipo que sigue construyendo contigo.
          </p>
        </Reveal>
      </section>

      {/* Servicios */}
      <section id="servicios" className="mx-auto w-full max-w-6xl px-6 py-20">
        <Reveal className="mb-12 max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#e2098c]">
            Servicios
          </span>
          <h2 aria-label="Lo que hacemos" className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance">
            <TextMotion text="Lo que hacemos" preset="rise" decorative />
          </h2>
          <p className="mt-3 text-[#a29cbd]">
            No vendemos plantillas genéricas — construimos exactamente lo que tu operación
            necesita.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <MotionTile title={s.title} description={s.description} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Sistemas Empresariales / productos destacados */}
      <section id="soluciones" className="border-y border-white/10 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mb-10 max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#e2098c]">
              Sistemas Empresariales
            </span>
            <h2
              aria-label="Sistemas ya en uso, listos para adaptarse a tu negocio"
              className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance"
            >
              <TextMotion text="Sistemas ya en uso, listos para adaptarse a tu negocio" preset="mask" decorative />
            </h2>
          </Reveal>
          <div className="flex flex-col gap-10">
            {products.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.1}>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#131020]">
                  <div className="relative border-b border-white/10 bg-[#0a0912] px-6 pt-6 pb-12 sm:px-10 sm:pt-8">
                    <div className="mx-auto max-w-xl overflow-hidden rounded-lg border border-white/10 shadow-2xl">
                      <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.04] px-3 py-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                      </div>
                      <Image
                        src={p.desktopShot}
                        alt={`${p.name} en computador`}
                        width={960}
                        height={600}
                        className="h-auto w-full"
                      />
                    </div>
                    <div className="absolute -bottom-6 right-8 w-20 overflow-hidden rounded-2xl border-4 border-[#0a0912] shadow-2xl sm:right-12 sm:w-24">
                      <Image
                        src={p.mobileShot}
                        alt={`${p.name} en móvil`}
                        width={390}
                        height={844}
                        className="h-auto w-full"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-8 p-8 sm:flex-row sm:items-center">
                    <Image
                      src={p.icon}
                      alt=""
                      width={56}
                      height={56}
                      className="h-14 w-14 shrink-0 rounded-xl"
                    />
                    <div className="flex-1">
                      <h3 className="font-heading text-xl font-semibold text-white">{p.name}</h3>
                      <p className="mt-2 text-[#a29cbd]">{p.description}</p>
                    </div>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="shrink-0">
                      <Link
                        href={p.url}
                        className="block rounded-lg bg-gradient-to-r from-[#433DDD] to-[#E2098C] px-5 py-2.5 text-sm font-medium text-white"
                      >
                        Entrar al sistema →
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Proceso */}
      <section id="proceso" className="mx-auto w-full max-w-6xl px-6 py-20">
        <Reveal className="mb-12 max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#e2098c]">
            Proceso
          </span>
          <h2 aria-label="Así construimos cada sistema" className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance">
            <TextMotion text="Así construimos cada sistema" preset="wave" decorative />
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {process.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08} className="bg-[#0a0912] p-7">
              <span className="font-heading text-3xl font-bold bg-gradient-to-r from-[#433DDD] to-[#E2098C] bg-clip-text text-transparent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-heading font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-[#a29cbd]">{step.description}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Nosotros */}
      <section id="nosotros" className="mx-auto max-w-6xl px-6 py-20">
        <Reveal className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#e2098c]">
            Nosotros
          </span>
          <h2 aria-label="Quiénes somos" className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance">
            <TextMotion text="Quiénes somos" preset="split" decorative />
          </h2>
          <p className="mt-4 text-[#a29cbd]">
            Somos un equipo enfocado en diseñar software que resuelve problemas reales de
            pequeñas y medianas empresas. Trabajamos de cerca con cada cliente para entender cómo
            opera su negocio antes de escribir una sola línea de código — el resultado es un
            sistema que se siente hecho a la medida, porque lo está.
          </p>
        </Reveal>
      </section>

      {/* Contacto */}
      <section
        id="contacto"
        className="relative overflow-hidden bg-gradient-to-br from-[#433DDD] via-[#7E2AC0] to-[#E2098C] px-6 py-20 text-white"
      >
        <LiquidFluidBackground />
        <Reveal className="relative z-10 mx-auto max-w-6xl text-center">
          <h2 aria-label="¿Tienes un proyecto en mente?" className="font-heading text-3xl font-bold tracking-tight text-balance">
            <TextMotion text="¿Tienes un proyecto en mente?" preset="curtain" decorative />
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Escríbenos y conversemos sobre qué necesita tu empresa. Tu primer sistema, con 14 días
            gratis para probarlo.
          </p>
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            {channels.map((c) => (
              <motion.a
                key={c.label}
                whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.15)" }}
                whileTap={{ scale: 0.97 }}
                href={c.href}
                target={c.label === "WhatsApp" ? "_blank" : undefined}
                rel={c.label === "WhatsApp" ? "noopener noreferrer" : undefined}
                className="flex flex-col items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-6"
              >
                {c.label === "WhatsApp" && (
                  <Image src="/whatsapp-icon.png" alt="" width={22} height={22} className="h-5 w-5" />
                )}
                <span className="font-mono text-xs uppercase tracking-wide text-white/70">
                  {c.label}
                </span>
                <span className="font-medium">{c.value}</span>
              </motion.a>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="flex flex-col items-center gap-3 border-t border-white/10 py-8 text-center text-sm text-[#6b6684]">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          <Link href="/privacidad" className="transition-colors hover:text-white">
            Política de Privacidad
          </Link>
          <Link href="/terminos" className="transition-colors hover:text-white">
            Términos y Condiciones
          </Link>
          <Link href="/cookies" className="transition-colors hover:text-white">
            Aviso de Cookies
          </Link>
        </div>
        <p>© {new Date().getFullYear()} KR System. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
