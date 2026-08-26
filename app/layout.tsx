import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans, Geist_Mono } from "next/font/google";
import { AmbientBackground } from "@/components/marketing/AmbientBackground";
import { PageIntro } from "@/components/marketing/PageIntro";
import { MotionProvider } from "@/components/marketing/MotionProvider";
import "./globals.css";

// "Tech Startup" pairing — Space Grotesk's distinctive character for
// headings, DM Sans for readable body copy. Geist Mono stays for the small
// uppercase eyebrow labels, which already read as a technical accent.
const heading = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KR System — Diseño de apps y sistemas a medida",
  description:
    "Diseñamos y desarrollamos aplicaciones, sistemas y software a medida para pequeñas y medianas empresas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${heading.variable} ${body.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0912] text-[#f3f1f9] font-(family-name:--font-body)">
        <MotionProvider>
          <AmbientBackground />
          <PageIntro />
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
