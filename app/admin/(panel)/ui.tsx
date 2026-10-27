import type { ReactNode } from "react";

export const field = "mt-1 min-h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm";
export const btn = "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold disabled:opacity-50";
export const btnPrimary = `${btn} bg-[#c80000] !text-white`;
export const btnGhost = `${btn} border-2 border-zinc-100`;

export function Pan({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      {title && <h2 className="mb-3 text-lg font-bold">{title}</h2>}
      {children}
    </section>
  );
}

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {sub && <p className="mt-1 text-zinc-400">{sub}</p>}
    </>
  );
}

export function Pill({ tone, children }: { tone: "g" | "w" | "r" | "n"; children: ReactNode }) {
  const c = { g: "bg-emerald-500/15 text-emerald-300", w: "bg-amber-500/15 text-amber-300", r: "bg-red-500/15 text-red-300", n: "bg-zinc-500/15 text-zinc-300" }[tone];
  return <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${c}`}>{children}</span>;
}
