import Link from "next/link";
import { db } from "@/lib/admin/prisma";
import { requireAdmin } from "@/lib/admin/session";
import { deleteContact, setContactStatus } from "@/lib/admin/actions/contacts";
import { ImportForm } from "./ImportForm";

export const dynamic = "force-dynamic";

const STATUS = { SUBSCRIBED: "Suscrito", UNSUBSCRIBED: "Dado de baja", BOUNCED: "Rebotado" } as const;

export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ tag?: string; q?: string }> }) {
  await requireAdmin();
  const { tag, q } = await searchParams;
  const where = {
    ...(tag ? { tags: { has: tag } } : {}),
    ...(q ? { OR: [{ email: { contains: q, mode: "insensitive" as const } }, { name: { contains: q, mode: "insensitive" as const } }] } : {}),
  };
  const [contacts, total, all] = await Promise.all([
    db.contact.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 }),
    db.contact.count({ where }),
    db.contact.findMany({ select: { tags: true, status: true } }),
  ]);
  const tagCount = new Map<string, number>();
  for (const c of all) for (const t of c.tags) tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
  const subscribed = all.filter((c) => c.status === "SUBSCRIBED").length;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Contactos</h1>
      <p className="text-sm text-zinc-400">
        {all.length} en total · {subscribed} suscritos. Solo los suscritos reciben campañas.
      </p>

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/contactos" className={`rounded-full border px-3 py-1 text-xs ${!tag ? "border-white" : "border-zinc-700 text-zinc-400"}`}>
          Todos
        </Link>
        {[...tagCount].sort().map(([t, n]) => (
          <Link key={t} href={`/admin/contactos?tag=${encodeURIComponent(t)}`} className={`rounded-full border px-3 py-1 text-xs ${tag === t ? "border-white" : "border-zinc-700 text-zinc-400"}`}>
            {t} · {n}
          </Link>
        ))}
      </div>

      <form className="flex max-w-md gap-2">
        {tag && <input type="hidden" name="tag" value={tag} />}
        <input name="q" defaultValue={q} placeholder="Buscar por correo o nombre" className="h-10 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm outline-none focus:border-zinc-400" />
        <button className="h-10 rounded-lg border border-zinc-700 px-4 text-sm">Buscar</button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900 text-xs text-zinc-400">
            <tr>
              <th className="px-3 py-2 font-medium">Correo</th>
              <th className="px-3 py-2 font-medium">Nombre</th>
              <th className="px-3 py-2 font-medium">Etiquetas</th>
              <th className="px-3 py-2 font-medium">Estado</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {contacts.map((c) => (
              <tr key={c.id}>
                <td className="px-3 py-2">{c.email}</td>
                <td className="px-3 py-2 text-zinc-300">{c.name ?? "—"}</td>
                <td className="px-3 py-2 text-zinc-400">{c.tags.join(", ") || "—"}</td>
                <td className="px-3 py-2">{STATUS[c.status]}</td>
                <td className="flex justify-end gap-3 px-3 py-2 text-xs">
                  {c.status !== "BOUNCED" && (
                    <form action={setContactStatus.bind(null, c.id, c.status === "SUBSCRIBED" ? "UNSUBSCRIBED" : "SUBSCRIBED")}>
                      <button className="text-zinc-300 underline underline-offset-2">{c.status === "SUBSCRIBED" ? "Dar de baja" : "Reactivar"}</button>
                    </form>
                  )}
                  <form action={deleteContact.bind(null, c.id)}>
                    <button className="text-red-300 underline underline-offset-2">Eliminar</button>
                  </form>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-6 text-center text-zinc-500">Sin contactos todavía.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {total > contacts.length && <p className="text-xs text-zinc-500">Mostrando {contacts.length} de {total}.</p>}

      <h2 className="text-lg font-semibold">Importar contactos</h2>
      <ImportForm />
    </div>
  );
}
