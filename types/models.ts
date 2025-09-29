// Minimal shapes used by the UI and APIs (kept in sync with Prisma schema)
export type BreadDTO = {
  id: number
  name: string
  origin: string | null
  fermentation: string | null
  texture: string | null
  category: string | null
  ingredients: string | null
  description: string | null
  imageUrl: string | null
  status: string
  createdAt?: string | Date
  updatedAt?: string | Date
  completedAt?: string | Date | null
}

export type PostDTO = {
  id: number
  title: string
  content: string
  createdAt: string | Date
}
