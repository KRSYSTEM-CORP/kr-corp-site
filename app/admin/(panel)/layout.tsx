import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { logout } from "@/lib/admin/actions/auth";

export const metadata: Metadata = { title: "Panel — KR System", robots: { index: false, follow: false } };

const NAV = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/finanzas", label: "Finanzas" },
  { href: "/admin/contactos", label: "Contactos" },
  { href: "/admin/campanas", label: "Campañas" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const nav = admin.role === "OWNER" ? [...NAV, { href: "/admin/usuarios", label: "Usuarios" }] : NAV;
  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 md:flex">
      <aside className="border-b border-zinc-800 md:sticky md:top-0 md:h-dvh md:w-56 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-2 p-4 md:block">
          <p className="text-sm font-semibold">KR System · Panel</p>
          <p className="truncate text-xs text-zinc-400 md:mt-1">{admin.name}</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:px-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <form action={logout} className="md:mt-4">
            <button type="submit" className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm text-zinc-400 hover:bg-zinc-800">
              Salir
            </button>
          </form>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
