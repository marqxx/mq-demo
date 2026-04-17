"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Users,
  Pencil,
  Trash2,
  X,
  Search,
  Check,
  Shield,
  ShoppingCart,
  Wallet,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface UserData {
  id: number
  name: string | null
  username: string | null
  email: string | null
  image: string | null
  balance: number
  role: string
  createdAt: string
  _count: { orders: number; topups: number }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [formData, setFormData] = useState({ username: "", email: "", balance: "", role: "USER" })
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [toast, setToast] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users")
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
    const interval = setInterval(fetchUsers, 10000)
    return () => clearInterval(interval)
  }, [fetchUsers])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleEdit = (user: UserData) => {
    setEditingUser(user)
    setFormData({
      username: user.username || "",
      email: user.email || "",
      balance: user.balance.toString(),
      role: user.role,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจที่จะลบผู้ใช้นี้?")) return
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
      if (res.ok) {
        showToast("ลบผู้ใช้สำเร็จ")
        fetchUsers()
      } else {
        const data = await res.json()
        showToast(data.error || "เกิดข้อผิดพลาด")
      }
    } catch (error) {
      showToast("เกิดข้อผิดพลาด")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setSaving(true)

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        showToast("อัพเดทผู้ใช้สำเร็จ")
        setShowModal(false)
        fetchUsers()
      }
    } catch (error) {
      showToast("เกิดข้อผิดพลาด")
    } finally {
      setSaving(false)
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      (u.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-white shadow-lg">
          <Check className="h-4 w-4" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ผู้ใช้งาน</h1>
        <p className="text-sm text-gray-500">จัดการผู้ใช้งานทั้งหมดในระบบ</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="ค้นหาผู้ใช้..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ผู้ใช้</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">อีเมล</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ยอดเงิน</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">สิทธิ์</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">สั่งซื้อ</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">เติมเงิน</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">สมัครเมื่อ</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
                      {(user.username || user.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{user.username || user.name || "-"}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.email || "-"}</td>
                <td className="px-6 py-4 text-sm font-semibold text-blue-600">฿{user.balance.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                      user.role.toLowerCase() === "admin"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {user.role.toLowerCase() === "admin" && <Shield className="h-3 w-3" />}
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                    <ShoppingCart className="h-3.5 w-3.5" />
                    {user._count.orders}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                    <Wallet className="h-3.5 w-3.5" />
                    {user._count.topups}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString("th-TH")}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleEdit(user)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-200" />
                  <p className="mt-3 text-sm text-gray-500">ไม่พบผู้ใช้</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Premium Edit Modal */}
      {showModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)} />
          
          <div className="relative w-full max-w-sm rounded-[24px] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-8 py-8 text-center relative">
              <button 
                onClick={() => setShowModal(false)} 
                className="absolute right-4 top-4 rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg text-blue-600 mb-4 border-4 border-blue-100">
                <span className="text-3xl font-black tracking-tight">
                  {(formData.username || formData.email || "U").charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                แก้ไขข้อมูลผู้ใช้
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {editingUser.email || "ไม่มีอีเมล"}
              </p>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="px-8 py-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">ชื่อผู้ใช้งาน</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow bg-gray-50/50"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">อีเมล ติดต่อ</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow bg-gray-50/50"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">ยอดเงินคงเหลือ (เครดิต)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">฿</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.balance}
                      onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                      className="w-full rounded-xl border border-emerald-200 pl-8 pr-4 py-3 text-sm font-black text-emerald-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-shadow bg-emerald-50/30"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">บทบาท / สิทธิ์การใช้งาน</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 text-sm font-bold outline-none transition-shadow appearance-none cursor-pointer",
                      formData.role.toLowerCase() === "admin" 
                        ? "border-amber-200 bg-amber-50 text-amber-700" 
                        : "border-gray-200 bg-gray-50 text-gray-700"
                    )}
                  >
                    <option value="USER">ผู้ใช้ทั่วไป (User)</option>
                    <option value="ADMIN">ผู้ดูแลระบบ (Admin)</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-all hover:shadow hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saving ? "กำลังบันทึก..." : "อัพเดทข้อมูล"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
