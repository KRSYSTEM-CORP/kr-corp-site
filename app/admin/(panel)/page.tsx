import { db } from "@/lib/admin/prisma";
import { loadSystems, usd } from "@/lib/admin/systems";

export const dynamic = "force-dynamic";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

const DAY = 24 * 3600 * 1000;

async function loadStats() {
  const since30 = new Date(Date.now() - 30 * DAY);
  const since7 = new Date(Date.now() - 7 * DAY);
  const [subscribed, totalContacts, campaigns, visits30, visits7, cta30, contact30, daily, sources] = await Promise.all([
    db.contact.count({ where: { status: "SUBSCRIBED" } }),
    db.contact.count(),
    db.campaign.count({ where: { status: "SENT" } }),
    db.webEvent.count({ where: { type: "visit", createdAt: { gte: since30 } } }),
    db.webEvent.count({ where: { type: "visit", createdAt: { gte: since7 } } }),
    db.webEvent.count({ where: { type: "cta", createdAt: { gte: since30 } } }),
    db.webEvent.count({ where: { type: "contact", createdAt: { gte: since30 } } }),
    db.$queryRaw<{ d: Date; n: bigint }[]>`
      SELECT date_trunc('day', "createdAt") AS d, count(*)::bigint AS n
      FROM "WebEvent" WHERE type = 'visit' AND "createdAt" >= ${new Date(Date.now() - 14 * DAY)}
      GROUP BY 1 ORDER BY 1`,
    db.$queryRaw<{ s: string; n: bigint }[]>`
      SELECT coalesce(nullif("utmSource", ''), nullif(referrer, ''), 'Directo') AS s, count(*)::bigint AS n
      FROM "WebEvent" WHERE type = 'visit' AND "createdAt" >= ${since30}
      GROUP BY 1 ORDER BY 2 DESC LIMIT 6`,
  ]);
  const days = Array.from({ length: 14 }, (_, i) => {
    const key = new Date(Date.now() - (13 - i) * DAY).toISOString().slice(0, 10);
    const n = Number(daily.find((r) => r.d.toISOString().slice(0, 10) === key)?.n ?? 0);
    return { key, n };
  });
  const peak = Math.max(1, ...days.map((d) => d.n));
  return { subscribed, totalContacts, campaigns, visits30, visits7, cta30, contact30, days, peak, sources };
}

export default async function AdminHome() {
  const [web, systems] = await Promise.all([loadStats(), loadSystems()]);
  const { subscribed, totalContacts, campaigns } = web;
  const { days, peak } = web;
  const ok = systems.flatMap((s) => (s.status === "ok" ? [s.data] : []));
  const companies = ok.reduce((n, d) => n + d.accounts.length, 0);
  const overdue = ok.reduce((n, d) => n + d.accounts.filter((a) => a.state === "overdue").length, 0);
  const month = ok.reduce((n, d) => n + d.revenueMonthUsdCents, 0);
  const mrr = ok.reduce((n, d) => n + d.mrrUsdCents, 0);
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Resumen</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Contactos suscritos" value={subscribed} />
        <Stat label="Contactos en total" value={totalContacts} />
        <Stat label="Campañas enviadas" value={campaigns} />
        <Stat label="Visitas a la web (30 días)" value={web.visits30} />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Empresas inscritas" value={companies} />
        <Stat label="Vencidas" value={overdue} />
        <Stat label="Cobrado este mes" value={usd(month)} />
        <Stat label="Ingreso mensual recurrente" value={usd(mrr)} />
      </div>
      <section className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-lg font-bold">Visitas y clics de la web</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Visitas (7 días)" value={web.visits7} />
          <Stat label="Visitas (30 días)" value={web.visits30} />
          <Stat label="Clics en «Contacto» (30 días)" value={web.cta30} />
          <Stat label="Clics en WhatsApp / correo / teléfono (30 días)" value={web.contact30} />
        </div>
        <div>
          <p className="mb-2 text-xs text-zinc-400">Visitas por día, últimos 14 días</p>
          <div className="flex h-28 items-end gap-1" role="img" aria-label="Gráfico de visitas por día">
            {days.map((d) => (
              <div key={d.key} className="flex flex-1 flex-col items-center justify-end gap-1" title={`${d.key}: ${d.n}`}>
                <div className="w-full rounded-t bg-[#c80000]" style={{ height: `${Math.max(3, (d.n / peak) * 100)}%`, opacity: d.n ? 1 : 0.25 }} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs text-zinc-400">De dónde llegan (30 días)</p>
          {web.sources.length === 0 ? (
            <p className="text-sm text-zinc-400">Aún no hay visitas registradas.</p>
          ) : (
            <ul className="divide-y divide-zinc-800 text-sm">
              {web.sources.map((s) => (
                <li key={s.s} className="flex justify-between py-1.5">
                  <span>{s.s}</span>
                  <span className="tabular-nums text-zinc-300">{Number(s.n)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
