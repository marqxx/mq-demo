"use client"

import { useStore, type TopupHistory } from "@/lib/store"
import { Wallet, CheckCircle, ChevronDown, DollarSign } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

function TopupCard({ topup }: { topup: TopupHistory }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden transition-all hover:border-primary/30">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <DollarSign className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">เติมเงินผ่าน {topup.method}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(topup.date).toLocaleDateString("th-TH", {
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
            <p className="font-semibold text-emerald-500">+{topup.amount.toLocaleString()} บาท</p>
            <span
              className={cn(
                "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                topup.status === "SUCCESS"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : topup.status === "PENDING"
                  ? "bg-yellow-500/10 text-yellow-500"
                  : "bg-red-500/10 text-red-500"
              )}
            >
              {topup.status === "SUCCESS" ? "สำเร็จ" : topup.status === "PENDING" ? "รอดำเนินการ" : "ยกเลิก/ล้มเหลว"}
            </span>
          </div>
          <ChevronDown className={cn(
            "h-5 w-5 text-muted-foreground transition-transform",
            isExpanded && "rotate-180"
          )} />
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border bg-muted/30 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">เลขที่รายการ</p>
              <p className="text-sm font-mono text-foreground">{topup.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">ช่องทางการชำระเงิน</p>
              <p className="text-sm text-foreground">{topup.method}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">สถานะ</p>
              <p className="text-sm text-foreground">ชำระเงินเรียบร้อยแล้ว</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">เวลาที่ทำรายการ</p>
              <p className="text-sm text-foreground">
                {new Date(topup.date).toLocaleTimeString("th-TH")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TopupHistoryPage() {
  const { topups } = useStore()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-border bg-white shadow-sm p-6">
        <h1 className="text-xl font-bold text-foreground">ประวัติการเติมเงิน</h1>
        <p className="text-sm text-muted-foreground">รายการเติมเงินทั้งหมดของคุณ</p>
      </div>

      {/* Topups List or Empty State */}
      {topups.length > 0 ? (
        <div className="space-y-4">
          {topups.map((topup) => (
            <TopupCard key={topup.id} topup={topup} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white shadow-sm p-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Wallet className="h-20 w-20 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">ไม่มีประวัติการเติมเงิน</h3>
            <p className="mt-2 text-muted-foreground">คุณยังไม่เคยเติมเงินเข้าระบบ</p>
          </div>
        </div>
      )}
    </div>
  )
}
