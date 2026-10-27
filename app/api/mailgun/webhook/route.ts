import { db } from "@/lib/admin/prisma";
import { verifyWebhook } from "@/lib/admin/mailgun";

// Mailgun → delivered / opened / clicked / failed / complained / unsubscribed.
// The signature is checked before the body is used for anything.
type Payload = {
  signature?: { timestamp?: string; token?: string; signature?: string };
  "event-data"?: {
    event?: string;
    severity?: string;
    recipient?: string;
    "user-variables"?: { campaign_id?: string };
  };
};

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!verifyWebhook(body.signature ?? {})) return new Response(null, { status: 401 });

  const ev = body["event-data"];
  const email = ev?.recipient?.toLowerCase();
  const campaignId = ev?.["user-variables"]?.campaign_id;
  if (!ev?.event || !email) return new Response(null, { status: 200 });

  const now = new Date();
  const where = { campaignId: campaignId ?? "", contact: { email } };
  switch (ev.event) {
    case "delivered":
      if (campaignId) await db.campaignRecipient.updateMany({ where, data: { deliveredAt: now } });
      break;
    case "opened":
      if (campaignId) await db.campaignRecipient.updateMany({ where: { ...where, openedAt: null }, data: { openedAt: now } });
      break;
    case "clicked":
      if (campaignId) await db.campaignRecipient.updateMany({ where: { ...where, clickedAt: null }, data: { clickedAt: now } });
      break;
    case "failed":
      if (campaignId) await db.campaignRecipient.updateMany({ where, data: { failedAt: now, error: ev.severity ?? "failed" } });
      if (ev.severity === "permanent") await db.contact.updateMany({ where: { email }, data: { status: "BOUNCED" } });
      break;
    case "complained":
    case "unsubscribed":
      await db.contact.updateMany({ where: { email }, data: { status: "UNSUBSCRIBED" } });
      break;
  }
  return new Response(null, { status: 200 });
}
