import ExcelJS from "exceljs";
import { db } from "@/lib/admin/prisma";
import { getAdmin } from "@/lib/admin/session";
import { KINDS, kindOf } from "@/lib/admin/tags";

// Excel with the whole database (or just the header row as a template).
export async function GET() {
  if (!(await getAdmin())) return new Response(null, { status: 401 });
  const contacts = await db.contact.findMany({ orderBy: { createdAt: "asc" } });
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Correos");
  ws.addRow(["Nombre", "Correo", "Tipo", "Teléfono", "Empresa", "Etiquetas", "Estado"]);
  ws.getRow(1).font = { bold: true };
  const state = { SUBSCRIBED: "Suscrito", UNSUBSCRIBED: "Dado de baja", BOUNCED: "Rebotado" } as const;
  for (const c of contacts) {
    const k = kindOf(c.tags);
    ws.addRow([c.name ?? "", c.email, k ? KINDS[k] : "", c.phone ?? "", c.company ?? "", c.tags.filter((t) => !(t in KINDS)).join(", "), state[c.status]]);
  }
  ws.columns.forEach((col) => (col.width = 24));
  const buf = await wb.xlsx.writeBuffer();
  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="kr-system-correos.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
