import Link from "next/link";
import { db } from "@/lib/admin/prisma";
import { requireAdmin } from "@/lib/admin/session";
import { NewCampaignForm } from "./NewCampaignForm";

export const dynamic = "force-dynamic";

const STATUS = { DRAFT: "Borrador", SENDING: "Enviando", SENT: "Enviada" } as const;

export default async function CampaignsPage() {
  await requireAdmin();
  const campaigns = await db.campaign.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { recipients: { select: { sentAt: true, deliveredAt: true, openedAt: true, clickedAt: true, failedAt: true } } },
  });
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Campañas de correo</h1>
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900 text-xs text-zinc-400">
            <tr>
              <th className="px-3 py-2 font-medium">Campaña</th>
              <th className="px-3 py-2 font-medium">Estado</th>
              <th className="px-3 py-2 text-right font-medium">Enviados</th>
              <th className="px-3 py-2 text-right font-medium">Abiertos</th>
              <th className="px-3 py-2 text-right font-medium">Clics</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {campaigns.map((c) => {
              const sent = c.recipients.filter((r) => r.sentAt).length;
              const pct = (n: number) => (sent ? `${n} (${Math.round((n / sent) * 100)}%)` : "—");
              return (
                <tr key={c.id}>
                  <td className="px-3 py-2">
                    <Link href={`/admin/campanas/${c.id}`} className="font-medium underline-offset-2 hover:underline">{c.name}</Link>
                  </td>
                  <td className="px-3 py-2 text-zinc-300">{STATUS[c.status]}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{sent || "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{pct(c.recipients.filter((r) => r.openedAt).length)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{pct(c.recipients.filter((r) => r.clickedAt).length)}</td>
                </tr>
              );
            })}
            {campaigns.length === 0 && <tr><td colSpan={5} className="px-3 py-6 text-center text-zinc-500">Aún no hay campañas.</td></tr>}
          </tbody>
        </table>
      </div>
      <h2 className="text-lg font-semibold">Nueva campaña</h2>
      <NewCampaignForm />
    </div>
  );
}
