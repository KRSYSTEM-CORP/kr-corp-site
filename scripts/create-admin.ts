// Crea el primer usuario dueño del panel. Se corre una vez, en tu terminal:
//   npx tsx scripts/create-admin.ts tu@correo.com "Tu Nombre"
// Pide la contraseña sin mostrarla en pantalla.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { hashPassword } from "../lib/admin/password";

const [email, ...nameParts] = process.argv.slice(2);
if (!email || nameParts.length === 0) {
  console.error('Uso: npx tsx scripts/create-admin.ts correo@ejemplo.com "Nombre"');
  process.exit(1);
}
let muted = false;
const out = new Writable({ write(chunk, _enc, cb) { if (!muted) process.stdout.write(chunk); cb(); } });
const rl = createInterface({ input: process.stdin, output: out, terminal: true });
process.stdout.write("Contraseña (mín. 10 caracteres): ");
muted = true;
rl.question("", async (password) => {
  muted = false;
  rl.close();
  process.stdout.write("\n");
  if (password.length < 10) { console.error("Muy corta."); process.exit(1); }
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.ADMIN_DIRECT_URL! }) });
  await db.adminUser.upsert({
    where: { email: email.toLowerCase() },
    create: { email: email.toLowerCase(), name: nameParts.join(" "), role: "OWNER", passwordHash: hashPassword(password) },
    update: { role: "OWNER", active: true, passwordHash: hashPassword(password), tokenVersion: { increment: 1 } },
  });
  console.log("Usuario dueño listo:", email.toLowerCase());
  await db.$disconnect();
});
