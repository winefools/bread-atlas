import type { NextApiRequest, NextApiResponse } from "next"
import { requireAdmin } from "@/lib/auth"
import { isDbDisabled } from "@/lib/featureFlags"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id)
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' })

  if (isDbDisabled()) {
    if (req.method === "GET") {
      return res.status(404).json({ error: "Not found" })
    }
    return res.status(503).json({ error: "Database is disabled" })
  }

  const { prisma } = await import("@/db/client")
  switch (req.method) {
    case 'GET': {
      const post = await prisma.post.findUnique({ where: { id } })
      return post ? res.status(200).json(post) : res.status(404).json({ error: 'Not found' })
    }
    case 'PUT': {
      if (!requireAdmin(req)) return res.status(401).json({ error: 'Unauthorized' })
      const { title, content } = req.body || {}
      const post = await prisma.post.update({ where: { id }, data: { title, content } })
      return res.status(200).json(post)
    }
    case 'DELETE': {
      if (!requireAdmin(req)) return res.status(401).json({ error: 'Unauthorized' })
      await prisma.post.delete({ where: { id } })
      return res.status(204).end()
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}

