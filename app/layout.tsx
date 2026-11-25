import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Analytics } from "@/components/marketing/Analytics";
import { MotionProvider } from "@/components/marketing/MotionProvider";
import "./globals.css";

// One family, set tight at large sizes the way Apple sets SF Display: Inter's
// variable axis covers the whole range from body copy to 100px headlines.
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const TITLE = "KR POS — El sistema para vender, controlar y crecer | KR System";
const DESCRIPTION =
  "KR POS: punto de venta, inventario, caja, estadísticas y Asistente IA en un solo sistema para negocios de Venezuela. Prueba 15 días gratis. Por KR System.";

export const metadata: Metadata = {
  metadataBase: new URL("https://krsystem-corp.com"),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", locale: "es_VE", siteName: "KR System", url: "/" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
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
      <body className="min-h-full flex flex-col text-[#f5f5f7] font-sans">
        <MotionProvider>
          {children}
        </MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
