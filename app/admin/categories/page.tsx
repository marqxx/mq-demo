"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Tags,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Check,
  Hash,
  Box,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CategoryData {
  id: string
  name: string
  createdAt: string
  _count?: { products: number }
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null)
  const [categoryName, setCategoryName] = useState("")
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [toast, setToast] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories")
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
    const interval = setInterval(fetchCategories, 10000)
    return () => clearInterval(interval)
  }, [fetchCategories])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleEdit = (category: CategoryData) => {
    setEditingCategory(category)
    setCategoryName(category.name)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจที่จะลบหมวดหมู่นี้? สินค้าที่อยู่ในหมวดหมู่นี้จะได้รับผลกระทบ")) return
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
      if (res.ok) {
        showToast("ลบหมวดหมู่สำเร็จ")
        fetchCategories()
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
    if (!categoryName.trim()) return
    setSaving(true)

    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}` 
        : "/api/admin/categories"
      const method = editingCategory ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName }),
      })

      if (res.ok) {
        showToast(editingCategory ? "แก้ไขสำเร็จ" : "เพิ่มหมวดหมู่สำเร็จ")
        setShowModal(false)
        setCategoryName("")
        setEditingCategory(null)
        fetchCategories()
      } else {
        const data = await res.json()
        showToast(data.error || "เกิดข้อผิดพลาด")
      }
    } catch (error) {
      showToast("เกิดข้อผิดพลาด")
    } finally {
      setSaving(false)
    }
  }

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-2xl">
            <Check className="h-4 w-4 text-emerald-400" />
            {toast}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-sm border border-blue-200">
            <Tags className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">จัดการหมวดหมู่</h1>
            <p className="text-sm font-medium text-gray-500">จัดการประเภทสินค้าทั้งหมดในระบบ</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null)
            setCategoryName("")
            setShowModal(true)
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-95"
        >
          <Plus className="h-4 w-4" />
          เพิ่มหมวดหมู่ใหม่
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">หมวดหมู่ทั้งหมด</span>
              <Tags className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-3xl font-black text-gray-900">{categories.length}</div>
         </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Table Filters */}
        <div className="border-b border-gray-100 bg-gray-50/50 p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาหมวดหมู่..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4">ID / ชื่อหมวดหมู่</th>
                <th className="px-6 py-4">วันที่สร้าง</th>
                <th className="px-6 py-4 text-right">เครื่องมือ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                      <p className="text-sm font-bold text-gray-400">กำลังโหลดข้อมูล...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 opacity-30">
                      <Tags className="h-12 w-12" />
                      <p className="text-lg font-bold">ไม่พบข้อมูลหมวดหมู่</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="group hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          <Hash className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-black text-gray-900">{category.name}</div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate w-32">{category.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-600">
                        {new Date(category.createdAt).toLocaleDateString("th-TH")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-all hover:bg-blue-100 hover:text-blue-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-all hover:bg-red-100 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Plus className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-black tracking-tight text-gray-900">
                    {editingCategory ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
                  </h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">ชื่อหมวดหมู่</label>
                  <input
                    type="text"
                    required
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="เช่น ไอดีเกม, เติมเงินมือถือ..."
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm font-bold text-gray-900 outline-none transition-all focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                  <p className="text-[10px] font-bold text-gray-400">ห้ามตั้งชื่อหมวดหมู่ซ้ำกับที่มีอยู่เดิม</p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 rounded-2xl border border-gray-200 px-6 py-3.5 text-sm font-black text-gray-600 transition-all hover:bg-gray-50 active:scale-95"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                  >
                    {saving ? "กำลังบันทึก..." : editingCategory ? "บันทึกการแก้ไข" : "เพิ่มหมวดหมู่"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
