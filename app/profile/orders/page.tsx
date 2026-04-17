"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useStore, type OrderHistory } from "@/lib/store"
import { Package, CheckCircle, Copy, Check, Eye, EyeOff, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function OrderCard({ order }: { order: OrderHistory }) {
  const [showCredentials, setShowCredentials] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden transition-all hover:border-primary/30">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <img
              src={order.productImage}
              alt={order.productName}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">{order.productName}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(order.date).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-semibold text-foreground">{order.price.toLocaleString()} บาท</p>
            <span
              className={cn(
                "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                order.status === "SUCCESS"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : order.status === "PENDING"
                  ? "bg-yellow-500/10 text-yellow-500"
                  : "bg-red-500/10 text-red-500"
              )}
            >
              {order.status === "SUCCESS" ? "สำเร็จ" : order.status === "PENDING" ? "รอดำเนินการ" : "ยกเลิก/ล้มเหลว"}
            </span>
          </div>
          <ChevronDown className={cn(
            "h-5 w-5 text-muted-foreground transition-transform",
            isExpanded && "rotate-180"
          )} />
        </div>
      </div>

      {/* Expanded Content - Account Credentials */}
      {isExpanded && order.accountCredentials && (
        <div className="border-t border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-foreground">ข้อมูลบัญชี</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCredentials(!showCredentials)}
              className="h-8 px-2 text-muted-foreground hover:text-primary"
            >
              {showCredentials ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  ซ่อน
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  แสดง
                </>
              )}
            </Button>
          </div>

          <div className="space-y-3">
            {/* Email */}
            <div className="flex items-center justify-between rounded-lg bg-background border border-border p-3">
              <div className="min-w-0 flex-1 mr-3">
                <p className="text-xs text-muted-foreground mb-1">อีเมล</p>
                <p className="text-sm font-mono text-foreground truncate">
                  {showCredentials ? order.accountCredentials.email : "••••••••••••@••••.com"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(order.accountCredentials!.email, `email-${order.id}`)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary flex-shrink-0"
                disabled={!showCredentials}
              >
                {copiedField === `email-${order.id}` ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Password */}
            <div className="flex items-center justify-between rounded-lg bg-background border border-border p-3">
              <div className="min-w-0 flex-1 mr-3">
                <p className="text-xs text-muted-foreground mb-1">รหัสผ่าน</p>
                <p className="text-sm font-mono text-foreground truncate">
                  {showCredentials ? order.accountCredentials.password : "••••••••••••"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(order.accountCredentials!.password, `password-${order.id}`)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary flex-shrink-0"
                disabled={!showCredentials}
              >
                {copiedField === `password-${order.id}` ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            * กรุณาเปลี่ยนรหัสผ่านทันทีหลังจากเข้าสู่ระบบครั้งแรก
          </p>
        </div>
      )}
    </div>
  )
}

export default function OrdersPage() {
  const { orders } = useStore()
  const searchParams = useSearchParams()
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }
  }, [searchParams])

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-3 rounded-lg bg-emerald-500 px-4 py-3 text-white shadow-lg animate-in slide-in-from-right">
          <CheckCircle className="h-5 w-5" />
          <span>สั่งซื้อสินค้าสำเร็จ!</span>
        </div>
      )}

      {/* Header */}
      <div className="rounded-xl border border-border bg-white shadow-sm p-6">
        <h1 className="text-xl font-bold text-foreground">ประวัติการสั่งซื้อ</h1>
        <p className="text-sm text-muted-foreground">รายการสั่งซื้อทั้งหมดของคุณ</p>
      </div>

      {/* Orders List or Empty State */}
      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white shadow-sm p-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-20 w-20 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">ไม่มีประวัติการสั่งซื้อ</h3>
            <p className="mt-2 text-muted-foreground">เลือกซื้อสินค้าที่ร้านค้าได้เลย</p>
          </div>
        </div>
      )}
    </div>
  )
}
