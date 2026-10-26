import "server-only";
import { cache } from "react";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/admin/prisma";
import type { AdminRole } from "@prisma/client";

// Signed-cookie session for the admin panel (same scheme as KR POS):
// payload + HMAC with ADMIN_AUTH_SECRET, re-validated against the DB on every
// request so a deactivated user or a password change (tokenVersion) ends it.
const COOKIE = "kr_admin";
const MAX_AGE = 60 * 60 * 12; // 12 h

type Payload = { uid: string; tv: number; exp: number };
export type AdminSession = { id: string; email: string; name: string; role: AdminRole };

function secret(): string {
  const s = process.env.ADMIN_AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("ADMIN_AUTH_SECRET no está configurado (mínimo 32 caracteres)");
  return s;
}
const sign = (data: string) => createHmac("sha256", secret()).update(data).digest("base64url");

function encode(p: Payload): string {
  const data = Buffer.from(JSON.stringify(p)).toString("base64url");
  return `${data}.${sign(data)}`;
}

function decode(token: string): Payload | null {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(data));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as Payload;
    return typeof p.exp === "number" && p.exp > Date.now() ? p : null;
  } catch {
    return null;
  }
}

export async function startSession(userId: string, tokenVersion: number) {
  const store = await cookies();
  store.set(COOKIE, encode({ uid: userId, tv: tokenVersion, exp: Date.now() + MAX_AGE * 1000 }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete({ name: COOKIE, path: "/admin" });
}

export const getAdmin = cache(async (): Promise<AdminSession | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  const p = token ? decode(token) : null;
  if (!p) return null;
  const user = await db.adminUser.findUnique({ where: { id: p.uid } });
  if (!user || !user.active || user.tokenVersion !== p.tv) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role };
});

export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function requireOwner(): Promise<AdminSession> {
  const admin = await requireAdmin();
  if (admin.role !== "OWNER") redirect("/admin");
  return admin;
}
