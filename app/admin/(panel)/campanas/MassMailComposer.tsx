"use client";

import { useActionState, useState } from "react";
import { sendMassMail } from "@/lib/admin/actions/campaigns";
import type { FormState } from "@/lib/admin/actions/users";
import { btnGhost, btnPrimary, field, Pan, Pill } from "../ui";

export type Recipient = { id: string; email: string; name: string | null; kind: "cliente" | "empresa" | "prospecto" | null };

const KIND_LABEL = { cliente: "Cliente", empresa: "Empresa", prospecto: "Prospecto" } as const;
const LAST = "kr-ultimo-tramo";

export function MassMailComposer({ contacts, configured }: { contacts: Recipient[]; configured: boolean }) {
  const [sel, setSel] = useState<string[]>([]);
  const [desde, setDesde] = useState("1");
  const [hasta, setHasta] = useState(String(Math.min(contacts.length, 100) || 1));
  const [last, setLast] = useState(() => {
    try {
      return typeof window === "undefined" ? "" : (localStorage.getItem(LAST) ?? "");
    } catch {
      return "";
    }
  });
  const [preview, setPreview] = useState<string | null>(null);

  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, fd) => {
    const r = await sendMassMail(prev, fd);
    // After a successful send, remember the block and propose the next one.
    if (r.ok && r.message?.startsWith("Enviado") && sel.length) {
      const nums = sel.map((id) => contacts.findIndex((c) => c.id === id) + 1).filter((n) => n > 0);
      if (nums.length) {
        const lo = Math.min(...nums);
        const hi = Math.max(...nums);
        const text = `del ${lo} al ${hi} · ${new Date().toLocaleDateString("es-VE")}`;
        setLast(text);
        try {
          localStorage.setItem(LAST, text);
        } catch {
          /* sin almacenamiento: solo no se recuerda */
        }
        if (hi < contacts.length) {
          setDesde(String(hi + 1));
          setHasta(String(Math.min(contacts.length, hi + 1 + (hi - lo))));
        }
      }
    }
    return r;
  }, { error: null });

  const pick = (kind?: Recipient["kind"]) => setSel(contacts.filter((c) => !kind || c.kind === kind).map((c) => c.id));
  const pickRange = () => {
    const a = Math.max(1, Number(desde) || 1);
    const b = Math.min(contacts.length, Number(hasta) || contacts.length);
    setSel(contacts.slice(a - 1, Math.max(a, b)).map((c) => c.id));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <Pan title="Mensaje">
        <form
          action={action}
          className="grid gap-3"
          onSubmit={(e) => {
            const test = ((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.name === "test";
            if (!test && !window.confirm(`¿Enviar este correo a ${sel.length} destinatarios?`)) e.preventDefault();
          }}
        >
          <input type="hidden" name="ids" value={JSON.stringify(sel)} />
          <label className="text-sm font-semibold">
            Asunto
            <input name="subject" required className={field} />
          </label>
          <label className="text-sm font-semibold">
            Mensaje
            <textarea name="message" required className={`${field} min-h-36`} placeholder={"Hola {{nombre}},\n\n…"} />
          </label>
          <p className="-mt-2 text-xs text-zinc-400">{"{{nombre}}"} se reemplaza por el nombre de cada persona. Deja una línea en blanco para separar párrafos.</p>
          <label className="text-sm font-semibold">
            Imagen o flyer (JPG, PNG o WebP, opcional, máx. 3 MB)
            <input
              name="flyer"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className={field}
              onChange={(e) => {
                const f = e.target.files?.[0];
                setPreview(f ? URL.createObjectURL(f) : null);
              }}
            />
          </label>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {preview && <img src={preview} alt="Vista previa de la imagen" className="max-h-48 rounded-xl border border-zinc-800" />}
          <p className="text-sm text-zinc-400">
            Se envía con Mailgun a nombre de KR System. La imagen va dentro del correo y cada correo lleva su enlace de baja.
          </p>
          {!configured && <p className="text-sm text-amber-300">Mailgun aún no está configurado en Vercel; el envío se activa al agregar sus variables.</p>}
          <div className="flex flex-wrap gap-3">
            <button disabled={pending || !configured || sel.length === 0} className={btnPrimary}>
              {pending ? "Enviando…" : `Enviar a ${sel.length} destinatarios`}
            </button>
            <button name="test" value="1" disabled={pending || !configured} className={btnGhost}>
              Enviarme una prueba
            </button>
          </div>
          {state.error && <p className="text-sm text-red-400">{state.error}</p>}
          {state.ok && <p className="text-sm text-emerald-400">{state.message}</p>}
        </form>
      </Pan>

      <Pan title={`Destinatarios (${sel.length} de ${contacts.length})`}>
        {contacts.length === 0 ? (
          <p className="text-zinc-400">
            Aún no hay correos suscritos.{" "}
            <a href="/admin/contactos" className="font-semibold underline">Agrégalos en la base de datos</a>.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["Todos", () => pick()],
                  ["Clientes", () => pick("cliente")],
                  ["Empresas", () => pick("empresa")],
                  ["Prospectos", () => pick("prospecto")],
                  ["Ninguno", () => setSel([])],
                ] as const
              ).map(([l, fn]) => (
                <button key={l} type="button" onClick={fn} className="min-h-10 rounded-full border border-zinc-800 px-4 text-sm font-semibold">
                  {l}
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-zinc-800 p-3">
              <p className="text-sm font-semibold">Enviar por tramo (total: {contacts.length} correos)</p>
              <div className="mt-2 flex flex-wrap items-end gap-2">
                <label className="text-sm">
                  Desde el n.º
                  <input type="number" min={1} max={contacts.length} value={desde} onChange={(e) => setDesde(e.target.value)} className="mt-1 block min-h-11 w-24 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2" />
                </label>
                <label className="text-sm">
                  Hasta el n.º
                  <input type="number" min={1} max={contacts.length} value={hasta} onChange={(e) => setHasta(e.target.value)} className="mt-1 block min-h-11 w-24 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2" />
                </label>
                <button type="button" onClick={pickRange} className="min-h-12 rounded-full bg-zinc-100 px-5 text-sm font-semibold text-zinc-900">
                  Seleccionar tramo
                </button>
              </div>
              {last && <p suppressHydrationWarning className="mt-2 text-sm text-zinc-400">Último envío: {last}</p>}
            </div>
            <ul className="mt-3 max-h-80 overflow-y-auto">
              {contacts.map((c, i) => (
                <li key={c.id} className="border-b border-zinc-800">
                  <label className="flex min-h-11 items-center gap-2.5 py-1.5 text-sm">
                    <input
                      type="checkbox"
                      className="h-5 w-5 flex-none"
                      checked={sel.includes(c.id)}
                      onChange={(e) => setSel(e.target.checked ? [...sel, c.id] : sel.filter((x) => x !== c.id))}
                    />
                    <span className="w-10 flex-none text-right font-mono text-xs text-zinc-400">{i + 1}</span>
                    <span className="min-w-0 flex-1 break-words">
                      {c.name && <b>{c.name} · </b>}
                      {c.email}
                    </span>
                    {c.kind && <Pill tone={c.kind === "empresa" ? "w" : "n"}>{KIND_LABEL[c.kind]}</Pill>}
                  </label>
                </li>
              ))}
            </ul>
          </>
        )}
      </Pan>
    </div>
  );
}
