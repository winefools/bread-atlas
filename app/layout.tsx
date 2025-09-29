import "./globals.css"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "세계 빵 도감 프로젝트",
  description: "500종 도전: 연구, 레시피, 기록",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header className="border-b sticky top-0 bg-white/80 backdrop-blur z-40">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
            <Link href="/" className="font-semibold text-lg">세계 빵 도감</Link>
            <nav className="text-sm flex gap-4 text-gray-600">
              <Link href="/catalog">Catalog</Link>
              <Link href="/dashboard">Progress</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/admin">Admin</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
        <footer className="border-t mt-10 text-center text-sm text-gray-500 py-8">© 세계 빵 도감 프로젝트</footer>
      </body>
    </html>
  )
}

