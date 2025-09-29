import jwt from "jsonwebtoken"
import type { NextApiRequest } from "next"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"

export function signAdminToken(payload: { role: "admin"; name?: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token?: string): null | { role: string; [k: string]: any } {
  if (!token) return null
  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch (e) {
    return null
  }
}

export function getTokenFromReq(req: NextApiRequest): string | undefined {
  const header = req.headers.authorization
  if (header && header.startsWith("Bearer ")) return header.slice(7)
  const cookie = req.cookies?.token
  return cookie
}

export function requireAdmin(req: NextApiRequest): boolean {
  const token = getTokenFromReq(req)
  const payload = verifyToken(token)
  return !!payload && payload.role === "admin"
}

