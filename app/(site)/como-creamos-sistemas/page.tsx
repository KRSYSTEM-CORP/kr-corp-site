import type { Metadata } from "next";
import { PageHeader, Process, Statement, WhatWeDo } from "@/components/marketing/StaticSections";

export const metadata: Metadata = { title: "Cómo creamos sistemas — KR System", alternates: { canonical: "/como-creamos-sistemas" }, description: "Partimos del problema real de tu operación y construimos el sistema que lo resuelve." };

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Cómo creamos sistemas" title="Del problema real al sistema que lo resuelve." text="Así trabajamos: escuchamos, diseñamos, construimos en tramos y seguimos afinando contigo." />
      <Statement />
      <Process />
      <WhatWeDo />
    </>
  );
}
