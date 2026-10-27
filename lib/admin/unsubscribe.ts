import "server-only";
import { db } from "@/lib/admin/prisma";

export const siteUrl = () => (process.env.ADMIN_SITE_URL ?? "https://krsystem-corp.com").replace(/\/$/, "");
export const unsubscribeUrl = (token: string) => `${siteUrl()}/baja/${token}`;

export async function unsubscribeByToken(token: string): Promise<boolean> {
  if (!token || token.length > 64) return false;
  const r = await db.contact.updateMany({ where: { unsubscribeToken: token }, data: { status: "UNSUBSCRIBED" } });
  return r.count > 0;
}
