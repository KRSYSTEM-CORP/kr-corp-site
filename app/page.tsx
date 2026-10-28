import { SiteNavbar } from "@/components/marketing/SiteNavbar";
import { Hero } from "@/components/marketing/HeroStage";
import {
  Contact,
  KrPosOverview,
  Footer,
  Health,
  Process,
  Statement,
  Systems,
  WhatWeDo,
} from "@/components/marketing/StaticSections";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-[#f5f5f7]">
      <SiteNavbar />
      <main>
        <Hero />
        <Health />
        <KrPosOverview />
        <Statement />
        <WhatWeDo />
        <Systems />
        <Process />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
