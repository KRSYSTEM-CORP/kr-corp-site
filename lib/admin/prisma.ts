import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { adminPrisma: PrismaClient | undefined };

export const db =
  globalForPrisma.adminPrisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.ADMIN_DATABASE_URL }) });

if (process.env.NODE_ENV !== "production") globalForPrisma.adminPrisma = db;
