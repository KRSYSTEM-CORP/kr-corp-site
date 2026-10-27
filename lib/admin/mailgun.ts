import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

// Thin Mailgun client. Config comes from env only:
//   MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_REGION (us|eu),
//   MAILGUN_WEBHOOK_SIGNING_KEY (for the stats webhook).

// Every message leaves as contacto@ (replies land there too), signed by the
// mg. sending domain; the From domain aligns with it for DMARC.
export const MAIL_FROM = "KR System <contacto@krsystem-corp.com>";
export const MAIL_REPLY_TO = "contacto@krsystem-corp.com";

export function mailgunConfigured(): boolean {
  return !!(process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN);
}

export type Recipient = { email: string; name: string | null; unsubscribeUrl: string };

export const BATCH_SIZE = 500; // Mailgun allows up to 1000 per batch call

// {{nombre}} in the campaign → Mailgun recipient variable.
export function personalize(html: string): string {
  return html.replace(/\{\{\s*nombre\s*\}\}/gi, "%recipient.name%");
}

const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Plain message → simple, readable HTML email (paragraphs, optional flyer on top).
export function messageToHtml(text: string, flyer: boolean): string {
  const body = text
    .trim()
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px">${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
  const img = flyer ? `<p style="margin:0 0 20px"><img src="cid:flyer" alt="" style="max-width:100%;height:auto;border-radius:8px"></p>` : "";
  return `<div style="max-width:600px;margin:0 auto;padding:24px;font:16px/1.55 Arial,sans-serif;color:#201c1a">${img}${body}</div>`;
}

export type Flyer = { data: Uint8Array; type: string };

export function withFooter(html: string): string {
  return (
    personalize(html) +
    `<p style="margin:32px 0 0;font:12px/1.5 Arial,sans-serif;color:#888;text-align:center">` +
    `KR System · <a href="%recipient.unsub%" style="color:#888">Darme de baja</a></p>`
  );
}

// Sends one batch; recipients never see each other (recipient-variables).
// Returns the Mailgun message id for the whole batch.
export async function sendBatch(opts: {
  subject: string;
  html: string;
  campaignId: string;
  recipients: Recipient[];
  flyer?: Flyer;
}): Promise<string> {
  const base = process.env.MAILGUN_REGION === "eu" ? "https://api.eu.mailgun.net" : "https://api.mailgun.net";
  const vars: Record<string, { name: string; unsub: string }> = {};
  for (const r of opts.recipients) vars[r.email] = { name: r.name ?? "", unsub: r.unsubscribeUrl };

  const form = new FormData();
  form.set("from", MAIL_FROM);
  form.set("h:Reply-To", MAIL_REPLY_TO);
  for (const r of opts.recipients) form.append("to", r.email);
  form.set("subject", opts.subject);
  form.set("html", withFooter(opts.html));
  form.set("recipient-variables", JSON.stringify(vars));
  form.set("o:tracking", "yes");
  form.set("o:tracking-opens", "yes");
  form.set("o:tracking-clicks", "yes");
  form.set("v:campaign_id", opts.campaignId);
  form.set("h:List-Unsubscribe", "<%recipient.unsub%>");
  form.set("h:List-Unsubscribe-Post", "List-Unsubscribe=One-Click");
  if (opts.flyer) form.append("inline", new Blob([opts.flyer.data as BlobPart], { type: opts.flyer.type }), "flyer");

  const res = await fetch(`${base}/v3/${process.env.MAILGUN_DOMAIN}/messages`, {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString("base64") },
    body: form,
  });
  if (!res.ok) throw new Error(`Mailgun ${res.status}`);
  const json = (await res.json()) as { id?: string };
  return json.id ?? "";
}

// Mailgun signs webhooks with HMAC-SHA256(timestamp + token); reject stale ones.
export function verifyWebhook(sig: { timestamp?: string; token?: string; signature?: string }): boolean {
  const key = process.env.MAILGUN_WEBHOOK_SIGNING_KEY;
  if (!key || !sig.timestamp || !sig.token || !sig.signature) return false;
  const age = Math.abs(Date.now() / 1000 - Number(sig.timestamp));
  if (!Number.isFinite(age) || age > 300) return false;
  const expected = createHmac("sha256", key).update(sig.timestamp + sig.token).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(sig.signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
