import Link from "next/link";
import { db } from "@/lib/admin/prisma";
import { requireAdmin } from "@/lib/admin/session";
import { mailgunConfigured } from "@/lib/admin/mailgun";
import { kindOf } from "@/lib/admin/tags";
import { Pan, PageTitle } from "../ui";
import { MassMailComposer } from "./MassMailComposer";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // the send runs inside the action

const STATUS = { DRAFT: "Borrador", SENDING: "Enviando", SENT: "Enviada" } as const;

export default async function CampaignsPage() {
  await requireAdmin();
  const [contacts, campaigns] = await Promise.all([
    db.contact.findMany({ where: { status: "SUBSCRIBED" }, orderBy: { createdAt: "asc" }, take: 5000 }),
    db.campaign.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { recipients: { select: { sentAt: true, deliveredAt: true, openedAt: true, clickedAt: true, failedAt: true } } },
    }),
  ]);
  return (
    <div>
      <PageTitle title="Correos masivos" sub="Redacta el mensaje, elige a quién va y se envía con Mailgun." />
      <MassMailComposer
        configured={mailgunConfigured()}
        contacts={contacts.map((c) => ({ id: c.id, email: c.email, name: c.name, kind: kindOf(c.tags) }))}
      />
      <Pan title="Envíos anteriores">
        {campaigns.length === 0 ? (
          <p className="text-zinc-400">Aún no has enviado correos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr>
                  {["Asunto", "Estado", "Enviados", "Abiertos", "Clics", "Fecha"].map((h) => (
                    <th key={h} className="border-b border-zinc-800 bg-zinc-950 px-3 py-2 text-left text-xs font-semibold text-zinc-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => {
                  const sent = c.recipients.filter((r) => r.sentAt).length;
                  const pct = (n: number) => (sent ? `${n} (${Math.round((n / sent) * 100)}%)` : "—");
                  return (
                    <tr key={c.id}>
                      <td className="border-b border-zinc-800 px-3 py-2">
                        <Link href={`/admin/campanas/${c.id}`} className="font-semibold underline-offset-2 hover:underline">{c.name}</Link>
                      </td>
                      <td className="border-b border-zinc-800 px-3 py-2">{STATUS[c.status]}</td>
                      <td className="border-b border-zinc-800 px-3 py-2 tabular-nums">{sent || "—"}</td>
                      <td className="border-b border-zinc-800 px-3 py-2 tabular-nums">{pct(c.recipients.filter((r) => r.openedAt).length)}</td>
                      <td className="border-b border-zinc-800 px-3 py-2 tabular-nums">{pct(c.recipients.filter((r) => r.clickedAt).length)}</td>
                      <td className="border-b border-zinc-800 px-3 py-2 text-zinc-400">{(c.sentAt ?? c.createdAt).toLocaleDateString("es-VE")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Pan>
    </div>
  );
}
