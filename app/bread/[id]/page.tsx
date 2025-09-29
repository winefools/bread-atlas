import { prisma } from "@/db/client"
import { Badge } from "@/components/ui/badge"

export default async function BreadDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  const bread = await prisma.bread.findUnique({ where: { id } })
  if (!bread) return <div>Not found</div>
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg overflow-hidden bg-gray-100 aspect-video">
          {bread.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bread.imageUrl} alt={bread.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center text-gray-400">No Image</div>
          )}
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">{bread.name}</h1>
          <div className="flex gap-2 flex-wrap text-sm text-gray-600">
            <span>원산지: {bread.origin || '-'}</span>
            <span>발효: {bread.fermentation || '-'}</span>
            <span>질감: {bread.texture || '-'}</span>
            <span>카테고리: {bread.category || '-'}</span>
            <Badge>{bread.status}</Badge>
          </div>
          {bread.description && <p className="text-gray-700 whitespace-pre-line">{bread.description}</p>}
          {bread.ingredients && (
            <div>
              <h3 className="font-semibold">재료</h3>
              <p className="text-sm text-gray-700 whitespace-pre-line">{bread.ingredients}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">연구 기록</h3>
          <p className="text-sm text-gray-700">난이도: {bread.difficulty ?? '-'} / 5</p>
          {bread.tastingNotes && <p className="text-sm text-gray-700 whitespace-pre-line">시식 메모: {bread.tastingNotes}</p>}
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">레시피 요약</h3>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify({
            bakersPercent: bread.bakersPercent,
            ingredientsFor1kgFlourG: bread.ingredientsFor1kgFlourG,
            processSteps: bread.processSteps,
            bakeParams: bread.bakeParams,
          }, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}

