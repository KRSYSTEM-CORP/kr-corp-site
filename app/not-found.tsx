import Link from "next/link";

export const metadata = { title: "Página no encontrada — KR System", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-black px-5 text-center text-[#f5f5f7]">
      <p className="text-sm font-semibold text-[#c9a6e8]">Error 404</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">No encontramos esa página</h1>
      <p className="mt-3 max-w-md text-[#a1a1a6]">Puede que el enlace esté mal escrito o que la página ya no exista.</p>
      <Link href="/" className="mt-8 rounded-full bg-white px-7 py-3 font-semibold text-black">Volver al inicio</Link>
    </main>
  );
}
