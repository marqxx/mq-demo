import Link from "next/link"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Breadcrumb } from "@/components/breadcrumb"
import { ProductCard } from "@/components/product-card"
import { prisma } from "@/lib/prisma"
import { ArrowLeft, Package } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CategoryPageProps {
  params: Promise<{ categoryId: string }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categoryId } = await params
  const category = await prisma.category.findUnique({
    where: { id: categoryId }
  })

  if (!category) {
    notFound()
  }

  const products = await prisma.product.findMany({
    where: { categoryId, isActive: true },
    include: { category: true },
    orderBy: { createdAt: "desc" }
  })

  // Adapt products for UI component
  const adaptedProducts = products.map(p => ({
    ...p,
    id: p.id,
    category: p.category,
    image: p.image || "https://placehold.jp/400x400.png"
  })) as any[]

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Breadcrumb
            items={[
              { label: "HOME", href: "/" },
              { label: "STORE", href: "/store" },
              { label: category.name, href: `/store/category/${categoryId}` },
            ]}
          />

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">{category.name}</h1>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href="/store" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                ย้อนกลับ
              </Link>
            </Button>
          </div>

          {/* Products Grid - 5 columns on xl */}
          {adaptedProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {adaptedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl bg-card py-16">
              <Package className="h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">ไม่พบสินค้า</h3>
              <p className="text-muted-foreground">ยังไม่มีสินค้าในหมวดหมู่นี้</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
