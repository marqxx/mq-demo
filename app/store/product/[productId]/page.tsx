"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { notFound, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Breadcrumb } from "@/components/breadcrumb"
import { 
  ArrowLeft, Package, Infinity, ShoppingBag, Minus, Plus, 
  Ticket, Check, AlertCircle, Copy, X, Sparkles, Gift
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  description: string
  price: number
  discount?: number | null
  image: string | null
  categoryId: string
  category?: { id: string; name: string }
  stockCount: number
  isUnlimited: boolean
  pointsEarn: number
  isHot: boolean
}

interface StockItem {
  email: string
  password: string
  data?: string | null
}

interface ProductPageProps {
  params: Promise<{ productId: string }>
}

export default function ProductPage({ params }: ProductPageProps) {
  const { productId } = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // Purchase state
  const [quantity, setQuantity] = useState(1)
  const [couponCode, setCouponCode] = useState("")
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponValid, setCouponValid] = useState<boolean | null>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  
  // Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseResult, setPurchaseResult] = useState<{
    order: any
    stockItems: StockItem[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isAuthenticated = status === "authenticated"
  const user = session?.user

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then((data) => setProduct(data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [productId])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!product) {
    notFound()
  }

  const category = product.category
  const unitPrice = product.discount && product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product.price
  const subtotal = unitPrice * quantity
  const totalPrice = subtotal - couponDiscount
  const pointsEarned = product.pointsEarn * quantity
  const maxQuantity = product.isUnlimited ? 5 : Math.min(5, product.stockCount)
  const isOutOfStock = !product.isUnlimited && product.stockCount === 0

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta
    if (newQty >= 1 && newQty <= maxQuantity) {
      setQuantity(newQty)
      // Reset coupon when quantity changes
      if (couponValid) {
        validateCoupon()
      }
    }
  }

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponDiscount(0)
      setCouponValid(null)
      return
    }

    setValidatingCoupon(true)
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, totalPrice: subtotal }),
      })

      const data = await res.json()
      if (res.ok && data.isValid) {
        setCouponDiscount(data.discount)
        setCouponValid(true)
      } else {
        setCouponDiscount(0)
        setCouponValid(false)
        setError(data.error || "คูปองไม่ถูกต้อง")
        setTimeout(() => setError(null), 3000)
      }
    } catch {
      setCouponDiscount(0)
      setCouponValid(false)
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handlePurchase = () => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    setShowConfirmModal(true)
  }

  const confirmPurchase = async () => {
    setPurchasing(true)
    setError(null)

    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          couponCode: couponValid ? couponCode : undefined,
        }),
      })

      const data = await res.json()
      
      if (res.ok && data.success) {
        setPurchaseResult(data)
        setShowConfirmModal(false)
        setShowSuccessModal(true)
      } else {
        setError(data.error || "เกิดข้อผิดพลาดในการสั่งซื้อ")
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ")
    } finally {
      setPurchasing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      {/* Error Toast */}
      {error && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-lg bg-destructive px-4 py-3 text-destructive-foreground shadow-xl animate-in slide-in-from-right">
          <AlertCircle className="h-4 w-4" />
          <span className="font-medium text-sm">{error}</span>
        </div>
      )}

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <Breadcrumb
            items={[
              { label: "HOME", href: "/" },
              { label: "STORE", href: "/store" },
              { label: category?.name || "GENERAL", href: `/store/category/${product.categoryId}` },
              { label: product.name, href: `/store/product/${productId}` },
            ]}
          />

          {/* Product Detail — tighter 5:7 grid */}
          <div className="mt-6 grid gap-6 lg:grid-cols-12">
            {/* Left: Image */}
            <div className="lg:col-span-5">
              <div className="sticky top-20 overflow-hidden rounded-xl bg-white border border-border shadow-sm">
                <div className="relative aspect-square">
                  {!imageLoaded && (
                    <div className="absolute inset-0 animate-pulse bg-muted" />
                  )}
                  <img
                    src={product.image || "https://placehold.jp/e8edf5/3b5998/600x600.png?text=No+Image"}
                    alt={product.name}
                    className={cn(
                      "h-full w-full object-cover transition-opacity duration-300",
                      imageLoaded ? "opacity-100" : "opacity-0"
                    )}
                    onLoad={() => setImageLoaded(true)}
                  />
                  {product.isHot && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground badge-hot">
                      <Sparkles className="h-3 w-3" />
                      HOT
                    </div>
                  )}
                  {product.discount && product.discount > 0 && (
                    <div className="absolute left-3 top-3 rounded-full bg-success px-2.5 py-1 text-xs font-bold text-success-foreground">
                      -{product.discount}%
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Info */}
            <div className="lg:col-span-7 space-y-4">
              {/* Title + Price */}
              <div className="rounded-xl bg-white border border-border shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-full">{category?.name || "GENERAL"}</span>
                    </div>
                    <h1 className="text-xl font-bold text-foreground leading-tight">{product.name}</h1>
                  </div>
                  <div className="text-right shrink-0">
                    {product.discount && product.discount > 0 && (
                      <span className="text-xs text-muted-foreground line-through block">{product.price.toLocaleString()}฿</span>
                    )}
                    <span className="text-2xl font-bold text-primary">{Math.floor(unitPrice).toLocaleString()}</span>
                    <span className="text-sm font-medium text-primary ml-0.5">฿</span>
                  </div>
                </div>

                {/* Description — inline, no big box */}
                {product.description && (
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-line border-t border-border pt-3">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Meta: Stock + Points — compact row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 rounded-xl bg-white border border-border shadow-sm px-4 py-3">
                  <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">สต็อก</p>
                    <p className="text-sm font-semibold text-foreground">
                      {product.isUnlimited ? (
                        <span className="inline-flex items-center gap-1">ไม่จำกัด <Infinity className="h-3.5 w-3.5 text-primary" /></span>
                      ) : (
                        <span className={product.stockCount > 0 ? "text-foreground" : "text-destructive"}>
                          {product.stockCount} ชิ้น
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white border border-border shadow-sm px-4 py-3">
                  <Gift className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">พอยท์</p>
                    <p className="text-sm font-semibold text-foreground">
                      {product.pointsEarn > 0 ? `+${product.pointsEarn}/ชิ้น` : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Purchase Card */}
              <div className="rounded-xl bg-white border border-border shadow-sm p-5 space-y-4">
                {/* Quantity */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">จำนวน</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-lg border border-border">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-foreground">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= maxQuantity}
                        className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-xs text-muted-foreground">สูงสุด {maxQuantity}</span>
                  </div>
                </div>

                {/* Coupon — compact inline */}
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase())
                        setCouponValid(null)
                        setCouponDiscount(0)
                      }}
                      placeholder="โค้ดส่วนลด"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                    {couponValid === true && (
                      <Check className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-success" />
                    )}
                    {couponValid === false && (
                      <X className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <Button
                    onClick={validateCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                    variant="outline"
                    size="sm"
                    className="shrink-0 border-border text-foreground hover:bg-muted"
                  >
                    {validatingCoupon ? "..." : "ใช้โค้ด"}
                  </Button>
                </div>
                {couponValid && couponDiscount > 0 && (
                  <p className="text-xs text-success pl-8">ลด ฿{couponDiscount.toLocaleString()}</p>
                )}

                {/* Summary */}
                <div className="border-t border-border pt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>สินค้า × {quantity}</span>
                    <span>{Math.floor(subtotal).toLocaleString()}฿</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>คูปอง</span>
                      <span>-{couponDiscount.toLocaleString()}฿</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline pt-1.5 border-t border-dashed border-border">
                    <span className="font-semibold text-foreground">รวม</span>
                    <span className="text-xl font-bold text-primary">{Math.floor(totalPrice).toLocaleString()}฿</span>
                  </div>
                  {pointsEarned > 0 && (
                    <p className="text-xs text-primary text-right">+{pointsEarned} พอยท์</p>
                  )}
                </div>

                {/* Buy Button */}
                <Button
                  className="w-full h-11 font-bold"
                  onClick={handlePurchase}
                  disabled={isOutOfStock || purchasing}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {isOutOfStock ? "สินค้าหมด" : isAuthenticated ? "สั่งซื้อ" : "เข้าสู่ระบบเพื่อซื้อ"}
                </Button>
              </div>

              {/* Back link */}
              <Link
                href={`/store/category/${product.categoryId}`}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                กลับไปหมวดหมู่
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Confirm Purchase Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
          
          <div className="relative w-full max-w-sm rounded-xl bg-white border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="border-b border-border px-5 py-3.5 flex items-center justify-between">
              <h2 className="font-bold text-foreground">ยืนยันการสั่งซื้อ</h2>
              <button onClick={() => setShowConfirmModal(false)} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex gap-3">
                <img
                  src={product.image || "https://placehold.jp/e8edf5/3b5998/100x100.png?text=No+Image"}
                  alt={product.name}
                  className="h-16 w-16 rounded-lg object-cover border border-border"
                />
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground text-sm truncate">{product.name}</h3>
                  <p className="text-xs text-muted-foreground">จำนวน {quantity} ชิ้น</p>
                  <p className="text-lg font-bold text-primary mt-0.5">฿{Math.floor(totalPrice).toLocaleString()}</p>
                </div>
              </div>

              <div className="rounded-lg bg-warning/10 border border-warning/20 px-3 py-2.5">
                <p className="text-xs text-warning font-medium">ยอดเงินจะถูกหักจากบัญชีของคุณทันที</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">คงเหลือ: ฿{((user as any)?.balance || 0).toLocaleString()}</p>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5">
                  <p className="text-xs text-destructive font-medium">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={purchasing}
                >
                  ยกเลิก
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={confirmPurchase}
                  disabled={purchasing}
                >
                  {purchasing ? "กำลังดำเนินการ..." : "ยืนยันซื้อ"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && purchaseResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          
          <div className="relative w-full max-w-sm rounded-xl bg-white border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/15 mb-3">
                <Check className="h-6 w-6 text-success" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-1">สั่งซื้อสำเร็จ!</h2>
              <p className="text-xs text-muted-foreground">Order #{purchaseResult.order.id}</p>
            </div>

            {/* Stock Items (Account Info) */}
            {purchaseResult.stockItems.length > 0 && (
              <div className="border-t border-border px-5 py-4">
                <h3 className="font-semibold text-sm text-foreground mb-2">ข้อมูลบัญชีของคุณ</h3>
                <div className="space-y-2">
                  {purchaseResult.stockItems.map((item, index) => (
                    <div key={index} className="rounded-lg bg-muted/60 p-3 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">อีเมล/ชื่อผู้ใช้</span>
                        <button
                          onClick={() => copyToClipboard(item.email)}
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <Copy className="h-3 w-3" />
                          คัดลอก
                        </button>
                      </div>
                      <p className="font-mono text-sm text-foreground break-all">{item.email}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">รหัสผ่าน</span>
                        <button
                          onClick={() => copyToClipboard(item.password)}
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <Copy className="h-3 w-3" />
                          คัดลอก
                        </button>
                      </div>
                      <p className="font-mono text-sm text-foreground break-all">{item.password}</p>

                      {item.data && (
                        <>
                          <span className="text-muted-foreground">ข้อมูลเพิ่มเติม</span>
                          <p className="font-mono text-foreground break-all">{item.data}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  * ดูข้อมูลนี้ได้อีกครั้งในประวัติการสั่งซื้อ
                </p>
              </div>
            )}

            <div className="border-t border-border px-5 py-3">
              <Button
                className="w-full h-9 text-sm"
                onClick={() => {
                  setShowSuccessModal(false)
                  router.push("/profile/orders")
                }}
              >
                ไปยังประวัติการสั่งซื้อ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
