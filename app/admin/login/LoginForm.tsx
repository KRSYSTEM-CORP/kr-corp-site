"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/lib/admin/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, { error: null });
  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-zinc-300">Correo</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className="h-11 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-white outline-none focus:border-zinc-400"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-zinc-300">Contraseña</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-11 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-white outline-none focus:border-zinc-400"
        />
      </label>
      {state.error && <p role="alert" className="text-sm text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-lg bg-white font-medium text-black transition-opacity disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
