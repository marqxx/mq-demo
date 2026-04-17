"use client"

import { useEffect, useState, useCallback } from "react"
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  Package,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsData {
  revenue: { current: number; change: number }
  orders: { current: number; change: number; total: number }
  users: { current: number; change: number; total: number }
  products: { total: number }
  recentOrders: {
    id: string
    productName: string
    price: number
    status: string
    userName: string
    createdAt: string
  }[]
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  prefix = "",
}: {
  title: string
  value: string | number
  change: number
  icon: any
  prefix?: string
}) {
  const isPositive = change >= 0
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {prefix}{typeof value === "number" ? value.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}
          </p>
          <div className="mt-1 flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                isPositive ? "text-emerald-500" : "text-red-500"
              )}
            >
              {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-xs text-gray-400">เทียบกับเดือนที่แล้ว</span>
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </div>
  )
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return `${diff} วินาทีที่แล้ว`
  if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`
  return `${Math.floor(diff / 86400)} วันที่แล้ว`
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [fetchStats])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ภาพรวม</h1>
        <p className="text-sm text-gray-500">สรุปข้อมูลร้านค้าทั้งหมด</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="รายได้เดือนนี้"
          value={stats?.revenue.current || 0}
          change={stats?.revenue.change || 0}
          icon={DollarSign}
          prefix="฿"
        />
        <StatCard
          title="คำสั่งซื้อเดือนนี้"
          value={stats?.orders.current || 0}
          change={stats?.orders.change || 0}
          icon={ShoppingCart}
        />
        <StatCard
          title="ผู้ใช้งานเดือนนี้"
          value={stats?.users.current || 0}
          change={stats?.users.change || 0}
          icon={Users}
        />
        <StatCard
          title="สินค้าทั้งหมด"
          value={stats?.products.total || 0}
          change={0}
          icon={Package}
        />
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">คำสั่งซื้อล่าสุด</h2>
            <p className="text-sm text-gray-500">แสดงรายการสั่งซื้อล่าสุดจากลูกค้า</p>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            stats.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.productName}</p>
                    <p className="text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {order.userName}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">฿{order.price.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{timeAgo(order.createdAt)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-12 w-12 text-gray-200" />
              <p className="mt-3 text-sm text-gray-500">ยังไม่มีคำสั่งซื้อ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
