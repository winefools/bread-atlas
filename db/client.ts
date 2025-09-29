import { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Lazily initialize Prisma only if DATABASE_URL is present
function createPrisma() {
  if (!process.env.DATABASE_URL) {
    // Return a proxy that throws on use, avoiding build-time crashes
    return new Proxy({} as PrismaClient, {
      get() {
        throw new Error("DATABASE_URL is not set; database is not configured")
      },
    })
  }
  return new PrismaClient()
}

export const prisma: PrismaClient = (global.prisma as PrismaClient | undefined) || createPrisma()
if (process.env.NODE_ENV !== "production") global.prisma = prisma
