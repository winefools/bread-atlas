import Link from "next/link"
import { prisma } from "@/db/client"

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let total = 0
  let completed = 0
  try {
    total = await prisma.bread.count()
    completed = await prisma.bread.count({ where: { status: "completed" } })
  } catch (_) {
    // DB not configured: show zeros
  }
  const target = 200

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold">세계 빵 도감, 500종 도전</h1>
        <p className="text-gray-600">200종부터 시작해 실제로 하나씩 만들어보고 연구 기록을 남깁니다.</p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500">진행 현황</div>
          <div className="text-2xl font-semibold">{completed}/{total || target}</div>
          <div className="h-2 bg-gray-100 rounded mt-2 overflow-hidden">
            <div className="h-full bg-orange-500" style={{ width: `${total ? Math.round((completed / Math.max(total, target)) * 100) : 0}%` }} />
          </div>
        </div>
        <Link href="/catalog" className="border rounded-lg p-4 hover:bg-gray-50">
          <div className="text-sm text-gray-500">카탈로그</div>
          <div className="text-2xl font-semibold">전체 빵 목록</div>
        </Link>
        <Link href="/dashboard" className="border rounded-lg p-4 hover:bg-gray-50">
          <div className="text-sm text-gray-500">대시보드</div>
          <div className="text-2xl font-semibold">국가별 달성률</div>
        </Link>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">주요 카테고리</h2>
        <div className="flex gap-2 flex-wrap">
          {[
            "바게트", "치아바타", "포카치아", "식빵", "브리오슈", "크루아상", "단팥빵", "소보로", "베이글", "프레첼"
          ].map((c) => (
            <Link key={c} href={`/catalog?q=${encodeURIComponent(c)}`} className="px-3 py-1 border rounded-full text-sm hover:bg-gray-50">{c}</Link>
          ))}
        </div>
      </section>
    </div>
  )
}
