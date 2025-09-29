import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/db/client"
import { BreadSchema } from "@/db/schema"
import { requireAdmin } from "@/lib/auth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id)
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" })

  switch (req.method) {
    case "GET": {
      const bread = await prisma.bread.findUnique({ where: { id } })
      return bread ? res.status(200).json(bread) : res.status(404).json({ error: "Not found" })
    }
    case "PUT": {
      if (!requireAdmin(req)) return res.status(401).json({ error: "Unauthorized" })
      try {
        const data = BreadSchema.partial().parse(req.body)
        const existing = await prisma.bread.findUnique({ where: { id } })
        if (!existing) return res.status(404).json({ error: 'Not found' })
        const willComplete = data.status === 'completed' && existing.status !== 'completed'
        const updated = await prisma.bread.update({ where: { id }, data: { ...data, completedAt: willComplete ? new Date() : existing.completedAt } })
        return res.status(200).json(updated)
      } catch (e: any) {
        return res.status(400).json({ error: e.message })
      }
    }
    case "DELETE": {
      if (!requireAdmin(req)) return res.status(401).json({ error: "Unauthorized" })
      await prisma.bread.delete({ where: { id } })
      return res.status(204).end()
    }
    default:
      return res.status(405).json({ error: "Method not allowed" })
  }
}
