import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET user's topup history
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    
    const topups = await prisma.topupTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json(topups)
  } catch (error) {
    console.error("Topup history error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST create new topup request
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()
    
    const { amount, slipImage } = body

    if (!amount || amount < 20 || amount > 10000) {
      return NextResponse.json({ error: "จำนวนเงินต้องอยู่ระหว่าง 20-10,000 บาท" }, { status: 400 })
    }

    if (!slipImage) {
      return NextResponse.json({ error: "กรุณาอัปโหลดสลิปการโอนเงิน" }, { status: 400 })
    }

    // Check if user has pending topup
    const pendingTopup = await prisma.topupTransaction.findFirst({
      where: {
        userId,
        status: "PENDING",
      }
    })

    if (pendingTopup) {
      return NextResponse.json({ error: "คุณมีรายการเติมเงินที่รอดำเนินการอยู่แล้ว" }, { status: 400 })
    }

    const topup = await prisma.topupTransaction.create({
      data: {
        userId,
        amount: parseFloat(amount.toString()),
        method: "PROMPTPAY",
        slipImage,
        status: "PENDING",
      },
    })

    return NextResponse.json(topup, { status: 201 })
  } catch (error) {
    console.error("Create topup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
