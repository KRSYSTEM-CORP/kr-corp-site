import "server-only";
import { Pool } from "pg";

// Read-only views over each product's database (role admin_panel_ro, SELECT on
// a few columns only). Nothing here can write; see scripts/setup-readonly.mjs.

const TRIAL_DAYS = 14;
const GRACE_DAYS = 5;
const DAY = 24 * 3600 * 1000;

export type AccountState = "exempt" | "trial" | "current" | "grace" | "overdue";

export type SystemAccount = {
  id: string;
  name: string;
  createdAt: Date;
  state: AccountState;
  monthlyFeeUsdCents: number;
  dueDate: Date | null;
  lastPaymentAt: Date | null;
  paidUsdCents: number;
  users: number;
};

export type SystemPayment = { account: string; amountUsdCents: number; at: Date };

export type SystemSnapshot = {
  key: "pos" | "citas";
  label: string;
  accounts: SystemAccount[];
  payments: SystemPayment[];
  pendingReports: number;
  revenueMonthUsdCents: number;
  revenueTotalUsdCents: number;
  mrrUsdCents: number;
};

type SystemDef = {
  key: "pos" | "citas";
  label: string;
  envVar: string;
  table: string;
  fk: string;
};

const SYSTEMS: SystemDef[] = [
  { key: "pos", label: "KR POS", envVar: "POS_READONLY_URL", table: "Company", fk: "companyId" },
  { key: "citas", label: "KR Citas", envVar: "CITAS_READONLY_URL", table: "Business", fk: "businessId" },
];

const pools = new Map<string, Pool>();
function poolFor(def: SystemDef): Pool | null {
  const url = process.env[def.envVar];
  if (!url) return null;
  let pool = pools.get(def.key);
  if (!pool) {
    pool = new Pool({ connectionString: url, max: 2, idleTimeoutMillis: 10_000, connectionTimeoutMillis: 8_000 });
    pools.set(def.key, pool);
  }
  return pool;
}

export function accountState(
  a: { isExempt: boolean; createdAt: Date; nextPaymentDueDate: Date | null; hasPaid: boolean },
  now = new Date()
): AccountState {
  if (a.isExempt) return "exempt";
  const due = a.nextPaymentDueDate ?? new Date(a.createdAt.getTime() + TRIAL_DAYS * DAY);
  if (now.getTime() > due.getTime() + GRACE_DAYS * DAY) return "overdue";
  if (now.getTime() > due.getTime()) return "grace";
  return a.hasPaid ? "current" : "trial";
}

async function load(def: SystemDef): Promise<SystemSnapshot | null> {
  const pool = poolFor(def);
  if (!pool) return null;
  const { table, fk } = def;

  const [companies, paid, users, recent, pending] = await Promise.all([
    pool.query(
      `SELECT id, name, "createdAt", "isExempt", "monthlyFeeUsdCents", "nextPaymentDueDate" FROM "${table}" ORDER BY "createdAt" DESC`
    ),
    pool.query(
      `SELECT "${fk}" AS owner, count(*)::int AS n, coalesce(sum("amountUsdCents"),0)::int AS total, max("createdAt") AS last FROM "Payment" GROUP BY "${fk}"`
    ),
    pool.query(`SELECT "${fk}" AS owner, count(*)::int AS n FROM "User" GROUP BY "${fk}"`),
    pool.query(`SELECT "${fk}" AS owner, "amountUsdCents", "createdAt" FROM "Payment" ORDER BY "createdAt" DESC LIMIT 15`),
    pool.query(`SELECT count(*)::int AS n FROM "PaymentReport" WHERE status = 'PENDING'`),
  ]);

  const paidBy = new Map(paid.rows.map((r) => [r.owner as string, r]));
  const usersBy = new Map(users.rows.map((r) => [r.owner as string, r.n as number]));
  const names = new Map(companies.rows.map((r) => [r.id as string, r.name as string]));
  const now = new Date();

  const accounts: SystemAccount[] = companies.rows.map((c) => {
    const p = paidBy.get(c.id);
    return {
      id: c.id,
      name: c.name,
      createdAt: c.createdAt,
      state: accountState({ ...c, hasPaid: !!p }, now),
      monthlyFeeUsdCents: c.monthlyFeeUsdCents ?? 0,
      dueDate: c.nextPaymentDueDate,
      lastPaymentAt: p?.last ?? null,
      paidUsdCents: p?.total ?? 0,
      users: usersBy.get(c.id) ?? 0,
    };
  });

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const month = await pool.query(
    `SELECT coalesce(sum("amountUsdCents"),0)::int AS total FROM "Payment" WHERE "createdAt" >= $1`,
    [monthStart]
  );

  return {
    key: def.key,
    label: def.label,
    accounts,
    payments: recent.rows.map((r) => ({
      account: names.get(r.owner) ?? "—",
      amountUsdCents: r.amountUsdCents,
      at: r.createdAt,
    })),
    pendingReports: pending.rows[0]?.n ?? 0,
    revenueMonthUsdCents: month.rows[0].total,
    revenueTotalUsdCents: accounts.reduce((s, a) => s + a.paidUsdCents, 0),
    mrrUsdCents: accounts
      .filter((a) => a.state === "current" || a.state === "grace")
      .reduce((s, a) => s + a.monthlyFeeUsdCents, 0),
  };
}

export type SystemResult =
  | { key: string; label: string; status: "ok"; data: SystemSnapshot }
  | { key: string; label: string; status: "unconfigured" }
  | { key: string; label: string; status: "error" };

// One system failing never takes the others down.
export async function loadSystems(): Promise<SystemResult[]> {
  return Promise.all(
    SYSTEMS.map(async (def): Promise<SystemResult> => {
      try {
        const data = await load(def);
        return data
          ? { key: def.key, label: def.label, status: "ok", data }
          : { key: def.key, label: def.label, status: "unconfigured" };
      } catch (err) {
        console.error(`[admin] ${def.label} read failed`, err instanceof Error ? err.message : err);
        return { key: def.key, label: def.label, status: "error" };
      }
    })
  );
}

export function usd(cents: number) {
  return new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" }).format(cents / 100);
}
