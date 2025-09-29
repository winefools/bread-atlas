import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/db/client"
import { requireAdmin } from "@/lib/auth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET': {
      const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } })
      return res.status(200).json(posts)
    }
    case 'POST': {
      if (!requireAdmin(req)) return res.status(401).json({ error: 'Unauthorized' })
      const { title, content } = req.body || {}
      if (!title) return res.status(400).json({ error: 'title required' })
      const post = await prisma.post.create({ data: { title, content: content || '' } })
      return res.status(201).json(post)
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}

