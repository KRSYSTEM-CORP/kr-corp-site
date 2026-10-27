import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/session";
import { logout } from "@/lib/admin/actions/auth";
import { PanelNav } from "./PanelNav";

export const metadata: Metadata = { title: "Panel — KR System", robots: { index: false, follow: false } };

const NAV = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/finanzas", label: "Finanzas" },
  { href: "/admin/contactos", label: "Base de datos de correos" },
  { href: "/admin/campanas", label: "Correos masivos" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const nav = admin.role === "OWNER" ? [...NAV, { href: "/admin/usuarios", label: "Usuarios" }] : NAV;
  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <div className="mx-auto grid w-[min(1240px,100%-32px)] grid-cols-[minmax(0,1fr)] gap-6 py-6 pb-16 md:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="flex min-w-0 flex-wrap items-center gap-1 self-start rounded-2xl border border-zinc-800 bg-zinc-900 p-3 md:sticky md:top-3 md:block">
          <div className="w-full px-3 pb-2 pt-1">
            <p className="text-sm font-semibold">KR System · Panel</p>
            <p className="truncate text-xs text-zinc-400">{admin.name}</p>
          </div>
          <PanelNav items={nav} />
          <form action={logout} className="md:mt-3">
            <button type="submit" className="flex min-h-11 w-full items-center rounded-xl px-3 text-left font-medium text-zinc-400 hover:bg-zinc-950">
              Salir
            </button>
          </form>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
