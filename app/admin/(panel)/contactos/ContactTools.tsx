"use client";

import { useActionState, useRef, useState } from "react";
import { addContact, importContacts } from "@/lib/admin/actions/contacts";
import type { FormState } from "@/lib/admin/actions/users";
import { btnGhost, btnPrimary, field, Pan } from "../ui";

const KIND_OPTIONS = (
  <>
    <option value="cliente">Cliente</option>
    <option value="empresa">Empresa</option>
    <option value="prospecto">Prospecto</option>
  </>
);

const cellText = (v: unknown): string => {
  if (v == null) return "";
  if (typeof v === "object") {
    const o = v as { text?: unknown; result?: unknown; richText?: { text: string }[] };
    if (o.richText) return o.richText.map((r) => r.text).join("");
    if (o.text != null) return cellText(o.text);
    if (o.result != null) return cellText(o.result);
    return "";
  }
  return String(v).trim();
};

// Excel → one line per row: nombre, correo, tipo, teléfono, empresa.
async function xlsxToLines(file: File): Promise<string> {
  const { default: ExcelJS } = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(await file.arrayBuffer());
  const ws = wb.worksheets[0];
  if (!ws) return "";
  const col: Record<string, number> = {};
  ws.getRow(1).eachCell((c, n) => {
    const h = cellText(c.value).toLowerCase();
    if (/nombre/.test(h)) col.name = n;
    else if (/correo|e-?mail/.test(h)) col.email = n;
    else if (/tipo/.test(h)) col.kind = n;
    else if (/tel/.test(h)) col.phone = n;
    else if (/empresa/.test(h)) col.company = n;
  });
  if (!col.email) throw new Error("El Excel necesita una columna «Correo».");
  const clean = (s: string) => s.replace(/[,;\t\r\n]/g, " ");
  const lines: string[] = [];
  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const get = (k: string) => (col[k] ? clean(cellText(row.getCell(col[k]).value)) : "");
    if (!get("email")) continue;
    lines.push([get("name"), get("email"), get("kind"), get("phone"), get("company")].join(", "));
  }
  return lines.join("\n");
}

export function ContactTools() {
  const [one, oneAction, onePending] = useActionState<FormState, FormData>(addContact, { error: null });
  const [many, manyAction, manyPending] = useActionState<FormState, FormData>(importContacts, { error: null });
  const listRef = useRef<HTMLTextAreaElement>(null);
  const [loadMsg, setLoadMsg] = useState<string | null>(null);

  const fill = (text: string) => {
    if (listRef.current) listRef.current.value = text;
  };

  return (
    <>
      <Pan title="Agregar un correo">
        <form action={oneAction} className="grid gap-3 sm:grid-cols-[1fr_1.3fr_160px_auto] sm:items-end">
          <label className="text-sm font-semibold">
            Nombre
            <input name="name" className={field} />
          </label>
          <label className="text-sm font-semibold">
            Correo
            <input name="email" type="email" required className={field} />
          </label>
          <label className="text-sm font-semibold">
            Tipo
            <select name="kind" defaultValue="cliente" className={field}>{KIND_OPTIONS}</select>
          </label>
          <button disabled={onePending} className={btnPrimary}>{onePending ? "Agregando…" : "Agregar"}</button>
        </form>
        {one.error && <p className="mt-2 text-sm text-red-400">{one.error}</p>}
        {one.ok && <p className="mt-2 text-sm text-emerald-400">{one.message}</p>}
      </Pan>

      <Pan title="Agregar una lista">
        <p className="text-sm text-zinc-400">
          Una línea por persona: «Nombre, correo» o solo el correo. También puedes cargar un archivo .csv, .txt o un Excel (.xlsx con columnas
          <b> Nombre</b>, <b>Correo</b>, <b>Tipo</b>, <b>Teléfono</b>, <b>Empresa</b>). Los correos nuevos se agregan y los que ya existen se actualizan; no se borra ninguno.
        </p>
        <form action={manyAction} className="mt-3 grid gap-3">
          <textarea ref={listRef} name="list" required rows={5} placeholder={"María Pérez, maria@correo.com\nventas@empresa.com"} className={field} />
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm font-semibold">
              Tipo (si el archivo no lo trae)
              <select name="kind" defaultValue="prospecto" className={field}>{KIND_OPTIONS}</select>
            </label>
            <label className="text-sm font-semibold">
              Etiquetas (opcional)
              <input name="tags" placeholder="kr-pos, feria" className={field} />
            </label>
            <label className="text-sm font-semibold">
              Origen
              <select name="source" defaultValue="manual" className={field}>
                <option value="manual">Agregado a mano</option>
                <option value="excel">Excel / CSV</option>
                <option value="kr-pos">KR POS</option>
                <option value="kr-citas">KR Citas</option>
                <option value="web">Web</option>
              </select>
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button disabled={manyPending} className={btnPrimary}>{manyPending ? "Guardando…" : "Agregar lista"}</button>
            <label className={`${btnGhost} cursor-pointer`}>
              Cargar archivo
              <input
                type="file"
                accept=".csv,.txt,.xlsx,text/csv,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="sr-only"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (!f) return;
                  setLoadMsg(null);
                  try {
                    fill(/\.xlsx$/i.test(f.name) ? await xlsxToLines(f) : await f.text());
                    setLoadMsg(`Archivo «${f.name}» cargado. Revisa la lista y pulsa «Agregar lista».`);
                  } catch (err) {
                    setLoadMsg(err instanceof Error ? err.message : "No se pudo leer el archivo.");
                  }
                }}
              />
            </label>
            <a href="/admin/contactos/exportar" className={btnGhost}>Descargar la base en Excel</a>
          </div>
        </form>
        {loadMsg && <p className="mt-2 text-sm text-zinc-300">{loadMsg}</p>}
        {many.error && <p className="mt-2 text-sm text-red-400">{many.error}</p>}
        {many.ok && <p className="mt-2 text-sm text-emerald-400">{many.message}</p>}
      </Pan>
    </>
  );
}
