import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroBanner } from "@/components/home/hero-banner"
import { RecommendedProducts } from "@/components/home/recommended-products"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <HeroBanner />
          <RecommendedProducts />
        </div>
      </main>
      <Footer />
    </div>
  )
}
