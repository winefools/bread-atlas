import type { NextApiRequest, NextApiResponse } from "next"
import { requireAdmin } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase"
import formidable from "formidable"
import { randomUUID } from "crypto"

export const config = { api: { bodyParser: false } }

function parseForm(req: NextApiRequest): Promise<{ file?: any; contentType?: string }>
{ return new Promise((resolve, reject) => {
  const form = formidable({ multiples: false, keepExtensions: true })
    form.parse(req, (err: any, _fields: any, files: any) => {
      if (err) return reject(err)
      const file = (files.file || files.image || Object.values(files)[0]) as any
      resolve({ file, contentType: file?.mimetype })
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  if (!requireAdmin(req)) return res.status(401).json({ error: "Unauthorized" })
  if (!supabaseAdmin) return res.status(500).json({ error: "Supabase is not configured" })
  try {
    const { file, contentType } = await parseForm(req)
    if (!file) return res.status(400).json({ error: "No file" })
    const bucket = process.env.SUPABASE_BUCKET || "bread-images"
    const ext = (file.originalFilename?.split(".").pop() || "jpg").toLowerCase()
    const path = `${new Date().getFullYear()}/${randomUUID()}.${ext}`
    const upload = await supabaseAdmin.storage.from(bucket).upload(path, file.filepath, {
      contentType: contentType || "application/octet-stream",
      upsert: false,
    })
    if (upload.error) return res.status(400).json({ error: upload.error.message })
    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path)
    return res.status(200).json({ url: data.publicUrl, path })
  } catch (e: any) {
    return res.status(400).json({ error: e.message })
  }
}
