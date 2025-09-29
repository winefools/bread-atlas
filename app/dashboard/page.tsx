import { prisma } from "@/db/client"
export const dynamic = 'force-dynamic'
import type { BreadDTO } from "@/types/models"

export default async function DashboardPage() {
  const breads: BreadDTO[] = await prisma.bread.findMany({
    select: {
      id: true,
      name: true,
      origin: true,
      fermentation: true,
      texture: true,
      category: true,
      ingredients: true,
      description: true,
      imageUrl: true,
      status: true,
    },
  })
  const counts = breads.reduce((acc: Record<string, number>, b: BreadDTO) => {
    const c = (b.origin || "Unknown").trim()
    acc[c] = (acc[c] || 0) + (b.status === "completed" ? 1 : 0)
    return acc
  }, {})
  const countries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12)
  const total = breads.length
  const completed = breads.filter((b) => b.status === "completed").length

  const byYear = breads.reduce((acc: Record<string, number>, b: BreadDTO) => {
    if (b.completedAt) {
      const y = String(new Date(b.completedAt).getFullYear())
      acc[y] = (acc[y] || 0) + 1
    }
    return acc
  }, {})
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - 4 + i))
  const yearlyGoal: Record<string, number> = {}
  years.forEach((y) => { yearlyGoal[y] = 100 }) // 예: 연간 100종 목표 (수정 가능)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Progress Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4"><div className="text-sm text-gray-500">총 빵 수</div><div className="text-2xl font-semibold">{total}</div></div>
        <div className="border rounded-lg p-4"><div className="text-sm text-gray-500">완료</div><div className="text-2xl font-semibold">{completed}</div></div>
        <div className="border rounded-lg p-4"><div className="text-sm text-gray-500">진행률</div><div className="text-2xl font-semibold">{total ? Math.round((completed/total)*100) : 0}%</div></div>
      </div>

      <section>
        <h2 className="font-semibold mb-2">국가별 달성</h2>
        <div className="space-y-2">
          {countries.map(([country, count]) => (
            <div key={country} className="flex items-center gap-3">
              <div className="w-28 text-sm text-gray-600">{country}</div>
              <div className="h-3 bg-gray-100 rounded flex-1 overflow-hidden">
                <div className="h-full bg-orange-500" style={{ width: `${Math.min(100, (Number(count)/Math.max(1, completed))*100)}%` }} />
              </div>
              <div className="w-10 text-right text-sm">{count}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">연도별 목표 달성률</h2>
        <div className="space-y-2">
          {years.map((y) => {
            const done = byYear[y] || 0
            const goal = yearlyGoal[y] || 0
            const pct = goal ? Math.round((done / goal) * 100) : 0
            return (
              <div key={y} className="flex items-center gap-3">
                <div className="w-16 text-sm text-gray-600">{y}</div>
                <div className="h-3 bg-gray-100 rounded flex-1 overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
                <div className="w-24 text-right text-sm">{done}/{goal} ({pct}%)</div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
