"use client";

const CONTACT_EMAIL = "contacto@krsystem-corp.com";

export function ContactForm() {
  const field = "w-full rounded-2xl border border-white/30 bg-white/[0.12] px-4 py-3.5 text-left text-lg text-white placeholder:text-white/50 backdrop-blur-xl focus:border-white focus:outline-none";
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const subject = `Consulta de ${f.get("nombre")}`;
    const body = `${f.get("mensaje")}\n\n— ${f.get("nombre")} (${f.get("correo")})`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <input name="nombre" required placeholder="Tu nombre" aria-label="Tu nombre" autoComplete="name" className={field} />
      <input name="correo" type="email" required placeholder="Tu correo" aria-label="Tu correo" autoComplete="email" className={field} />
      <textarea name="mensaje" required rows={4} placeholder="Cuéntanos qué necesitas" aria-label="Mensaje" className={field} />
      <button type="submit" className="rounded-full bg-white px-8 py-3.5 text-lg font-semibold text-black transition-transform duration-150 active:scale-[0.97]">Enviar por correo</button>
      <p className="text-sm text-white/70">Se abrirá tu app de correo con el mensaje listo para enviar a {CONTACT_EMAIL}.</p>
    </form>
  );
}
