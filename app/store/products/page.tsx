import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Breadcrumb } from "@/components/breadcrumb"
import { ProductCard } from "@/components/product-card"
import { mockProducts } from "@/lib/store"
import { ArrowLeft, Package } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AllProductsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Breadcrumb
            items={[
              { label: "HOME", href: "/" },
              { label: "STORE", href: "/store" },
              { label: "ALL PRODUCTS", href: "/store/products" },
            ]}
          />

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">สินค้าทั้งหมด</h1>
                <p className="text-sm text-muted-foreground">ALL PRODUCTS ({mockProducts.length} รายการ)</p>
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {mockProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
