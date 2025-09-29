import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/db/client"
import { BreadSchema } from "@/db/schema"
import { requireAdmin } from "@/lib/auth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET": {
      const { q, origin, fermentation, texture, category, status } = req.query
      const where: any = {}
      if (q && typeof q === "string") {
        where.OR = [
          { name: { contains: q, mode: "insensitive" } },
          { ingredients: { contains: q, mode: "insensitive" } },
          { origin: { contains: q, mode: "insensitive" } }
        ]
      }
      if (origin && typeof origin === "string") where.origin = { contains: origin, mode: "insensitive" }
      if (fermentation && typeof fermentation === "string") where.fermentation = { contains: fermentation, mode: "insensitive" }
      if (texture && typeof texture === "string") where.texture = { contains: texture, mode: "insensitive" }
      if (category && typeof category === "string") where.category = { contains: category, mode: "insensitive" }
      if (status && typeof status === "string") where.status = status

      const breads = await prisma.bread.findMany({ where, orderBy: { id: "asc" } })
      return res.status(200).json(breads)
    }
    case "POST": {
      if (!requireAdmin(req)) return res.status(401).json({ error: "Unauthorized" })
      try {
        const data = BreadSchema.parse(req.body)
        const created = await prisma.bread.create({
          data: {
            name: data.name,
            origin: data.origin || null,
            fermentation: data.fermentation || null,
            texture: data.texture || null,
            category: data.category || null,
            ingredients: data.ingredients || null,
            description: data.description || null,
            imageUrl: data.imageUrl || null,
            tags: data.tags || null,
            status: data.status || "planned",
            completedAt: (data.status === 'completed') ? new Date() : undefined,
            difficulty: data.difficulty ?? null,
            tastingNotes: data.tastingNotes || null,
            bakersPercent: data.bakersPercent ?? undefined,
            ingredientsFor1kgFlourG: data.ingredientsFor1kgFlourG ?? undefined,
            processSteps: data.processSteps ?? undefined,
            bakeParams: data.bakeParams ?? undefined,
            notes: data.notes ?? undefined
          }
        })
        return res.status(201).json(created)
      } catch (e: any) {
        return res.status(400).json({ error: e.message })
      }
    }
    default:
      return res.status(405).json({ error: "Method not allowed" })
  }
}
