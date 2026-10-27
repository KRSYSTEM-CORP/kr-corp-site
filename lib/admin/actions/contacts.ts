"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/admin/prisma";
import { requireAdmin } from "@/lib/admin/session";
import { KINDS, kindOf, parseTags, withKind, type Kind } from "@/lib/admin/tags";
import type { FormState } from "@/lib/admin/actions/users";

const MAX_IMPORT = 5000;
const Email = z.string().trim().toLowerCase().email().max(254);
const asKind = (v: FormDataEntryValue | null): Kind | null => (typeof v === "string" && v in KINDS ? (v as Kind) : null);

type Row = { name: string | null; phone: string | null; company: string | null; kind?: Kind };

// Adds new contacts and updates the ones that already exist (name/phone/company
// when the file brings them, and the "tipo"). Nothing is ever deleted here.
async function upsertMany(rows: Map<string, Row>, kind: Kind | null, extraTags: string[], source: string) {
  const emails = [...rows.keys()];
  const existing = await db.contact.findMany({ where: { email: { in: emails } } });
  const known = new Map(existing.map((c) => [c.email, c]));

  const created = await db.contact.createMany({
    data: emails
      .filter((e) => !known.has(e))
      .map((email) => {
        const { kind: rowKind, ...r } = rows.get(email)!;
        return { email, ...r, tags: withKind(extraTags, rowKind ?? kind), source };
      }),
    skipDuplicates: true,
  });

  let updated = 0;
  let same = 0;
  for (const [email, c] of known) {
    const r = rows.get(email)!;
    const tags = withKind([...new Set([...c.tags.filter((t) => !(t in KINDS)), ...extraTags])], r.kind ?? kind ?? kindOf(c.tags));
    const data = {
      name: r.name ?? c.name,
      phone: r.phone ?? c.phone,
      company: r.company ?? c.company,
      tags,
    };
    const changed =
      data.name !== c.name || data.phone !== c.phone || data.company !== c.company || tags.join() !== c.tags.join();
    if (!changed) same++;
    else {
      await db.contact.update({ where: { email }, data });
      updated++;
    }
  }
  return { added: created.count, updated, same };
}

function parseLines(text: string) {
  const rows = new Map<string, Row>();
  let bad = 0;
  for (const line of text.split(/\r?\n/).slice(0, MAX_IMPORT + 1)) {
    if (!line.trim()) continue;
    const cells = line.split(/[\t;,]/).map((c) => c.trim().replace(/^"|"$/g, ""));
    // Accept "correo, nombre" and "nombre, correo": the cell that is an email wins.
    const i = cells.findIndex((c) => Email.safeParse(c).success);
    if (i === -1) {
      if (!/e-?mail|correo/i.test(line)) bad++; // header row is not an error
      continue;
    }
    let rest = cells.filter((_, j) => j !== i);
    const k = rest.findIndex((c) => c.toLowerCase() in KINDS);
    const kind = k === -1 ? undefined : (rest[k].toLowerCase() as Kind);
    if (k !== -1) rest = rest.filter((_, j) => j !== k);
    rows.set(Email.parse(cells[i]), { name: rest[0] || null, phone: rest[1] || null, company: rest[2] || null, kind });
  }
  return { rows, bad };
}

export async function importContacts(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const { rows, bad } = parseLines(String(formData.get("list") ?? ""));
  if (rows.size === 0) return { error: "No encontré ningún correo válido. Una línea por persona: «Nombre, correo» o solo el correo." };
  if (rows.size > MAX_IMPORT) return { error: `Máximo ${MAX_IMPORT} correos por carga.` };
  const r = await upsertMany(rows, asKind(formData.get("kind")), parseTags(String(formData.get("tags") ?? "")), String(formData.get("source") ?? "manual").slice(0, 30));
  revalidatePath("/admin/contactos");
  return {
    error: null,
    ok: true,
    message: `${r.added} nuevos, ${r.updated} actualizados, ${r.same} sin cambios${bad ? `, ${bad} líneas descartadas` : ""}.`,
  };
}

export async function addContact(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const email = Email.safeParse(formData.get("email"));
  if (!email.success) return { error: "Escribe un correo válido." };
  const name = String(formData.get("name") ?? "").trim() || null;
  const r = await upsertMany(new Map([[email.data, { name, phone: null, company: null }]]), asKind(formData.get("kind")), [], "manual");
  revalidatePath("/admin/contactos");
  return { error: null, ok: true, message: r.added ? "Correo agregado." : "Ese correo ya existía; se actualizó." };
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
