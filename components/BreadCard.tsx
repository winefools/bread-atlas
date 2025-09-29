import Link from "next/link"
import { Badge } from "@/components/ui/badge"

type Props = {
  bread: {
    id: number
    name: string
    origin?: string | null
    category?: string | null
    imageUrl?: string | null
    status: string
  }
}

export default function BreadCard({ bread }: Props) {
  return (
    <Link href={`/bread/${bread.id}`} className="border rounded-lg overflow-hidden hover:shadow">
      <div className="aspect-video bg-gray-100">
        {bread.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bread.imageUrl} alt={bread.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-gray-400 text-sm">
            No Image
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{bread.name}</h3>
          <Badge>{bread.status}</Badge>
        </div>
        <p className="text-xs text-gray-500 mt-1">{bread.origin || "Unknown"} • {bread.category || "-"}</p>
      </div>
    </Link>
  )
}

