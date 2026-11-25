import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/baja"] }],
    sitemap: "https://krsystem-corp.com/sitemap.xml",
  };
}
