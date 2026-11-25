import { Hero } from "@/components/marketing/krpos/Hero";
import dynamic from "next/dynamic";

// Debajo del primer pantallazo: su JS se carga en trozos aparte (el HTML sigue saliendo prerenderizado).
const Tour = dynamic(() => import("@/components/marketing/krpos/Tour").then((m) => m.Tour));
const AssistantDemo = dynamic(() => import("@/components/marketing/krpos/AssistantDemo").then((m) => m.AssistantDemo));
import { Features } from "@/components/marketing/krpos/Features";
import { Plans } from "@/components/marketing/krpos/Plans";
import { FinalCta } from "@/components/marketing/krpos/FinalCta";

// La portada es solo de KR POS. El resto de la información vive en las pantallas de la barra superior.
const plan = (name: string, price: string, description: string) => ({
  "@type": "Offer", name, price, priceCurrency: "USD", description, availability: "https://schema.org/InStock",
  url: "https://krpos.krsystem-corp.com/signup",
});
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://krsystem-corp.com/#org", name: "KR System", url: "https://krsystem-corp.com", logo: "https://krsystem-corp.com/logo.png", email: "contacto@krsystem-corp.com", areaServed: "VE" },
    {
      "@type": "SoftwareApplication", name: "KR POS", applicationCategory: "BusinessApplication", operatingSystem: "Web, Android, iOS", inLanguage: "es",
      publisher: { "@id": "https://krsystem-corp.com/#org" },
      description: "Punto de venta, inventario, caja, estadísticas y Asistente IA para negocios de Venezuela.",
      offers: [
        plan("Emprende", "12.99", "Primer mes $9,99. Hasta 5 usuarios y 100 productos."),
        plan("Pyme", "23.99", "Hasta 30 usuarios y 500 productos."),
        plan("Corporativo", "44.99", "Usuarios y productos ilimitados."),
      ],
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Hero />
      <Tour />
      <AssistantDemo />
      <Features />
      <Plans />
      <FinalCta />
    </>
  );
}
