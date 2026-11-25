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

// Límite de intentos por IP y por correo: 8 fallos cada 15 minutos (por instancia).
const fails = new Map<string, { n: number; t: number }>();
const WINDOW = 15 * 60_000;
const MAX_FAILS = 8;
const blocked = (k: string) => {
  const f = fails.get(k);
  return !!f && Date.now() - f.t < WINDOW && f.n >= MAX_FAILS;
};
const fail = (k: string) => {
  const f = fails.get(k);
  if (fails.size > 5000) fails.clear();
  fails.set(k, !f || Date.now() - f.t >= WINDOW ? { n: 1, t: Date.now() } : { n: f.n + 1, t: f.t });
};

export type LoginState = { error: string | null };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const keys = [`ip:${ip}`, `em:${parsed.data.email}`];
  if (keys.some(blocked)) return { error: "Demasiados intentos. Espera 15 minutos e inténtalo de nuevo." };

  const user = await db.adminUser.findUnique({ where: { email: parsed.data.email } });
  // Same answer and similar time whether the user exists or not.
  const ok = user?.active && verifyPassword(parsed.data.password, user.passwordHash);
  if (!user || !ok) {
    keys.forEach(fail);
    await new Promise((r) => setTimeout(r, 600));
    return { error: "Correo o contraseña incorrectos" };
  }

  await db.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await startSession(user.id, user.tokenVersion);
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}
