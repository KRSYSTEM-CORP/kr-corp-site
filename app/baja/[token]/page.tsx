import type { Metadata } from "next";
import { unsubscribeByToken } from "@/lib/admin/unsubscribe";

export const metadata: Metadata = { title: "Darse de baja — KR System", robots: { index: false, follow: false } };

async function confirm(token: string) {
  "use server";
  await unsubscribeByToken(token);
}

export default async function UnsubscribePage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ ok?: string }> }) {
  const { token } = await params;
  const { ok } = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-5 text-center">
      {ok ? (
        <>
          <h1 className="text-2xl font-semibold">Listo, te diste de baja</h1>
          <p className="text-sm text-zinc-500">No volverás a recibir correos de campañas de KR System.</p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold">¿Dejar de recibir nuestros correos?</h1>
          <form
            action={async () => {
              "use server";
              await confirm(token);
              const { redirect } = await import("next/navigation");
              redirect(`/baja/${token}?ok=1`);
            }}
          >
            <button className="h-11 rounded-lg bg-black px-6 text-sm font-medium text-white">Sí, darme de baja</button>
          </form>
        </>
      )}
    </main>
  );
}
