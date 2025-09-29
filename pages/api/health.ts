import type { NextApiRequest, NextApiResponse } from "next"
import { isDbDisabled } from "@/lib/featureFlags"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const health: any = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      databaseUrlExists: !!process.env.DATABASE_URL,
      disableDb: isDbDisabled(),
      supabaseConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      adminPasswordSet: !!process.env.ADMIN_PASSWORD,
    },
  }

  if (!isDbDisabled() && process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/db/client")
      await prisma.$queryRaw`SELECT 1`
      health.database = {
        status: "connected",
        ping: "success"
      }
    } catch (error) {
      health.database = {
        status: "error",
        ping: "failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  } else {
    health.database = {
      status: "disabled",
      reason: isDbDisabled() ? "DISABLE_DB flag is set" : "DATABASE_URL not configured"
    }
  }

  return res.status(200).json(health)
}