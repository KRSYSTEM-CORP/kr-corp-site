import Link from "next/link";

const APP_URL = "https://appfinanzas.krsystem-corp.com";
const CONTACT_PHONE = "+1 (904) 579-6156";
const CONTACT_EMAIL = "contacto@krsystem-corp.com";

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

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      {/* Nav */}
      {/* auto-deploy test: 2026-07-30 */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight">
            KR<span className="text-blue-600"> SYSTEM</span>
          </span>
          <nav className="hidden gap-8 text-sm font-medium text-slate-600 sm:flex">
            <a href="#servicios" className="hover:text-slate-900">
              Servicios
            </a>
            <a href="#soluciones" className="hover:text-slate-900">
              Soluciones
            </a>
            <a href="#nosotros" className="hover:text-slate-900">
              Nosotros
            </a>
            <a href="#contacto" className="hover:text-slate-900">
              Contacto
            </a>
          </nav>
          <a
            href="#contacto"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Hablemos
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
          <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700">
            Diseño de apps y sistemas de software
          </span>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Sistemas a medida para que tu empresa deje de improvisar
          </h1>
          <p className="max-w-2xl text-lg text-slate-600 sm:text-xl">
            Diseñamos y desarrollamos aplicaciones y sistemas de gestión para pequeñas y medianas
            empresas — ventas, inventario, finanzas y todo lo demás, en un solo lugar.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <a
              href="#contacto"
              className="rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700"
            >
              Cuéntanos tu proyecto
            </a>
            <a
              href="#soluciones"
              className="rounded-lg border border-slate-300 px-6 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Ver nuestras soluciones
            </a>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight">Lo que hacemos</h2>
          <p className="mt-3 text-slate-600">
            No vendemos plantillas genéricas — construimos exactamente lo que tu operación
            necesita.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <div
              key={s.title}
              className="rounded-xl border border-slate-200 p-6 transition-shadow hover:shadow-md"
            >
              <h3 className="font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Soluciones / producto destacado */}
      <section id="soluciones" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">Nuestras soluciones</h2>
            <p className="mt-3 text-slate-600">
              Sistemas ya en uso por empresas reales, listos para adaptarse a la tuya.
            </p>
          </div>
          <div className="flex flex-col items-start gap-8 rounded-2xl border border-slate-200 bg-white p-8 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">
              KR
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-slate-900">App Finanzas</h3>
              <p className="mt-2 text-slate-600">
                Punto de venta, inventario, finanzas y facturación en un solo sistema — pensado
                para pymes que venden en múltiples monedas y necesitan control real de su
                negocio.
              </p>
            </div>
            <Link
              href={APP_URL}
              className="shrink-0 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Entrar al sistema →
            </Link>
          </div>
        </div>
      </section>

      {/* Nosotros */}
      <section id="nosotros" className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight">Quiénes somos</h2>
          <p className="mt-4 text-slate-600">
            Somos un equipo enfocado en diseñar software que resuelve problemas reales de
            pequeñas y medianas empresas. Trabajamos de cerca con cada cliente para entender cómo
            opera su negocio antes de escribir una sola línea de código — el resultado es un
            sistema que se siente hecho a la medida, porque lo está.
          </p>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="bg-blue-600 py-20 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">¿Tienes un proyecto en mente?</h2>
          <p className="max-w-xl text-blue-100">
            Escríbenos y conversemos sobre qué necesita tu empresa.
          </p>
          <div className="flex flex-col items-center gap-2 text-lg font-medium">
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:underline">
              {CONTACT_EMAIL}
            </a>
            <a href={`tel:${CONTACT_PHONE.replace(/[^+\d]/g, "")}`} className="hover:underline">
              {CONTACT_PHONE}
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} KR System. Todos los derechos reservados.
      </footer>
    </div>
  );
}
