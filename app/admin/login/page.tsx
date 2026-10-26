import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Panel — KR System", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <main className="flex min-h-dvh items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h1 className="text-xl font-semibold text-white">Panel de KR System</h1>
        <p className="mb-6 mt-1 text-sm text-zinc-400">Acceso solo para el equipo.</p>
        <LoginForm />
      </div>
    </main>
  );
}
