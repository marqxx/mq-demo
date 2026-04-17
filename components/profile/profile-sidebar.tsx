"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import {
  LayoutGrid,
  ShoppingBag,
  Wallet,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react"

const menuItems = [
  { href: "/profile", label: "ภาพรวมบัญชี", icon: LayoutGrid },
  { href: "/profile/orders", label: "ประวัติการสั่งซื้อ", icon: ShoppingBag },
  { href: "/profile/topup-history", label: "ประวัติการเติมเงิน", icon: Wallet },
]

export function ProfileSidebar() {
  const pathname = usePathname()
  const { user } = useStore()

  return (
    <aside className="rounded-xl bg-white border border-border shadow-sm p-6">
      {/* User Info */}
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"}
            alt={user?.username || "User"}
            className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/20"
          />
          {user?.isOnline && (
            <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-card bg-emerald-500" />
          )}
        </div>
        <h2 className="mt-4 text-lg font-bold text-foreground">{user?.username || "Guest"}</h2>
        <p className="text-sm text-muted-foreground">{user?.email || "guest@example.com"}</p>
        <p className="text-xs text-muted-foreground">ID: {user?.id || "unknown"}</p>
        <p className="mt-2 text-lg font-semibold text-primary">
          {user?.balance?.toLocaleString() || 0} บาท
        </p>
        <span className="mt-2 rounded-md border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
          {user?.role || "USER"}
        </span>
      </div>

      {/* Menu */}
      <nav className="mt-8 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                {item.label}
              </div>
              {isActive && <ChevronRight className="h-4 w-4" />}
            </Link>
          )
        })}

        {/* Logout */}
        <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <LogOut className="h-5 w-5" />
          ออกจากระบบ
        </button>
      </nav>
    </aside>
  )
}
