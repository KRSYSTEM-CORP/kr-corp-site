"use client";

import { useActionState } from "react";
import { importContacts } from "@/lib/admin/actions/contacts";
import type { FormState } from "@/lib/admin/actions/users";

const input = "rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-white outline-none focus:border-zinc-400";

export function ImportForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(importContacts, { error: null });
  return (
    <form action={action} className="flex max-w-2xl flex-col gap-3">
      <textarea
        name="list"
        required
        rows={6}
        placeholder={"ana@empresa.com, Ana Pérez, 0412..., Mi Empresa\nluis@correo.com, Luis"}
        className={`${input} py-2 font-mono`}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input name="tags" placeholder="Etiquetas (ej: kr-pos, prospecto)" className={`${input} h-10`} />
        <select name="source" defaultValue="manual" className={`${input} h-10`}>
          <option value="manual">Origen: manual</option>
          <option value="excel">Origen: Excel / CSV</option>
          <option value="kr-pos">Origen: KR POS</option>
          <option value="kr-citas">Origen: KR Citas</option>
          <option value="web">Origen: web</option>
        </select>
      </div>
      <label className="text-xs text-zinc-400">
        ¿Tienes un Excel? Cópialo y pégalo aquí (columnas: correo, nombre, teléfono, empresa), o súbelo como CSV:{" "}
        <input
          type="file"
          accept=".csv,.txt"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) (e.currentTarget.form!.elements.namedItem("list") as HTMLTextAreaElement).value = await f.text();
          }}
        />
      </label>
      <button disabled={pending} className="h-10 rounded-lg bg-white text-sm font-medium text-black disabled:opacity-60">
        {pending ? "Importando…" : "Importar contactos"}
      </button>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.ok && <p className="text-sm text-emerald-400">{state.message}</p>}
    </form>
  );
}
