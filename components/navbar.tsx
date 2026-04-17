"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useSession, signOut as nextAuthSignOut } from "next-auth/react"
import {
  Home,
  DollarSign,
  Store,
  History,
  Menu,
  X,
  User,
  Wallet,
  LogOut,
  LogIn,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navLinks = [
  { href: "/", label: "หน้าหลัก", icon: Home },
  { href: "/store", label: "ร้านค้า", icon: Store },
  { href: "/topup", label: "เติมเงิน", icon: DollarSign },
]

export function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const isAuthenticated = status === "authenticated"
  const user = session?.user

  const handleLogout = () => {
    nextAuthSignOut()
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">WEBSHOP</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">

            {isAuthenticated && user ? (
              <div className="flex items-center gap-4 px-2 py-1">
                {/* Balance Display */}
                <div className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">BALANCE</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-sm font-bold text-primary">฿</span>
                    <span className="text-sm font-bold text-primary">{(user as any).balance?.toLocaleString() || "0"}</span>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="hidden sm:block h-8 w-[1px] bg-border" />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 outline-none group">
                      <div className="hidden sm:flex flex-col items-start leading-tight">
                        <span className="text-sm font-bold text-foreground truncate max-w-[100px]">{(user as any).username || user.name}</span>
                        <span className="text-[11px] font-medium text-muted-foreground capitalize">{(user as any).role || "User"}</span>
                      </div>
                      
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-colors">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name || ""}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                              {(user.name || "U").charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                      </div>

                      <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white border-border text-foreground shadow-lg shadow-black/5">
                    <div className="px-3 py-2">
                      <p className="font-bold text-foreground">{(user as any).username || user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem asChild className="focus:bg-primary/5 focus:text-primary cursor-pointer text-foreground/70">
                      <Link href="/profile" className="flex items-center gap-2 w-full">
                        <User className="h-4 w-4" />
                        โปรไฟล์
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-primary/5 focus:text-primary cursor-pointer text-foreground/70">
                      <Link href="/profile/topup-history" className="flex items-center gap-2 w-full">
                        <Wallet className="h-4 w-4" />
                        ประวัติการเติมเงิน
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-primary/5 focus:text-primary cursor-pointer text-foreground/70">
                      <Link href="/profile/orders" className="flex items-center gap-2 w-full">
                        <History className="h-4 w-4" />
                        ประวัติการซื้อสินค้า
                      </Link>
                    </DropdownMenuItem>
                    {((user as any).role || "").toLowerCase() === "admin" && (
                      <>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem asChild className="focus:bg-primary/5 focus:text-primary cursor-pointer text-foreground/70">
                          <Link href="/admin" className="flex items-center gap-2 w-full">
                            <LayoutDashboard className="h-4 w-4" />
                            แดชบอร์ดแอดมิน
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      ออกจากระบบ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="text-muted-foreground hover:text-primary">
                  <Link href="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    เข้าสู่ระบบ
                  </Link>
                </Button>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/register">สมัครสมาชิก</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border py-4 lg:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                )
              })}
              {isAuthenticated && user && ((user as any).role || "").toLowerCase() === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors border-t border-border mt-2 pt-4",
                    pathname.startsWith("/admin")
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  แดชบอร์ดแอดมิน
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
