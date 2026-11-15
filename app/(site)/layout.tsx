import { Galaxy } from "@/components/marketing/Galaxy";
import { SiteNavbar } from "@/components/marketing/SiteNavbar";
import { Footer } from "@/components/marketing/StaticSections";

// Marco común de las pantallas públicas: barra superior + pie. Cada ruta pinta solo lo suyo.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col text-[#f5f5f7]">
      <Galaxy />
      <SiteNavbar />
      <main className="flex-1 pt-12">{children}</main>
      <Footer />
    </div>
  );
}
