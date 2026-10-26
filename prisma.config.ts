import "dotenv/config";
import { defineConfig } from "prisma/config";

// Admin panel database (its own Neon project, separate from every product).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // `prisma generate` (npm postinstall, also on Vercel) needs a URL to load this
  // file but never connects; migrations use the real ADMIN_DIRECT_URL.
  datasource: { url: process.env.ADMIN_DIRECT_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder" },
});
