"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface Category {
  id: string
  name: string
  image: string | null
}

export function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-muted-foreground/20 py-12 text-center">
        <p className="text-muted-foreground">ไม่พบหมวดหมู่</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/store/category/${category.id}`}
          className="group relative overflow-hidden rounded-xl bg-white border border-border shadow-sm transition-all hover:shadow-md hover:border-primary/30"
        >
          <div className="relative h-32 overflow-hidden sm:h-36">
            <img
              src={category.image || "https://placehold.jp/800x200.png?text=" + category.name}
              alt={category.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center p-6">
              <span className="text-xs text-muted-foreground">ประเภท</span>
              <h3 className="text-xl font-bold text-foreground sm:text-2xl">{category.name}</h3>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
