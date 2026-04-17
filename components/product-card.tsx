"use client"

import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  price: number
  discount?: number | null
  image: string | null
  categoryId: string
  isUnlimited: boolean
  pointsEarn: number
  isHot: boolean
  badge?: string | null
  stockCount?: number
  category?: { id: string; name: string }
}

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  const finalPrice = product.discount && product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product.price

  const stockDisplay = product.isUnlimited
    ? "สินค้าพร้อมส่ง"
    : (product.stockCount || 0) > 0
    ? `คงเหลือ ${product.stockCount} ชิ้น`
    : "สินค้าหมด"

  const isOutOfStock = !product.isUnlimited && (product.stockCount || 0) === 0

  return (
    <Link
      href={`/store/product/${product.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl bg-white border border-border shadow-sm transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5",
        isOutOfStock && "opacity-60",
        className
      )}
    >
      {/* HOT Badge */}
      {product.isHot && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground badge-hot">
          <Sparkles className="h-3 w-3" />
          HOT
        </div>
      )}

      {/* Discount Badge */}
      {product.discount && product.discount > 0 && (
        <div className="absolute left-3 top-3 z-10 rounded-full bg-success px-2.5 py-1 text-xs font-bold text-success-foreground">
          -{product.discount}%
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}
        <img
          src={product.image || "https://placehold.jp/e8edf5/3b5998/400x400.png?text=No+Image"}
          alt={product.name}
          className={cn(
            "h-full w-full object-cover transition-all duration-300 group-hover:scale-105",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <span className="text-sm font-bold text-muted-foreground">สินค้าหมด</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Product Name */}
        <h3 className="font-semibold text-foreground line-clamp-2 text-sm group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        {/* Category */}
        <p className="mt-1 text-xs text-muted-foreground">
          หมวดหมู่: <span className="text-muted-foreground">{product.category?.name || "ไม่ระบุ"}</span>
        </p>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Stock & Price */}
        <div className="mt-3 flex items-center justify-between">
          <span className={cn(
            "text-xs",
            isOutOfStock ? "text-destructive" : "text-muted-foreground"
          )}>
            {stockDisplay}
          </span>
          <div className="flex flex-col items-end">
            {product.discount && product.discount > 0 && (
              <span className="text-xs text-muted-foreground line-through">
                {product.price.toLocaleString()}฿
              </span>
            )}
            <span className="flex items-center gap-0.5 text-lg font-bold text-primary">
              {Math.floor(finalPrice).toLocaleString()}
              <span className="text-sm">฿</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
