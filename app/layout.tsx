import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { MotionProvider } from "@/components/marketing/MotionProvider";
import "./globals.css";

// One family, set tight at large sizes the way Apple sets SF Display: Inter's
// variable axis covers the whole range from body copy to 100px headlines.
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const TITLE = "KR System — Diseño de apps y sistemas a medida";
const DESCRIPTION =
  "Diseñamos y desarrollamos aplicaciones, sistemas y software a medida para pequeñas y medianas empresas.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", locale: "es_VE", siteName: "KR System" },
};

// Black browser chrome on phones, matching the page's own background.
export const viewport: Viewport = { themeColor: "#000000" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-[#f5f5f7] font-sans">
        <MotionProvider>
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
