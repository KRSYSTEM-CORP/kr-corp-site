"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/admin/prisma";
import { requireAdmin } from "@/lib/admin/session";
import { parseTags } from "@/lib/admin/tags";
import type { FormState } from "@/lib/admin/actions/users";

const MAX_IMPORT = 5000;
const Email = z.string().trim().toLowerCase().email().max(254);

export async function importContacts(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const text = String(formData.get("list") ?? "");
  const tags = parseTags(String(formData.get("tags") ?? ""));
  const source = String(formData.get("source") ?? "manual").slice(0, 30) || "manual";

  const rows = new Map<string, { name: string | null; phone: string | null; company: string | null }>();
  let invalid = 0;
  for (const line of text.split(/\r?\n/).slice(0, MAX_IMPORT + 1)) {
    if (!line.trim()) continue;
    const [e, name, phone, company] = line.split(/[\t;,]/).map((c) => c.trim().replace(/^"|"$/g, ""));
    const email = Email.safeParse(e);
    if (!email.success) {
      if (!/^e-?mail|correo$/i.test(e ?? "")) invalid++; // header row is not an error
      continue;
    }
    rows.set(email.data, { name: name || null, phone: phone || null, company: company || null });
  }
  if (rows.size === 0) return { error: "No encontré ningún correo válido. Una persona por línea: correo, nombre, teléfono, empresa." };
  if (rows.size > MAX_IMPORT) return { error: `Máximo ${MAX_IMPORT} contactos por importación.` };

  const emails = [...rows.keys()];
  const existing = await db.contact.findMany({ where: { email: { in: emails } }, select: { email: true, tags: true } });
  const known = new Map(existing.map((c) => [c.email, c.tags]));

  const created = await db.contact.createMany({
    data: emails
      .filter((e) => !known.has(e))
      .map((email) => ({ email, ...rows.get(email)!, tags, source })),
    skipDuplicates: true,
  });
  // Existing contacts keep their data and status; only new tags are merged in.
  let merged = 0;
  if (tags.length) {
    for (const [email, old] of known) {
      const next = [...new Set([...old, ...tags])];
      if (next.length !== old.length) {
        await db.contact.update({ where: { email }, data: { tags: next } });
        merged++;
      }
    }
  }
  revalidatePath("/admin/contactos");
  return {
    error: null,
    ok: true,
    message: `${created.count} nuevos, ${known.size} ya existían${merged ? ` (${merged} con etiquetas nuevas)` : ""}${invalid ? `, ${invalid} líneas ignoradas` : ""}.`,
  };
}

export async function deleteContact(id: string) {
  await requireAdmin();
  await db.contact.delete({ where: { id } }).catch(() => undefined);
  revalidatePath("/admin/contactos");
}

export async function setContactStatus(id: string, status: "SUBSCRIBED" | "UNSUBSCRIBED") {
  await requireAdmin();
  await db.contact.update({ where: { id }, data: { status } });
  revalidatePath("/admin/contactos");
}
