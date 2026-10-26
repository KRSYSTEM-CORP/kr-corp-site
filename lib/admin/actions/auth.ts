"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/admin/prisma";
import { verifyPassword } from "@/lib/admin/password";
import { endSession, startSession } from "@/lib/admin/session";

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Correo inválido"),
  password: z.string().min(1, "Escribe tu contraseña"),
});

export type LoginState = { error: string | null };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const user = await db.adminUser.findUnique({ where: { email: parsed.data.email } });
  // Same answer and similar time whether the user exists or not.
  const ok = user?.active && verifyPassword(parsed.data.password, user.passwordHash);
  if (!user || !ok) {
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
