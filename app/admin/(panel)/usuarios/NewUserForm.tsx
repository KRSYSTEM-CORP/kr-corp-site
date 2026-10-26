"use client";

import { useActionState } from "react";
import { createAdminUser, type FormState } from "@/lib/admin/actions/users";

const input = "h-10 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-white outline-none focus:border-zinc-400";

export function NewUserForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createAdminUser, { error: null });
  return (
    <form action={action} className="grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
      <input name="name" placeholder="Nombre" required className={input} />
      <input name="email" type="email" placeholder="Correo" required className={input} />
      <input name="password" type="password" placeholder="Contraseña (mín. 10)" required minLength={10} className={input} autoComplete="new-password" />
      <select name="role" className={input} defaultValue="STAFF">
        <option value="STAFF">Equipo (sin gestión de usuarios)</option>
        <option value="OWNER">Dueño (acceso total)</option>
      </select>
      <button type="submit" disabled={pending} className="h-10 rounded-lg bg-white text-sm font-medium text-black disabled:opacity-60 sm:col-span-2">
        {pending ? "Creando…" : "Crear usuario"}
      </button>
      {state.error && <p className="text-sm text-red-400 sm:col-span-2">{state.error}</p>}
      {state.ok && <p className="text-sm text-emerald-400 sm:col-span-2">Usuario creado.</p>}
    </form>
  );
}
