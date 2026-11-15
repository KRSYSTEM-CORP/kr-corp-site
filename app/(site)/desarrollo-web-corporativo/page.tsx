import type { Metadata } from "next";
import { Contact, CorporateWeb } from "@/components/marketing/StaticSections";

export const metadata: Metadata = { title: "Desarrollo web corporativo — KR System", description: "Páginas web corporativas profesionales, rápidas y conectadas con tus sistemas." };

export default function Page() {
  return (
    <>
      <CorporateWeb />
      <Contact />
    </>
  );
}
