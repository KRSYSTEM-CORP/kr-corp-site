"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/admin/prisma";
import { verifyPassword } from "@/lib/admin/password";
import { endSession, startSession } from "@/lib/admin/session";

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Correo inválido"),
  password: z.string().min(1, "Escribe tu contraseña"),
});

// Límite GLOBAL de intentos (guardado en la base): 8 fallos cada 15 minutos por IP y por correo.
// Si la base del límite falla, se deja pasar (el login ya exige contraseña) en vez de bloquear al equipo.
const WINDOW_MIN = 15;
const MAX_FAILS = 8;
async function isBlocked(keys: string[]): Promise<boolean> {
  try {
    const rows = await db.loginAttempt.findMany({ where: { key: { in: keys } } });
    return rows.some((r) => r.count >= MAX_FAILS && Date.now() - r.windowStart.getTime() < WINDOW_MIN * 60_000);
  } catch {
    return false;
  }
}
async function recordFail(keys: string[]) {
  try {
    for (const k of keys) {
      await db.$executeRaw`INSERT INTO "LoginAttempt" ("key", "count", "windowStart") VALUES (${k}, 1, now())
        ON CONFLICT ("key") DO UPDATE SET
          "count" = CASE WHEN "LoginAttempt"."windowStart" < now() - make_interval(mins => ${WINDOW_MIN}) THEN 1 ELSE "LoginAttempt"."count" + 1 END,
          "windowStart" = CASE WHEN "LoginAttempt"."windowStart" < now() - make_interval(mins => ${WINDOW_MIN}) THEN now() ELSE "LoginAttempt"."windowStart" END`;
    }
  } catch {
    /* sin límite si la base falla */
  }
}

export type LoginState = { error: string | null };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const keys = [`ip:${ip}`, `em:${parsed.data.email}`];
  if (await isBlocked(keys)) return { error: "Demasiados intentos. Espera 15 minutos e inténtalo de nuevo." };

  const user = await db.adminUser.findUnique({ where: { email: parsed.data.email } });
  // Same answer and similar time whether the user exists or not.
  const ok = user?.active && verifyPassword(parsed.data.password, user.passwordHash);
  if (!user || !ok) {
    await recordFail(keys);
    await new Promise((r) => setTimeout(r, 600));
    return { error: "Correo o contraseña incorrectos" };
  }

  await db.loginAttempt.deleteMany({ where: { key: keys[1] } }).catch(() => {});
  await db.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await startSession(user.id, user.tokenVersion);
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}
