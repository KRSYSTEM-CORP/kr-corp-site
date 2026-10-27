import { loadSystems, usd, type AccountState } from "@/lib/admin/systems";

export const dynamic = "force-dynamic";

const STATE: Record<AccountState, { label: string; cls: string }> = {
  current: { label: "Al día", cls: "bg-emerald-500/15 text-emerald-300" },
  trial: { label: "En prueba", cls: "bg-sky-500/15 text-sky-300" },
  grace: { label: "En gracia", cls: "bg-amber-500/15 text-amber-300" },
  overdue: { label: "Vencida", cls: "bg-red-500/15 text-red-300" },
  exempt: { label: "Exenta", cls: "bg-zinc-500/20 text-zinc-300" },
};

const date = (d: Date | null) =>
  d ? new Intl.DateTimeFormat("es-VE", { day: "2-digit", month: "short", year: "numeric" }).format(d) : "—";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export default async function FinanzasPage() {
  const systems = await loadSystems();
  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-2xl font-semibold">Finanzas</h1>
      {systems.map((s) => {
        if (s.status !== "ok") {
          return (
            <section key={s.key} className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">{s.label}</h2>
              <p className="text-sm text-zinc-400">
                {s.status === "unconfigured"
                  ? "Sin conexión configurada todavía (falta la variable de solo lectura en Vercel)."
                  : "No se pudo leer ahora mismo. Reintenta en un momento."}
              </p>
            </section>
          );
        }
        const d = s.data;
        const count = (st: AccountState) => d.accounts.filter((a) => a.state === st).length;
        return (
          <section key={s.key} className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">{d.label}</h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat label="Empresas inscritas" value={d.accounts.length} />
              <Stat label="Al día / en prueba" value={`${count("current")} / ${count("trial")}`} />
              <Stat label="En gracia / vencidas" value={`${count("grace")} / ${count("overdue")}`} />
              <Stat label="Pagos por revisar" value={d.pendingReports} />
              <Stat label="Cobrado este mes" value={usd(d.revenueMonthUsdCents)} />
              <Stat label="Cobrado en total" value={usd(d.revenueTotalUsdCents)} />
              <Stat label="Ingreso mensual recurrente" value={usd(d.mrrUsdCents)} />
              <Stat label="Exentas" value={count("exempt")} />
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900 text-xs text-zinc-400">
                  <tr>
                    <th className="px-3 py-2 font-medium">Empresa</th>
                    <th className="px-3 py-2 font-medium">Estado</th>
                    <th className="px-3 py-2 font-medium">Cuota</th>
                    <th className="px-3 py-2 font-medium">Vence</th>
                    <th className="px-3 py-2 font-medium">Último pago</th>
                    <th className="px-3 py-2 font-medium text-right">Pagado</th>
                    <th className="px-3 py-2 font-medium text-right">Usuarios</th>
                    <th className="px-3 py-2 font-medium">Alta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {d.accounts.map((a) => (
                    <tr key={a.id}>
                      <td className="px-3 py-2 font-medium">{a.name}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${STATE[a.state].cls}`}>{STATE[a.state].label}</span>
                      </td>
                      <td className="px-3 py-2 tabular-nums">{usd(a.monthlyFeeUsdCents)}</td>
                      <td className="px-3 py-2">{date(a.dueDate)}</td>
                      <td className="px-3 py-2">{date(a.lastPaymentAt)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{usd(a.paidUsdCents)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{a.users}</td>
                      <td className="px-3 py-2">{date(a.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {d.payments.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-zinc-300">Últimos pagos</h3>
                <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 text-sm">
                  {d.payments.map((p, i) => (
                    <li key={i} className="flex items-center justify-between px-3 py-2">
                      <span>{p.account}</span>
                      <span className="tabular-nums text-zinc-300">
                        {usd(p.amountUsdCents)} · {date(p.at)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
