"use client"

import { useEffect, useState, useCallback } from "react"
import { ShoppingCart, Package, Users, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface OrderData {
  id: string
  userId: string
  productId: string
  productName: string
  productImage: string | null
  price: number
  quantity: number
  status: string
  accountEmail: string | null
  accountPassword: string | null
  createdAt: string
  user: { username: string | null; name: string | null; email: string | null }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders")
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  const filteredOrders = orders.filter((o) => (filter === "all" ? true : o.status === filter))

  const totalRevenue = orders
    .filter((o) => o.status === "SUCCESS")
    .reduce((sum, o) => sum + o.price, 0)

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">การสั่งซื้อ</h1>
          <p className="text-sm text-gray-500">
            รวม {orders.length} รายการ · รายได้รวม ฿{totalRevenue.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filter Tags */}
      <div className="flex gap-2">
        {[
          { id: "all", label: "ทั้งหมด" },
          { id: "SUCCESS", label: "สำเร็จ" },
          { id: "PENDING", label: "รอดำเนินการ" },
          { id: "FAILED", label: "ยกเลิก/ล้มเหลว" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              filter === f.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">สินค้า</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ผู้ซื้อ</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ราคา</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">สถานะ</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">วันที่</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 flex-shrink-0">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{order.productName}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[10px] font-bold">
                      {(order.user.username || order.user.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-700">{order.user.username || order.user.name || "-"}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">฿{order.price.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "inline-block rounded-full px-2.5 py-1 text-xs font-medium",
                      order.status === "SUCCESS"
                        ? "bg-emerald-50 text-emerald-600"
                        : order.status === "PENDING"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-red-50 text-red-500"
                    )}
                  >
                    {order.status === "SUCCESS" ? "สำเร็จ" : order.status === "PENDING" ? "รอดำเนินการ" : "ยกเลิก/ล้มเหลว"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-200" />
                  <p className="mt-3 text-sm text-gray-500">ไม่มีรายการสั่งซื้อ</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
