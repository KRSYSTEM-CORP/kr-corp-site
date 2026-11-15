import { Hero } from "@/components/marketing/krpos/Hero";
import { Tour } from "@/components/marketing/krpos/Tour";
import { AssistantDemo } from "@/components/marketing/krpos/AssistantDemo";
import { Features } from "@/components/marketing/krpos/Features";
import { Plans } from "@/components/marketing/krpos/Plans";
import { FinalCta } from "@/components/marketing/krpos/FinalCta";

// La portada es solo de KR POS. El resto de la información vive en las pantallas de la barra superior.
export default function Home() {
  return (
    <>
      <Hero />
      <Tour />
      <AssistantDemo />
      <Features />
      <Plans />
      <FinalCta />
    </>
  );
}
