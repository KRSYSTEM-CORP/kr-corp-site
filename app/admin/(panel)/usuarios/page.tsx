import { db } from "@/lib/admin/prisma";
import { requireOwner } from "@/lib/admin/session";
import { setAdminUserActive } from "@/lib/admin/actions/users";
import { NewUserForm } from "./NewUserForm";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const me = await requireOwner();
  const users = await db.adminUser.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Usuarios del panel</h1>
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 text-left text-zinc-400">
            <tr><th className="p-3">Nombre</th><th className="p-3">Correo</th><th className="p-3">Rol</th><th className="p-3">Último acceso</th><th className="p-3" /></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-zinc-800">
                <td className="p-3">{u.name}</td>
                <td className="p-3 text-zinc-300">{u.email}</td>
                <td className="p-3">{u.role === "OWNER" ? "Dueño" : "Equipo"}</td>
                <td className="p-3 text-zinc-400">{u.lastLoginAt ? u.lastLoginAt.toLocaleString("es-VE") : "—"}</td>
                <td className="p-3 text-right">
                  {u.id !== me.id && (
                    <form action={setAdminUserActive.bind(null, u.id, !u.active)}>
                      <button className="text-zinc-300 underline underline-offset-2">{u.active ? "Desactivar" : "Activar"}</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="text-lg font-semibold">Nuevo usuario</h2>
      <NewUserForm />
    </div>
  );
}
