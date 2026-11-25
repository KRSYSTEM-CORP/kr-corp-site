"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-black px-5 text-center text-[#f5f5f7]">
      <p className="text-sm font-semibold text-[#c9a6e8]">Error 500</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Algo salió mal</h1>
      <p className="mt-3 max-w-md text-[#a1a1a6]">Intenta de nuevo en unos segundos.</p>
      <button onClick={reset} className="mt-8 rounded-full bg-white px-7 py-3 font-semibold text-black">Reintentar</button>
    </main>
  );
}
