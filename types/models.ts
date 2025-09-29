import type { Prisma } from "@prisma/client"

// Minimal shapes used by the UI and APIs
export type BreadDTO = Prisma.BreadGetPayload<{
  select: {
    id: true
    name: true
    origin: true
    fermentation: true
    texture: true
    category: true
    ingredients: true
    description: true
    imageUrl: true
    status: true
  }
}>

export type PostDTO = Prisma.PostGetPayload<{
  select: {
    id: true
    title: true
    content: true
    createdAt: true
  }
}>

