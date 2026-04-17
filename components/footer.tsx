"use client"

import Link from "next/link"
import { 
  Package, 
  Wallet, 
  Clock, 
  ShieldCheck, 
  Truck,
  Store
} from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-white py-16 text-muted-foreground">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Branding */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">WEBSHOP</h2>
                <div className="flex items-center text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ONLINE
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              ร้านค้าจำหน่ายสินค้าดิจิทัลออนไลน์ พร้อมระบบเติมเงินที่สะดวกและรวดเร็ว ส่งสินค้าอัตโนมัติทันที
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col space-y-6">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">
              ลิงก์ด่วน
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/store" className="flex items-center group transition-colors hover:text-foreground">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center mr-3 group-hover:bg-primary/10 transition-colors">
                    <Package className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <span className="text-sm">สินค้าทั้งหมด</span>
                </Link>
              </li>
              <li>
                <Link href="/topup" className="flex items-center group transition-colors hover:text-foreground">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center mr-3 group-hover:bg-primary/10 transition-colors">
                    <Wallet className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <span className="text-sm">เติมเงิน</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div className="flex flex-col space-y-6">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">
              ข้อมูล
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center mr-3">
                   <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-sm">เปิดให้บริการ 24 ชั่วโมง</span>
              </li>
              <li className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center mr-3">
                   <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-sm">สินค้าปลอดภัย</span>
              </li>
              <li className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center mr-3">
                   <Truck className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-sm">ส่งสินค้าอัตโนมัติทันที</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
          <p>© 2025 WEBSHOP. All Rights Reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/terms" className="hover:text-foreground transition-colors">ข้อตกลงและเงื่อนไข</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">นโยบายความเป็นส่วนตัว</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
