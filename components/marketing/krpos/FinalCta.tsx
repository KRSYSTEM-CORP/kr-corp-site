import Image from "next/image";
import { Reveal } from "@/components/marketing/Reveal";

const SIGNUP = "https://krpos.krsystem-corp.com/signup";

export function FinalCta() {
  return (
    <section
      aria-label="Empieza con KR POS"
      className="relative overflow-hidden px-5 py-28 text-center sm:py-36"
      style={{ backgroundColor: "#1a0f3a", backgroundImage: "radial-gradient(50% 70% at 15% 20%, rgba(67,61,221,0.9), transparent 70%), radial-gradient(45% 70% at 90% 85%, rgba(226,9,140,0.85), transparent 70%)" }}
    >
      <Reveal className="mx-auto max-w-4xl">
        <h2 className="text-balance text-[clamp(2.75rem,8vw,5.5rem)] font-bold leading-[1.02] tracking-[-0.045em]">Empieza hoy tu primer mes.</h2>
        <p className="mx-auto mt-5 max-w-xl text-balance text-xl text-white/85 sm:text-2xl">15 días gratis, sin tarjeta. Si tienes dudas, te escribimos por WhatsApp.</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href={SIGNUP} className="rounded-full bg-white px-8 py-3.5 text-lg font-semibold text-black transition-transform duration-150 active:scale-[0.97]">Probar KR POS gratis</a>
          <a href="https://wa.me/19045796156?text=Hola%2C%20quiero%20conocer%20KR%20POS" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-8 py-3.5 text-lg font-semibold transition-colors hover:bg-white/10">
            <Image src="/whatsapp-icon.png" alt="" width={22} height={22} className="h-5 w-5" /> Escribir por WhatsApp
          </a>
        </div>
      </Reveal>
    </section>
  );
}
