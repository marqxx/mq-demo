import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()
    const { productId, quantity = 1, couponCode } = body

    if (quantity < 1 || quantity > 5) {
      return NextResponse.json({ error: "จำนวนสินค้าต้องอยู่ระหว่าง 1-5 ชิ้น" }, { status: 400 })
    }

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
    })

    if (!product) {
      return NextResponse.json({ error: "ไม่พบสินค้านี้" }, { status: 404 })
    }

    // Check stock availability
    let stockItems: { id: string; accountEmail: string; accountPass: string; accountData: string | null }[] = []
    
    if (!product.isUnlimited) {
      stockItems = await prisma.productStock.findMany({
        where: {
          productId,
          status: "AVAILABLE",
        },
        take: quantity,
        select: {
          id: true,
          accountEmail: true,
          accountPass: true,
          accountData: true,
        },
      })

      if (stockItems.length < quantity) {
        return NextResponse.json({ error: "สินค้าไม่เพียงพอ" }, { status: 400 })
      }
    }

    // Calculate price
    let unitPrice = product.price
    if (product.discount && product.discount > 0) {
      unitPrice = product.price * (1 - product.discount / 100)
    }
    
    let totalPrice = unitPrice * quantity
    let couponDiscount = 0
    let couponId = null

    // Validate coupon if provided
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      })

      if (coupon && coupon.isActive) {
        const now = new Date()
        const isValidDate = coupon.startDate <= now && (!coupon.endDate || coupon.endDate >= now)
        const hasUsageLeft = !coupon.usageLimit || coupon.usedCount < coupon.usageLimit

        // Check if user already used this coupon
        const existingUsage = await prisma.couponUsage.findUnique({
          where: {
            userId_couponId: { userId, couponId: coupon.id },
          },
        })

        if (isValidDate && hasUsageLeft && !existingUsage && totalPrice >= coupon.minPurchase) {
          if (coupon.type === "PERCENT") {
            couponDiscount = totalPrice * (coupon.value / 100)
            if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) {
              couponDiscount = coupon.maxDiscount
            }
          } else {
            couponDiscount = coupon.value
          }
          couponDiscount = Math.floor(couponDiscount)
          couponId = coupon.id
        }
      }
    }

    const finalPrice = totalPrice - couponDiscount

    // Get user balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    })

    if (!user || user.balance < finalPrice) {
      return NextResponse.json({ error: "ยอดเงินไม่เพียงพอ กรุณาเติมเงิน" }, { status: 400 })
    }

    // Calculate points earned
    const pointsEarned = product.pointsEarn * quantity

    // Process purchase in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Deduct balance
      await tx.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: finalPrice },
          points: { increment: pointsEarned },
        },
      })

      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          productId,
          productName: product.name,
          productImage: product.image,
          price: unitPrice,
          quantity,
          totalPrice: finalPrice,
          pointsEarned,
          pointsUsed: 0,
          couponId,
          couponDiscount,
          status: "SUCCESS",
        },
      })

      // Update stock if not unlimited
      if (!product.isUnlimited && stockItems.length > 0) {
        await tx.productStock.updateMany({
          where: {
            id: { in: stockItems.map((s) => s.id) },
          },
          data: {
            status: "SOLD",
            orderId: newOrder.id,
          },
        })
      }

      // Record coupon usage if used
      if (couponId) {
        await tx.couponUsage.create({
          data: {
            userId,
            couponId,
            orderId: newOrder.id,
          },
        })
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        })
      }

      // Record points history if earned
      if (pointsEarned > 0) {
        await tx.pointsHistory.create({
          data: {
            userId,
            points: pointsEarned,
            type: "EARN",
            description: `ได้รับแต้มจากการซื้อ ${product.name}`,
            orderId: newOrder.id,
          },
        })
      }

      return newOrder
    })

    // Return order with stock items
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        productName: order.productName,
        quantity: order.quantity,
        totalPrice: order.totalPrice,
        pointsEarned: order.pointsEarned,
        couponDiscount: order.couponDiscount,
        status: order.status,
      },
      stockItems: product.isUnlimited ? [] : stockItems.map((s) => ({
        email: s.accountEmail,
        password: s.accountPass,
        data: s.accountData,
      })),
    })
  } catch (error) {
    console.error("Purchase error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสั่งซื้อ" }, { status: 500 })
  }
}
