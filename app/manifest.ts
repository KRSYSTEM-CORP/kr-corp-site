import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KR System",
    short_name: "KR System",
    description: "KR POS: punto de venta, inventario, caja y Asistente IA para negocios de Venezuela.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    lang: "es",
    icons: [{ src: "/icon.png", sizes: "any", type: "image/png" }],
  };
}
