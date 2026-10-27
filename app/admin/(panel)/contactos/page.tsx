import Link from "next/link";
import { db } from "@/lib/admin/prisma";
import { requireAdmin } from "@/lib/admin/session";
import { deleteContact, setContactStatus } from "@/lib/admin/actions/contacts";
import { KINDS, kindOf } from "@/lib/admin/tags";
import { Pan, PageTitle, Pill } from "../ui";
import { ContactTools } from "./ContactTools";

export const dynamic = "force-dynamic";

const STATUS = { SUBSCRIBED: ["g", "Suscrito"], UNSUBSCRIBED: ["w", "Dado de baja"], BOUNCED: ["r", "Rebotado"] } as const;
const ORIGIN: Record<string, string> = { manual: "Agregado a mano", excel: "Excel / CSV", "kr-pos": "KR POS", "kr-citas": "KR Citas", web: "Web" };

export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ tipo?: string; q?: string }> }) {
  await requireAdmin();
  const { tipo, q } = await searchParams;
  const where = {
    ...(tipo ? { tags: { has: tipo } } : {}),
    ...(q ? { OR: [{ email: { contains: q, mode: "insensitive" as const } }, { name: { contains: q, mode: "insensitive" as const } }] } : {}),
  };
  const [contacts, total, all] = await Promise.all([
    db.contact.findMany({ where, orderBy: { createdAt: "desc" }, take: 300 }),
    db.contact.count({ where }),
    db.contact.findMany({ select: { tags: true, status: true } }),
  ]);
  const subscribed = all.filter((c) => c.status === "SUBSCRIBED").length;
  const count = (k: string) => all.filter((c) => c.tags.includes(k)).length;

  return (
    <div>
      <PageTitle title="Base de datos de correos" sub={`${all.length} correos guardados · ${subscribed} suscritos. Solo los suscritos reciben correos masivos.`} />
      <ContactTools />
      <Pan title={`Correos guardados (${total})`}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Link href="/admin/contactos" className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${!tipo ? "border-zinc-100" : "border-zinc-800 text-zinc-400"}`}>Todos</Link>
          {(Object.keys(KINDS) as (keyof typeof KINDS)[]).map((k) => (
            <Link key={k} href={`/admin/contactos?tipo=${k}`} className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${tipo === k ? "border-zinc-100" : "border-zinc-800 text-zinc-400"}`}>
              {KINDS[k]}s · {count(k)}
            </Link>
          ))}
          <form className="ml-auto flex gap-2">
            {tipo && <input type="hidden" name="tipo" value={tipo} />}
            <input name="q" defaultValue={q} placeholder="Buscar correo o nombre" className="min-h-10 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-sm" />
            <button className="min-h-10 rounded-full border border-zinc-800 px-4 text-sm font-semibold">Buscar</button>
          </form>
        </div>
        {contacts.length === 0 ? (
          <p className="text-zinc-400">Aún no hay correos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr>
                  {["Nombre", "Correo", "Tipo", "Estado", "Origen", ""].map((h) => (
                    <th key={h} className="border-b border-zinc-800 bg-zinc-950 px-3 py-2 text-left text-xs font-semibold text-zinc-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => {
                  const k = kindOf(c.tags);
                  const [tone, label] = STATUS[c.status];
                  return (
                    <tr key={c.id}>
                      <td className="border-b border-zinc-800 px-3 py-2">{c.name || "—"}</td>
                      <td className="border-b border-zinc-800 px-3 py-2">{c.email}</td>
                      <td className="border-b border-zinc-800 px-3 py-2">{k ? <Pill tone={k === "empresa" ? "w" : "n"}>{KINDS[k]}</Pill> : "—"}</td>
                      <td className="border-b border-zinc-800 px-3 py-2"><Pill tone={tone}>{label}</Pill></td>
                      <td className="border-b border-zinc-800 px-3 py-2 text-zinc-400">{ORIGIN[c.source ?? ""] ?? c.source ?? "—"}</td>
                      <td className="flex justify-end gap-3 border-b border-zinc-800 px-3 py-2">
                        {c.status !== "BOUNCED" && (
                          <form action={setContactStatus.bind(null, c.id, c.status === "SUBSCRIBED" ? "UNSUBSCRIBED" : "SUBSCRIBED")}>
                            <button className="font-semibold underline">{c.status === "SUBSCRIBED" ? "Dar de baja" : "Reactivar"}</button>
                          </form>
                        )}
                        <form action={deleteContact.bind(null, c.id)}>
                          <button className="font-semibold underline">Quitar</button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {total > contacts.length && <p className="mt-2 text-xs text-zinc-400">Mostrando {contacts.length} de {total}.</p>}
      </Pan>
    </div>
  );
}
