import { db } from "@/lib/admin/prisma";

const TYPES = new Set(["visit", "cta", "contact"]);
const BOT = /bot|crawler|spider|crawling|headless|lighthouse|preview|facebookexternalhit/i;

// Per-instance flood guard: at most 40 events a minute per client.
const hits = new Map<string, { n: number; t: number }>();
function limited(key: string): boolean {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || now - h.t > 60_000) {
    hits.set(key, { n: 1, t: now });
    if (hits.size > 5000) hits.clear();
    return false;
  }
  return ++h.n > 40;
}

const clip = (v: unknown, max: number) => (typeof v === "string" && v ? v.slice(0, max) : null);

export async function POST(req: Request) {
  if (BOT.test(req.headers.get("user-agent") ?? "")) return new Response(null, { status: 204 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) return new Response(null, { status: 429 });

  let body: Record<string, unknown>;
  try {
    const text = await req.text();
    if (text.length > 1024) return new Response(null, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }
  if (typeof body.type !== "string" || !TYPES.has(body.type)) return new Response(null, { status: 400 });

  try {
    await db.webEvent.create({
      data: { type: body.type, path: clip(body.path, 200), referrer: clip(body.referrer, 100), utmSource: clip(body.utmSource, 60) },
    });
  } catch (err) {
    console.error("[evento] no se pudo guardar", err instanceof Error ? err.message : err);
  }
  return new Response(null, { status: 204 });
}
