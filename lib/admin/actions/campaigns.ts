"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/admin/prisma";
import { requireAdmin } from "@/lib/admin/session";
import { parseTags } from "@/lib/admin/actions/contacts";
import { BATCH_SIZE, mailgunConfigured, sendBatch } from "@/lib/admin/mailgun";
import { unsubscribeUrl } from "@/lib/admin/unsubscribe";
import type { FormState } from "@/lib/admin/actions/users";

const MAX_AUDIENCE = 3000; // one send must finish inside the function time limit

const Draft = z.object({
  name: z.string().trim().min(2, "Ponle un nombre interno").max(120),
  subject: z.string().trim().min(2, "Escribe el asunto").max(200),
  html: z.string().trim().min(10, "Escribe el contenido del correo").max(200_000),
});

export async function createCampaign(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = Draft.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const c = await db.campaign.create({
    data: { ...parsed.data, tags: parseTags(String(formData.get("tags") ?? "")), createdById: admin.id },
  });
  redirect(`/admin/campanas/${c.id}`);
}

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
