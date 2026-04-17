"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingCart, Tag } from "lucide-react"
import { ProductCard } from "@/components/product-card"

export function RecommendedProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/products?isHot=true&limit=5")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data.map(p => ({
            ...p,
            id: p.id.toString(),
            category: p.category, // Map the included category object
            image: p.image || "https://placehold.jp/400x400.png"
          })))
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    )
  }

  if (products.length === 0) return null

  const recommendedProducts = products

  return (
    <section>
      {/* Section Header */}
      <div className="mb-6 flex items-center gap-3">
        <ShoppingCart className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-lg font-bold text-foreground">สินค้าแนะนำ</h2>
          <p className="text-sm text-muted-foreground">RECOMMENDED PRODUCTS</p>
        </div>
      </div>

      {/* Products Grid - 5 columns on xl */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {recommendedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* View All Link */}
      <div className="mt-6 text-center">
        <Link
          href="/store"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <Tag className="h-4 w-4" />
          ดูสินค้าทั้งหมด
        </Link>
      </div>
    </section>
  )
}
