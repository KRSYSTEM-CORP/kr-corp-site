import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Admin panel database (its own Neon project, separate from every product).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("ADMIN_DIRECT_URL") },
});
