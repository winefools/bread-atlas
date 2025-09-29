"use client"
import useSWR from "swr"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import Link from "next/link"
import { supabase } from "@/lib/supabase-client"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Bread = {
  id: number
  name: string
  origin?: string | null
  fermentation?: string | null
  texture?: string | null
  category?: string | null
  ingredients?: string | null
  description?: string | null
  imageUrl?: string | null
  status: string
}

export default function AdminPage() {
  const { data: breads = [], mutate } = useSWR<Bread[]>("/api/breads", fetcher)
  const { data: posts = [], mutate: mutatePosts } = useSWR<any[]>("/api/posts", fetcher)
  const [form, setForm] = useState<Partial<Bread>>({ name: "" })
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [postTitle, setPostTitle] = useState("")
  const [postContent, setPostContent] = useState("")

  const save = async () => {
    setErr(null)
    const res = await fetch("/api/breads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setForm({ name: "" })
      mutate()
    } else setErr((await res.json()).error || "실패")
  }

  const remove = async (id: number) => {
    const res = await fetch(`/api/breads/${id}`, { method: "DELETE" })
    if (res.ok) mutate()
  }

  const uploadCsv = async () => {
    if (!csvFile) return
    const fd = new FormData()
    fd.append("file", csvFile)
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
    if (res.ok) mutate()
  }

  const uploadImage = async () => {
    if (!imageFile) return
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "bread-images"
    // Prefer client-side upload via Supabase anon key
    if (supabase) {
      const path = `breads/${Date.now()}-${imageFile.name}`
      const { error } = await supabase.storage.from(bucket).upload(path, imageFile, { upsert: true })
      if (!error) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path)
        setForm({ ...form, imageUrl: data.publicUrl })
        return
      }
    }
    // Fallback to server API upload (service role)
    const fd = new FormData()
    fd.append("file", imageFile)
    const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd })
    if (res.ok) {
      const data = await res.json()
      setForm({ ...form, imageUrl: data.url })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <Link href="/admin/login" className="text-sm text-gray-500 underline">로그인 페이지</Link>
      </div>

      <section className="border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold">새 빵 등록</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input placeholder="이름" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="원산지" value={form.origin || ""} onChange={(e) => setForm({ ...form, origin: e.target.value })} />
          <Input placeholder="이미지 URL" value={form.imageUrl || ""} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          <div className="flex items-center gap-2">
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            <Button type="button" onClick={uploadImage} disabled={!imageFile} className="h-9">이미지 업로드</Button>
          </div>
          <Select value={form.status || "planned"} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="planned">planned</option>
            <option value="in_progress">in_progress</option>
            <option value="completed">completed</option>
          </Select>
          <Input placeholder="발효 (yeast/sourdough/none)" value={form.fermentation || ""} onChange={(e) => setForm({ ...form, fermentation: e.target.value })} />
          <Input placeholder="질감 (crusty/soft/chewy)" value={form.texture || ""} onChange={(e) => setForm({ ...form, texture: e.target.value })} />
          <Input placeholder="카테고리" value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Input placeholder="태그(,로 구분)" value={(form as any).tags || ""} onChange={(e) => setForm({ ...form, tags: (e.target as any).value } as any)} />
          <Textarea placeholder="재료" value={form.ingredients || ""} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} />
          <Textarea placeholder="설명" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <Button onClick={save}>등록</Button>
      </section>

      <section className="border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold">CSV 업로드</h2>
        <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} />
        <Button onClick={uploadCsv} disabled={!csvFile}>업로드</Button>
      </section>

      <section className="border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold">Blog 포스트 작성</h2>
        <Input placeholder="제목" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
        <Textarea placeholder="내용" value={postContent} onChange={(e) => setPostContent(e.target.value)} />
        <Button onClick={createPost} disabled={!postTitle}>작성</Button>
        <div className="space-y-2">
          {posts.map((p) => (
            <div key={p.id} className="border rounded p-2 flex items-center justify-between">
              <div className="text-sm"><span className="font-medium">{p.title}</span></div>
              <div className="flex gap-2">
                <Button onClick={() => deletePost(p.id)} className="h-8 px-2">삭제</Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">빵 목록</h2>
        <div className="grid gap-3">
  const createPost = async () => {
    const res = await fetch('/api/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: postTitle, content: postContent }) })
    if (res.ok) { setPostTitle(''); setPostContent(''); mutatePosts() }
  }

  const deletePost = async (id: number) => {
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    if (res.ok) mutatePosts()
  }
          {breads.map((b) => (
            <div key={b.id} className="border rounded-lg p-3 flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium">{b.name}</span>
                <span className="text-gray-500"> • {b.origin || "-"} • {b.status}</span>
              </div>
              <div className="flex gap-2">
                <Link className="text-sm underline" href={`/bread/${b.id}`}>보기</Link>
                <Button onClick={() => remove(b.id)} className="h-8 px-2">삭제</Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
