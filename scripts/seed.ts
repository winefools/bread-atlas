/*
  Seed script: import CSVs into SQLite via Prisma
  - data/bread_catalog_200.csv
  - data/ai_seed_recipes_10.csv
*/
import { parse } from "csv-parse/sync"
import fs from "fs"
import path from "path"
import { prisma } from "@/db/client"

function loadCsv(file: string) {
  const p = path.resolve(process.cwd(), file)
  if (!fs.existsSync(p)) {
    console.warn(`CSV not found: ${file} (skipping)`) 
    return [] as any[]
  }
  const text = fs.readFileSync(p, "utf8")
  const records = parse(text, { columns: true, skip_empty_lines: true, trim: true })
  return records as any[]
}

function toNull(v: any) { return v === undefined || v === null || v === "" ? null : String(v) }

async function upsertBread(r: any) {
  const name = String(r.name || r.Name || "").trim()
  if (!name) return
  const existing = await prisma.bread.findFirst({ where: { name } })
  const data: any = {
    name,
    origin: toNull(r.origin || r.Origin),
    fermentation: toNull(r.fermentation || r.Fermentation),
    texture: toNull(r.texture || r.Texture),
    category: toNull(r.category || r.Category),
    ingredients: toNull(r.ingredients || r.Ingredients),
    description: toNull(r.description || r.Description),
    imageUrl: toNull(r.image_url || r.imageUrl || r.ImageUrl),
  }
  if (existing) await prisma.bread.update({ where: { id: existing.id }, data })
  else await prisma.bread.create({ data })
}

async function main() {
  const base = loadCsv("data/bread_catalog_200.csv")
  const seed = loadCsv("data/ai_seed_recipes_10.csv")
  console.log(`Importing base catalog: ${base.length} rows`)
  for (const r of base) await upsertBread(r)
  console.log(`Importing AI seed recipes: ${seed.length} rows`)
  for (const r of seed) await upsertBread(r)
  console.log("Done.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})

