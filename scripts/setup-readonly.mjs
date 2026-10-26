// Crea (o renueva) un usuario de SOLO LECTURA en las bases de KR POS y KR Citas
// para el módulo de Finanzas del panel. Se corre una vez, desde tu terminal:
//
//   node scripts/setup-readonly.mjs
//
// Qué hace, por sistema:
//  1. Se conecta como dueño (DIRECT_URL del .env de cada proyecto).
//  2. Crea el rol `admin_panel_ro` (sin escritura, sin saltarse la RLS) con una
//     contraseña aleatoria que NO se imprime.
//  3. Le da SELECT únicamente sobre empresas, usuarios (sin contraseñas ni
//     datos personales), pagos y reportes de pago — por columnas.
//  4. En las tablas con RLS agrega una política de solo lectura para ese rol.
//  5. Guarda la conexión en .env.local (POS_READONLY_URL / CITAS_READONLY_URL)
//     y comprueba que puede leer y que NO puede escribir.
import { readFileSync, appendFileSync, existsSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import pg from "pg";

const ROOT = resolve(import.meta.dirname, "..");
// Overrides used only to rehearse against a test database:
//   POS_ENV_FILE=... ONLY=pos OUT_ENV_FILE=... node scripts/setup-readonly.mjs
const OUT = process.env.OUT_ENV_FILE ?? resolve(ROOT, ".env.local");
const ONLY = process.env.ONLY; // "pos" | "citas"
const ROLE = "admin_panel_ro";

const SYSTEMS = [
  {
    name: "KR POS",
    envFile: process.env.POS_ENV_FILE ?? resolve(ROOT, "../APP NEW/.env"),
    envVar: "POS_READONLY_URL",
    grants: {
      Company: ["id", "name", "loginCode", "createdAt", "isExempt", "monthlyFeeUsdCents", "nextPaymentDueDate"],
      User: ["id", "companyId", "email", "role", "status", "isSuperAdmin", "createdAt"],
      Payment: ["id", "companyId", "amountUsdCents", "periodEnd", "createdAt"],
      PaymentReport: ["id", "companyId", "status", "isLifetime", "createdAt"],
      PaymentReportLine: ["id", "paymentReportId", "amountUsdCents"],
    },
    probe: 'SELECT count(*)::int AS n FROM "Company"',
    forbidden: `UPDATE "Company" SET name = name WHERE false`,
  },
  {
    name: "KR Citas",
    envFile: process.env.CITAS_ENV_FILE ?? resolve(ROOT, "../KYRA CITAS/.env"),
    envVar: "CITAS_READONLY_URL",
    grants: {
      Business: ["id", "name", "subdomain", "loginCode", "createdAt", "isExempt", "monthlyFeeUsdCents", "nextPaymentDueDate"],
      User: ["id", "businessId", "email", "role", "status", "createdAt"],
      Payment: ["id", "businessId", "amountUsdCents", "periodEnd", "createdAt"],
      PaymentReport: ["id", "businessId", "status", "createdAt"],
      PaymentReportLine: ["id", "paymentReportId", "amountUsdCents"],
    },
    probe: 'SELECT count(*)::int AS n FROM "Business"',
    forbidden: `UPDATE "Business" SET name = name WHERE false`,
  },
];

function readEnv(file) {
  if (!existsSync(file)) throw new Error(`No encuentro ${file}`);
  const env = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return env;
}

const q = (id) => `"${id.replace(/"/g, '""')}"`;
const results = [];

for (const sys of SYSTEMS) {
  if (ONLY && !sys.name.toLowerCase().replace(" ", "").includes(ONLY)) continue;
  const env = readEnv(sys.envFile);
  if (!env.DIRECT_URL || !env.DATABASE_URL) throw new Error(`${sys.name}: faltan DIRECT_URL/DATABASE_URL en su .env`);
  const password = randomBytes(24).toString("base64url");
  const owner = new pg.Client({ connectionString: env.DIRECT_URL, ssl: { rejectUnauthorized: true } });
  await owner.connect();
  try {
    await owner.query("BEGIN");
    const exists = (await owner.query("SELECT 1 FROM pg_roles WHERE rolname = $1", [ROLE])).rowCount > 0;
    // PASSWORD can't be parameterised in DDL; the value is base64url (safe chars).
    const opts = `LOGIN PASSWORD '${password}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS NOREPLICATION`;
    await owner.query(exists ? `ALTER ROLE ${ROLE} ${opts}` : `CREATE ROLE ${ROLE} ${opts}`);
    await owner.query(`ALTER ROLE ${ROLE} SET default_transaction_read_only = on`);
    await owner.query(`GRANT USAGE ON SCHEMA public TO ${ROLE}`);

    for (const [table, columns] of Object.entries(sys.grants)) {
      await owner.query(`REVOKE ALL ON ${q(table)} FROM ${ROLE}`);
      await owner.query(`GRANT SELECT (${columns.map(q).join(", ")}) ON ${q(table)} TO ${ROLE}`);
      const rls = await owner.query(
        "SELECT relrowsecurity FROM pg_class WHERE relname = $1 AND relnamespace = 'public'::regnamespace",
        [table]
      );
      if (rls.rows[0]?.relrowsecurity) {
        await owner.query(`DROP POLICY IF EXISTS admin_panel_ro_read ON ${q(table)}`);
        await owner.query(`CREATE POLICY admin_panel_ro_read ON ${q(table)} FOR SELECT TO ${ROLE} USING (true)`);
      }
    }
    await owner.query("COMMIT");
  } catch (err) {
    await owner.query("ROLLBACK");
    throw err;
  } finally {
    await owner.end();
  }

  // Same host as the app's pooled URL, different user/password.
  const u = new URL(env.DATABASE_URL);
  u.username = ROLE;
  u.password = password;
  u.search = "sslmode=require";
  const url = u.toString();

  // Verify: can read, cannot write.
  const ro = new pg.Client({ connectionString: url });
  await ro.connect();
  let canRead = false;
  let blocked = false;
  let count = 0;
  try {
    count = (await ro.query(sys.probe)).rows[0].n;
    canRead = true;
    try {
      await ro.query(sys.forbidden);
    } catch {
      blocked = true;
    }
  } finally {
    await ro.end();
  }
  if (!canRead || !blocked) throw new Error(`${sys.name}: la verificación falló (leer=${canRead}, escritura bloqueada=${blocked})`);

  // Replace any previous value of this variable, then append.
  const envLocal = OUT;
  const prev = existsSync(envLocal) ? readFileSync(envLocal, "utf8").split("\n").filter((l) => !l.startsWith(sys.envVar + "=")) : [];
  writeFileSync(envLocal, prev.filter((l, i, a) => l !== "" || i < a.length - 1).join("\n").replace(/\n*$/, "\n"));
  appendFileSync(envLocal, `${sys.envVar}="${url}"\n`);
  results.push(`${sys.name}: OK — lee ${count} empresas, la escritura está bloqueada. Guardado como ${sys.envVar}.`);
}

console.log("\n" + results.join("\n"));
console.log("\nLas conexiones quedaron en .env.local (no se muestran). Falta copiarlas a Vercel.");
