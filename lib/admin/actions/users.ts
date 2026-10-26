"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/admin/prisma";
import { hashPassword } from "@/lib/admin/password";
import { requireOwner } from "@/lib/admin/session";

const NewUser = z.object({
  name: z.string().trim().min(2, "Escribe el nombre"),
  email: z.string().trim().toLowerCase().email("Correo inválido"),
  password: z.string().min(10, "La contraseña debe tener al menos 10 caracteres"),
  role: z.enum(["OWNER", "STAFF"]),
});

export type FormState = { error: string | null; ok?: boolean };

export async function createAdminUser(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireOwner();
  const parsed = NewUser.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const exists = await db.adminUser.findUnique({ where: { email: parsed.data.email } });
  if (exists) return { error: "Ya existe un usuario con ese correo" };
  await db.adminUser.create({
    data: { name: parsed.data.name, email: parsed.data.email, role: parsed.data.role, passwordHash: hashPassword(parsed.data.password) },
  });
  revalidatePath("/admin/usuarios");
  return { error: null, ok: true };
}

export async function setAdminUserActive(userId: string, active: boolean) {
  const me = await requireOwner();
  if (userId === me.id) return;
  // Bumping tokenVersion ends any open session right away.
  await db.adminUser.update({ where: { id: userId }, data: { active, tokenVersion: { increment: 1 } } });
  revalidatePath("/admin/usuarios");
}
