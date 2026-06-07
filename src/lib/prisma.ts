import { PrismaClient } from "@prisma/client";

declare global {
  // allow global Prisma client to avoid multiple instances in dev
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
