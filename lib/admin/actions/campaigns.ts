"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/admin/prisma";
import { requireAdmin } from "@/lib/admin/session";
import { BATCH_SIZE, mailgunConfigured, messageToHtml, sendBatch, type Flyer } from "@/lib/admin/mailgun";
import { unsubscribeUrl } from "@/lib/admin/unsubscribe";
import type { FormState } from "@/lib/admin/actions/users";

const MAX_AUDIENCE = 3000; // one send must finish inside the function time limit

export async function audienceFor(tags: string[]) {
  return db.contact.findMany({
    where: { status: "SUBSCRIBED", ...(tags.length ? { tags: { hasEvery: tags } } : {}) },
    select: { id: true, email: true, name: true, unsubscribeToken: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function sendTest(campaignId: string): Promise<void> {
  const admin = await requireAdmin();
  const c = await db.campaign.findUnique({ where: { id: campaignId } });
  if (!c || !mailgunConfigured()) return;
  await sendBatch({
    subject: `[Prueba] ${c.subject}`,
    html: c.html,
    campaignId: c.id,
    recipients: [{ email: admin.email, name: admin.name, unsubscribeUrl: unsubscribeUrl("prueba") }],
  });
  revalidatePath(`/admin/campanas/${campaignId}`);
}

export async function sendCampaign(campaignId: string): Promise<void> {
  await requireAdmin();
  if (!mailgunConfigured()) return;
  // Atomic claim: a double click or a second tab cannot send twice.
  const claimed = await db.campaign.updateMany({ where: { id: campaignId, status: "DRAFT" }, data: { status: "SENDING" } });
  if (claimed.count === 0) return;

  const c = await db.campaign.findUniqueOrThrow({ where: { id: campaignId } });
  const audience = await audienceFor(c.tags);
  if (audience.length === 0 || audience.length > MAX_AUDIENCE) {
    await db.campaign.update({ where: { id: c.id }, data: { status: "DRAFT" } });
    return;
  }
  await db.campaignRecipient.createMany({
    data: audience.map((a) => ({ campaignId: c.id, contactId: a.id })),
    skipDuplicates: true,
  });

  for (let i = 0; i < audience.length; i += BATCH_SIZE) {
    const batch = audience.slice(i, i + BATCH_SIZE);
    const ids = batch.map((b) => b.id);
    try {
      const messageId = await sendBatch({
        subject: c.subject,
        html: c.html,
        campaignId: c.id,
        recipients: batch.map((b) => ({ email: b.email, name: b.name, unsubscribeUrl: unsubscribeUrl(b.unsubscribeToken) })),
      });
      await db.campaignRecipient.updateMany({
        where: { campaignId: c.id, contactId: { in: ids } },
        data: { sentAt: new Date(), mailgunMessageId: messageId },
      });
    } catch (err) {
      await db.campaignRecipient.updateMany({
        where: { campaignId: c.id, contactId: { in: ids } },
        data: { failedAt: new Date(), error: err instanceof Error ? err.message.slice(0, 200) : "error" },
      });
    }
  }
  await db.campaign.update({ where: { id: c.id }, data: { status: "SENT", sentAt: new Date() } });
  revalidatePath(`/admin/campanas/${c.id}`);
  revalidatePath("/admin/campanas");
}

export async function deleteDraft(campaignId: string): Promise<void> {
  await requireAdmin();
  await db.campaign.deleteMany({ where: { id: campaignId, status: "DRAFT" } });
  redirect("/admin/campanas");
}

const Mass = z.object({
  subject: z.string().trim().min(2, "Escribe el asunto").max(200),
  message: z.string().trim().min(2, "Escribe el mensaje").max(20_000),
});
const FLYER_TYPES = ["image/png", "image/jpeg", "image/webp"];

// Compose + send in one step (same flow as the Laboratorio Planet panel).
export async function sendMassMail(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  if (!mailgunConfigured()) return { error: "Mailgun aún no está configurado en Vercel (MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM)." };
  const parsed = Mass.safeParse({ subject: formData.get("subject"), message: formData.get("message") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  let flyer: Flyer | undefined;
  const file = formData.get("flyer");
  if (file instanceof File && file.size > 0) {
    if (!FLYER_TYPES.includes(file.type)) return { error: "La imagen debe ser PNG, JPG o WebP." };
    if (file.size > 3 * 1024 * 1024) return { error: "La imagen pesa más de 3 MB." };
    flyer = { data: new Uint8Array(await file.arrayBuffer()), type: file.type };
  }
  const html = messageToHtml(parsed.data.message, !!flyer);

  if (formData.get("test") === "1") {
    try {
      await sendBatch({
        subject: `[Prueba] ${parsed.data.subject}`,
        html,
        campaignId: "prueba",
        flyer,
        recipients: [{ email: admin.email, name: admin.name, unsubscribeUrl: unsubscribeUrl("prueba") }],
      });
    } catch {
      return { error: "Mailgun no aceptó la prueba. Revisa la clave y el dominio." };
    }
    return { error: null, ok: true, message: `Prueba enviada a ${admin.email}.` };
  }

  let ids: string[] = [];
  try {
    ids = z.array(z.string()).max(MAX_AUDIENCE).parse(JSON.parse(String(formData.get("ids") ?? "[]")));
  } catch {
    return { error: "Elige los destinatarios de nuevo." };
  }
  if (ids.length === 0) return { error: "Elige al menos un destinatario." };

  // Only people who are still subscribed, whatever the browser sent.
  const audience = await db.contact.findMany({
    where: { id: { in: ids }, status: "SUBSCRIBED" },
    select: { id: true, email: true, name: true, unsubscribeToken: true },
  });
  if (audience.length === 0) return { error: "Ninguno de los elegidos está suscrito." };

  const c = await db.campaign.create({
    data: { name: parsed.data.subject, subject: parsed.data.subject, html, status: "SENDING", createdById: admin.id },
  });
  await db.campaignRecipient.createMany({ data: audience.map((a) => ({ campaignId: c.id, contactId: a.id })) });

  let sent = 0;
  let failed = 0;
  for (let i = 0; i < audience.length; i += BATCH_SIZE) {
    const batch = audience.slice(i, i + BATCH_SIZE);
    const ids2 = batch.map((b) => b.id);
    try {
      const messageId = await sendBatch({
        subject: c.subject,
        html,
        campaignId: c.id,
        flyer,
        recipients: batch.map((b) => ({ email: b.email, name: b.name, unsubscribeUrl: unsubscribeUrl(b.unsubscribeToken) })),
      });
      await db.campaignRecipient.updateMany({ where: { campaignId: c.id, contactId: { in: ids2 } }, data: { sentAt: new Date(), mailgunMessageId: messageId } });
      sent += batch.length;
    } catch (err) {
      await db.campaignRecipient.updateMany({
        where: { campaignId: c.id, contactId: { in: ids2 } },
        data: { failedAt: new Date(), error: err instanceof Error ? err.message.slice(0, 200) : "error" },
      });
      failed += batch.length;
    }
  }
  await db.campaign.update({ where: { id: c.id }, data: { status: "SENT", sentAt: new Date() } });
  revalidatePath("/admin/campanas");
  return failed
    ? { error: `Se enviaron ${sent} y fallaron ${failed}. Revisa Mailgun.`, message: String(sent) }
    : { error: null, ok: true, message: `Enviado a ${sent} destinatarios.` };
}
