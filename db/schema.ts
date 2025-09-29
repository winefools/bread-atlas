import { z } from "zod"

export const BreadSchema = z.object({
  name: z.string().min(1),
  origin: z.string().optional().nullable(),
  fermentation: z.string().optional().nullable(),
  texture: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  ingredients: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  tags: z.string().optional().nullable(),
  status: z.enum(["planned", "in_progress", "completed"]).optional().default("planned"),
  difficulty: z.number().int().min(1).max(5).optional().nullable(),
  tastingNotes: z.string().optional().nullable(),
  bakersPercent: z.any().optional().nullable(),
  ingredientsFor1kgFlourG: z.any().optional().nullable(),
  processSteps: z.any().optional().nullable(),
  bakeParams: z.any().optional().nullable(),
  notes: z.any().optional().nullable()
})

export type BreadInput = z.infer<typeof BreadSchema>

