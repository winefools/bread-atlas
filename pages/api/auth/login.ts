import type { NextApiRequest, NextApiResponse } from "next"
import { signAdminToken } from "@/lib/auth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const { password, name } = req.body || {}
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return res.status(500).json({ error: "ADMIN_PASSWORD not configured" })
  if (password !== adminPassword) return res.status(401).json({ error: "Invalid credentials" })
  const token = signAdminToken({ role: "admin", name: name || "admin" })
  res.setHeader("Set-Cookie", `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 3600}; SameSite=Lax`)
  return res.status(200).json({ token })
}

