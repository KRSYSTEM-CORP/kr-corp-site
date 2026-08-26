import Link from "next/link";

// Shared layout for the three public legal pages (Privacidad/Términos/
// Cookies), matching the marketing site's dark palette (see globals.css
// custom properties) rather than the light card-based style of the apps.
export function LegalDocument({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-6 px-6 py-16">
      <div>
        <Link href="/" className="text-sm text-[#c9a6e8] hover:underline">
          ← Volver al inicio
        </Link>
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-[#f3f1f9]">{title}</h1>
        <p className="mt-1 text-sm text-[#6b6684]">Última actualización: {updatedAt}</p>
      </div>
      <div className="flex flex-col gap-5 text-sm leading-relaxed text-[#a29cbd] [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-2 [&_h2]:text-center [&_h2]:text-[#f3f1f9] [&_strong]:text-[#f3f1f9] [&_a]:text-[#c9a6e8] [&_a]:hover:underline [&_p]:text-justify [&_li]:text-justify">
        {children}
      </div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
