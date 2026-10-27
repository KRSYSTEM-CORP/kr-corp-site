import { notFound } from "next/navigation";
import { db } from "@/lib/admin/prisma";
import { requireAdmin } from "@/lib/admin/session";
import { audienceFor, deleteDraft, sendCampaign, sendTest } from "@/lib/admin/actions/campaigns";
import { mailgunConfigured, personalize } from "@/lib/admin/mailgun";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // sending runs inside the action

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const c = await db.campaign.findUnique({ where: { id }, include: { recipients: true } });
  if (!c) notFound();
  const audience = c.status === "DRAFT" ? (await audienceFor(c.tags)).length : 0;
  const sent = c.recipients.filter((r) => r.sentAt).length;
  const count = (k: "deliveredAt" | "openedAt" | "clickedAt" | "failedAt") => c.recipients.filter((r) => r[k]).length;
  const pct = (n: number) => (sent ? `${n} · ${Math.round((n / sent) * 100)}%` : "—");
  const configured = mailgunConfigured();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{c.name}</h1>
        <p className="text-sm text-zinc-400">Asunto: {c.subject} · Segmento: {c.tags.length ? c.tags.join(" + ") : "todos los suscritos"}</p>
      </div>

      {c.status === "DRAFT" && (
        <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 p-4">
          <p className="text-sm">
            Se enviará a <strong>{audience}</strong> contactos suscritos.
            {audience > 3000 && <span className="text-red-300"> Máximo 3000 por envío: usa etiquetas para dividir.</span>}
          </p>
          {!configured && <p className="text-sm text-amber-300">Mailgun aún no está configurado en Vercel (MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM).</p>}
          <div className="flex flex-wrap gap-3">
            <form action={sendTest.bind(null, c.id)}>
              <button disabled={!configured} className="h-10 rounded-lg border border-zinc-600 px-4 text-sm disabled:opacity-50">Enviarme una prueba</button>
            </form>
            <form action={sendCampaign.bind(null, c.id)}>
              <button disabled={!configured || audience === 0 || audience > 3000} className="h-10 rounded-lg bg-white px-4 text-sm font-medium text-black disabled:opacity-50">
                Enviar a {audience} contactos
              </button>
            </form>
            <form action={deleteDraft.bind(null, c.id)}>
              <button className="h-10 px-2 text-sm text-red-300 underline underline-offset-2">Eliminar borrador</button>
            </form>
          </div>
        </div>
      )}

      {c.status !== "DRAFT" && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Stat label="Enviados" value={sent} />
          <Stat label="Entregados" value={pct(count("deliveredAt"))} />
          <Stat label="Abiertos" value={pct(count("openedAt"))} />
          <Stat label="Clics" value={pct(count("clickedAt"))} />
          <Stat label="Fallidos" value={count("failedAt")} />
        </div>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-zinc-300">Vista previa</h2>
        <iframe
          title="Vista previa del correo"
          sandbox=""
          srcDoc={personalize(c.html).replace(/%recipient\.name%/g, "Ana")}
          className="h-[480px] w-full max-w-2xl rounded-xl border border-zinc-800 bg-white"
        />
      </div>
    </div>
  );
}
