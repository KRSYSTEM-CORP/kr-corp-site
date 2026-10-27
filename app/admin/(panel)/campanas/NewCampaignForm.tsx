"use client";

import { useActionState } from "react";
import { createCampaign } from "@/lib/admin/actions/campaigns";
import type { FormState } from "@/lib/admin/actions/users";

const input = "rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-white outline-none focus:border-zinc-400";

export function NewCampaignForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createCampaign, { error: null });
  return (
    <form action={action} className="flex max-w-2xl flex-col gap-3">
      <input name="name" placeholder="Nombre interno (ej: Lanzamiento KR Citas)" required className={`${input} h-10`} />
      <input name="subject" placeholder="Asunto del correo" required className={`${input} h-10`} />
      <input name="tags" placeholder="Enviar solo a contactos con etiquetas (vacío = todos los suscritos)" className={`${input} h-10`} />
      <textarea
        name="html"
        required
        rows={10}
        placeholder={"<h1>Hola {{nombre}}</h1>\n<p>Contenido del correo en HTML…</p>"}
        className={`${input} py-2 font-mono`}
      />
      <p className="text-xs text-zinc-500">
        {"{{nombre}}"} se reemplaza por el nombre de cada contacto. El enlace para darse de baja se agrega solo al final.
      </p>
      <button disabled={pending} className="h-10 rounded-lg bg-white text-sm font-medium text-black disabled:opacity-60">
        {pending ? "Guardando…" : "Guardar borrador"}
      </button>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
    </form>
  );
}
