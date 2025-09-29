import type { NextApiRequest, NextApiResponse } from "next"
import { parse } from "csv-parse/sync"
import { requireAdmin } from "@/lib/auth"
import { isDbDisabled } from "@/lib/featureFlags"

export const config = {
  api: {
    bodyParser: false,
  },
}

function readStream(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = []
    req.on("data", (c: any) => chunks.push(new Uint8Array(c)))
    req.on("end", () => resolve(Buffer.concat(chunks)))
    req.on("error", reject)
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  if (!requireAdmin(req)) return res.status(401).json({ error: "Unauthorized" })

  if (isDbDisabled()) {
    return res.status(503).json({ error: "Database is disabled" })
  }

  const { prisma } = await import("@/db/client")

  try {
    const buf = await readStream(req)
    const csvText = buf.toString("utf8")
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as any[]

    const toNull = (v: any) => (v === undefined || v === null || v === "" ? null : String(v))

    const created = []
    for (const r of records) {
      const b = await prisma.bread.create({
        data: {
          name: String(r.name || "Unnamed"),
          origin: toNull(r.origin),
          fermentation: toNull(r.fermentation),
          texture: toNull(r.texture),
          category: toNull(r.category),
          ingredients: toNull(r.ingredients),
          description: toNull(r.description),
          imageUrl: toNull(r.image_url || r.imageUrl),
          // advanced fields optional in CSV
        }
      })
      created.push(b)
    }
    return res.status(200).json({ count: created.length })
  } catch (e: any) {
    return res.status(400).json({ error: e.message })
  }
}
