"use client"

import { useStore } from "@/lib/store"
import { Wallet, ShoppingBag, Gift, TrendingUp } from "lucide-react"

const stats = [
  { label: "ยอดเงินคงเหลือ", value: "0 บาท", icon: Wallet, color: "text-primary" },
  { label: "จำนวนคำสั่งซื้อ", value: "0 รายการ", icon: ShoppingBag, color: "text-primary" },
  { label: "พอยท์สะสม", value: "0 พอยท์", icon: Gift, color: "text-primary" },
  { label: "ยอดซื้อทั้งหมด", value: "0 บาท", icon: TrendingUp, color: "text-primary" },
]

export default function ProfilePage() {
  const { user } = useStore()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-white border border-border shadow-sm p-6">
        <h1 className="text-xl font-bold text-foreground">ภาพรวมบัญชี</h1>
        <p className="text-sm text-muted-foreground">ข้อมูลบัญชีและสถิติของคุณ</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="flex items-center justify-between rounded-xl bg-white border border-border shadow-sm p-4"
            >
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
              </div>
              <Icon className={`h-10 w-10 ${stat.color} opacity-80`} />
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl bg-white border border-border shadow-sm p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">กิจกรรมล่าสุด</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">ยังไม่มีกิจกรรม</p>
        </div>
      </div>
    </div>
  )
}
