import { unsubscribeByToken } from "@/lib/admin/unsubscribe";

// One-click unsubscribe (RFC 8058): mail clients POST here from List-Unsubscribe.
export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  await unsubscribeByToken(token);
  return new Response(null, { status: 200 });
}
