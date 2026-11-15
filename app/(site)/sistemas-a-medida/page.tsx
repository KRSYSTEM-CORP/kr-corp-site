import type { Metadata } from "next";
import { Contact, PageHeader, Systems } from "@/components/marketing/StaticSections";

export const metadata: Metadata = { title: "Sistemas a medida — KR System", description: "Sistemas adaptados a tu empresa: KR POS, KR Citas y desarrollos hechos a la medida." };

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Sistemas a medida" title="Sistemas adaptados a cada empresa." text="Partimos de nuestros sistemas ya probados y los ajustamos a cómo opera tu negocio, o construimos uno nuevo desde cero." />
      <Systems />
      <Contact />
    </>
  );
}
