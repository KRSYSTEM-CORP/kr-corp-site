import type { NextConfig } from "next";

// CSP: Next inyecta scripts en línea (datos de hidratación) y SRI no los cubre; quitar 'unsafe-inline' exige nonces,
// que obligan a render dinámico en todas las páginas (se pierde la caché estática). Se probó y se descartó. El resto queda cerrado a nuestro origen.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'" + (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' mailto:",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const security = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const staticAssets = [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }];

const nextConfig: NextConfig = {
  // The admin panel sends a flyer image (up to 3 MB) through a server action.
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },
  async headers() {
    return [
      { source: "/:path*", headers: security },
      { source: "/krpos/:path*", headers: staticAssets },
      { source: "/:file(logo.png|whatsapp-icon.png|product-finanzas.png|product-citas.png)", headers: staticAssets },
    ];
  },
};

export default nextConfig;
