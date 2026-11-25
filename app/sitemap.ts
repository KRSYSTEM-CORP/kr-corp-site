import type { MetadataRoute } from "next";

const BASE = "https://krsystem-corp.com";
const PAGES = ["", "/sistemas-a-medida", "/como-creamos-sistemas", "/desarrollo-web-corporativo", "/contacto", "/privacidad", "/terminos", "/cookies"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((p) => ({ url: BASE + p, changeFrequency: p === "" ? "weekly" : "monthly", priority: p === "" ? 1 : 0.6 }));
}
