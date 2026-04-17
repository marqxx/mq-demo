"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Wallet, Upload, Clock, CheckCircle, XCircle, AlertCircle, QrCode, ArrowLeft, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface TopupHistory {
  id: number
  amount: number
  method: string
  slipImage: string | null
  status: "PENDING" | "APPROVED" | "REJECTED"
  adminNote: string | null
  createdAt: string
}

const PRESET_AMOUNTS = [50, 100, 200, 300, 500, 1000]
const PROMPTPAY_NUMBER = "0812345678" // This should come from SiteSettings

export default function TopupPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [amount, setAmount] = useState<number>(100)
  const [customAmount, setCustomAmount] = useState("")
  const [slipImage, setSlipImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [history, setHistory] = useState<TopupHistory[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [copied, setCopied] = useState(false)

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/topup")
      if (res.ok) {
        setHistory(await res.json())
      }
    } catch {
      console.error("Failed to fetch history")
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      fetchHistory()
    }
  }, [status, router, fetchHistory])

  const handleCopyPromptPay = () => {
    navigator.clipboard.writeText(PROMPTPAY_NUMBER)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      showToast("ไฟล์ต้องมีขนาดไม่เกิน 5MB", "error")
      return
    }

    setUploading(true)
    try {
      // Convert to base64 for simplicity (in production, use proper file upload)
      const reader = new FileReader()
      reader.onloadend = () => {
        setSlipImage(reader.result as string)
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch {
      showToast("อัปโหลดไม่สำเร็จ", "error")
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    const finalAmount = customAmount ? parseInt(customAmount) : amount

    if (!finalAmount || finalAmount < 20 || finalAmount > 10000) {
      showToast("จำนวนเงินต้องอยู่ระหว่าง 20-10,000 บาท", "error")
      return
    }

    if (!slipImage) {
      showToast("กรุณาอัปโหลดสลิปการโอนเงิน", "error")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalAmount, slipImage }),
      })

      if (res.ok) {
        showToast("ส่งคำขอเติมเงินสำเร็จ รอการอนุมัติ")
        setSlipImage(null)
        setCustomAmount("")
        setAmount(100)
        fetchHistory()
      } else {
        const err = await res.json()
        showToast(err.error || "เกิดข้อผิดพลาด", "error")
      }
    } catch {
      showToast("เกิดข้อผิดพลาด", "error")
    } finally {
      setSubmitting(false)
    }
  }

  const hasPendingTopup = history.some(t => t.status === "PENDING")

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed top-20 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 shadow-xl animate-in slide-in-from-right",
          toast.type === "success" ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
        )}>
          {toast.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">ย้อนกลับ</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left - Topup Form */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">เติมเงิน</h1>
              <p className="text-muted-foreground mt-1">โอนเงินผ่าน PromptPay แล้วอัปโหลดสลิป</p>
            </div>

            {hasPendingTopup ? (
              <div className="rounded-2xl border border-warning/50 bg-warning/10 p-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-warning" />
                  <div>
                    <h3 className="font-bold text-foreground">มีคำขอรอดำเนินการ</h3>
                    <p className="text-sm text-muted-foreground">กรุณารอการอนุมัติก่อนทำรายการใหม่</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Amount Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground">เลือกจำนวนเงิน</label>
                  <div className="grid grid-cols-3 gap-3">
                    {PRESET_AMOUNTS.map((a) => (
                      <button
                        key={a}
                        onClick={() => { setAmount(a); setCustomAmount(""); }}
                        className={cn(
                          "rounded-xl py-3 text-sm font-bold transition-all",
                          amount === a && !customAmount
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-muted"
                        )}
                      >
                        ฿{a}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">฿</span>
                    <input
                      type="number"
                      min="20"
                      max="10000"
                      value={customAmount}
                      onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
                      placeholder="ระบุจำนวนเอง (20-10,000)"
                      className="w-full rounded-xl border border-border bg-input pl-8 pr-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                {/* QR Code */}
                <div className="rounded-2xl border border-border bg-white shadow-sm p-6 space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <QrCode className="h-5 w-5" />
                    <span className="font-bold">PromptPay QR Code</span>
                  </div>
                  
                  {/* QR Code Placeholder */}
                  <div className="aspect-square max-w-[200px] mx-auto rounded-xl bg-white p-4 flex items-center justify-center">
                    <img
                      src={`https://promptpay.io/${PROMPTPAY_NUMBER}/${customAmount || amount}.png`}
                      alt="PromptPay QR"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted">
                    <div>
                      <p className="text-xs text-muted-foreground">เลขพร้อมเพย์</p>
                      <p className="font-mono font-bold text-foreground">{PROMPTPAY_NUMBER}</p>
                    </div>
                    <button
                      onClick={handleCopyPromptPay}
                      className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-muted transition-colors"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "คัดลอกแล้ว" : "คัดลอก"}
                    </button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    จำนวนเงิน: <span className="font-bold text-primary">฿{(customAmount || amount).toLocaleString()}</span>
                  </p>
                </div>

                {/* Slip Upload */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground">อัปโหลดสลิปการโอนเงิน</label>
                  
                  {slipImage ? (
                    <div className="relative rounded-2xl overflow-hidden border border-border">
                      <img src={slipImage} alt="Slip" className="w-full max-h-[300px] object-contain bg-muted" />
                      <button
                        onClick={() => setSlipImage(null)}
                        className="absolute top-2 right-2 rounded-full bg-destructive p-2 text-destructive-foreground hover:bg-destructive/90 transition-colors"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/50 p-8 cursor-pointer hover:bg-muted transition-colors">
                      <Upload className={cn("h-10 w-10 text-muted-foreground mb-3", uploading && "animate-pulse")} />
                      <p className="text-sm font-medium text-foreground">{uploading ? "กำลังอัปโหลด..." : "คลิกเพื่ออัปโหลดสลิป"}</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG (สูงสุด 5MB)</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !slipImage}
                  className="w-full rounded-xl bg-primary py-4 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "กำลังดำเนินการ..." : "ส่งคำขอเติมเงิน"}
                </button>
              </>
            )}
          </div>

          {/* Right - History */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">ประวัติการเติมเงิน</h2>
            
            {loadingHistory ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : history.length === 0 ? (
              <div className="rounded-2xl border border-border bg-white shadow-sm p-8 text-center">
                <Wallet className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">ยังไม่มีประวัติการเติมเงิน</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "rounded-xl border p-4 transition-colors",
                      item.status === "APPROVED" ? "border-success/30 bg-success/5" :
                      item.status === "PENDING" ? "border-warning/30 bg-warning/5" :
                      "border-destructive/30 bg-destructive/5"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "rounded-full p-2",
                          item.status === "APPROVED" ? "bg-success/20" :
                          item.status === "PENDING" ? "bg-warning/20" :
                          "bg-destructive/20"
                        )}>
                          {item.status === "APPROVED" && <CheckCircle className="h-4 w-4 text-success" />}
                          {item.status === "PENDING" && <Clock className="h-4 w-4 text-warning" />}
                          {item.status === "REJECTED" && <XCircle className="h-4 w-4 text-destructive" />}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">+฿{item.amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleDateString("th-TH", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <span className={cn(
                        "text-xs font-bold px-2 py-1 rounded-full",
                        item.status === "APPROVED" ? "bg-success/20 text-success" :
                        item.status === "PENDING" ? "bg-warning/20 text-warning" :
                        "bg-destructive/20 text-destructive"
                      )}>
                        {item.status === "APPROVED" ? "อนุมัติแล้ว" : item.status === "PENDING" ? "รอดำเนินการ" : "ปฏิเสธ"}
                      </span>
                    </div>
                    {item.adminNote && (
                      <p className="mt-2 text-xs text-muted-foreground border-t border-border pt-2">
                        หมายเหตุ: {item.adminNote}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
