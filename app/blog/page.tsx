import { prisma } from "@/db/client"
export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } })
  type PostItem = typeof posts[number]
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Blog / Notes</h1>
      <div className="space-y-3">
        {posts.map((p: PostItem) => (
          <article key={p.id} className="border rounded-lg p-4">
            <h2 className="font-semibold">{p.title}</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{p.content}</p>
            <div className="text-xs text-gray-500 mt-2">{new Date(p.createdAt).toLocaleString()}</div>
          </article>
        ))}
        {!posts.length && <div className="text-sm text-gray-500">아직 글이 없습니다. Admin에서 작성하세요.</div>}
      </div>
    </div>
  )
}
