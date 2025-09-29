"use client"
import useSWR from "swr"
import { useMemo, useState } from "react"
import BreadCard from "@/components/BreadCard"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Bread = {
  id: number
  name: string
  origin?: string | null
  fermentation?: string | null
  texture?: string | null
  category?: string | null
  ingredients?: string | null
}

export default function CatalogPage() {
  const { data: breads = [] } = useSWR<Bread[]>("/api/breads", fetcher)
  const [q, setQ] = useState("")
  const [filters, setFilters] = useState({ fermentation: "", texture: "", origin: "", category: "" } as const)

  const filtered = useMemo(() => {
    type FilterKey = keyof typeof filters
    return (breads as Bread[]).filter((b) => {
      const matchQ = q
        ? [b.name, b.ingredients, b.origin].some((f) => (f ?? "").toLowerCase().includes(q.toLowerCase()))
        : true
      const match = <K extends FilterKey>(key: K) =>
        !filters[key] || ((b[key] ?? "").toLowerCase().includes(filters[key].toLowerCase()))
      return matchQ && match("fermentation") && match("texture") && match("origin") && match("category")
    })
  }, [breads, q, filters])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Catalog</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Input placeholder="검색: 이름/재료/국가" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select value={filters.fermentation} onChange={(e) => setFilters({ ...filters, fermentation: e.target.value })}>
          <option value="">발효 방식</option>
          <option>yeast</option>
          <option>sourdough</option>
          <option>none</option>
        </Select>
        <Select value={filters.texture} onChange={(e) => setFilters({ ...filters, texture: e.target.value })}>
          <option value="">질감</option>
          <option>crusty</option>
          <option>soft</option>
          <option>chewy</option>
        </Select>
        <Input placeholder="국가" value={filters.origin} onChange={(e) => setFilters({ ...filters, origin: e.target.value })} />
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {filtered.map((b: Bread) => (
          <BreadCard key={b.id} bread={b} />
        ))}
      </div>
    </div>
  )
}
