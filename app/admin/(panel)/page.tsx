import { db } from "@/lib/admin/prisma";

export const dynamic = "force-dynamic";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

async function loadStats() {
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  return Promise.all([
    db.contact.count({ where: { status: "SUBSCRIBED" } }),
    db.contact.count(),
    db.campaign.count({ where: { status: "SENT" } }),
    db.webEvent.count({ where: { type: "visit", createdAt: { gte: since } } }),
  ]);
}

export default async function AdminHome() {
  const [subscribed, totalContacts, campaigns, visits] = await loadStats();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Resumen</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Contactos suscritos" value={subscribed} />
        <Stat label="Contactos en total" value={totalContacts} />
        <Stat label="Campañas enviadas" value={campaigns} />
        <Stat label="Visitas a la web (30 días)" value={visits} />
      </div>
      <p className="text-sm text-zinc-400">
        Las cifras de Finanzas (empresas inscritas, ingresos y vencimientos) aparecen aquí cuando se conecten
        KR POS y KR Citas.
      </p>
    </div>
  );
}
