import type { Metadata } from "next";
import { Contact } from "@/components/marketing/StaticSections";

export const metadata: Metadata = { title: "Contacto — KR System", alternates: { canonical: "/contacto" }, description: "Escríbenos por WhatsApp, correo o teléfono." };

export default function Page() {
  return <Contact />;
}
