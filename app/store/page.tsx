import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Breadcrumb } from "@/components/breadcrumb"
import { CategoryGrid } from "@/components/store/category-grid"
import { ArrowLeft, Grid3X3, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function StorePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Breadcrumb
            items={[
              { label: "HOME", href: "/" },
              { label: "STORE", href: "/store" },
            ]}
          />

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Grid3X3 className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">เลือกหมวดหมู่ที่คุณต้องการ</h1>
                <p className="text-sm text-muted-foreground">SELECT THE CATEGORY YOU WANT</p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                ย้อนกลับ
              </Link>
            </Button>
          </div>

          <CategoryGrid />
        </div>
      </main>
      <Footer />
    </div>
  )
}
