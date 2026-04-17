import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET all products with stock count
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || ((session.user as any).role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        _count: { 
          select: { 
            orders: true,
            productStock: true,
          } 
        },
      },
    })

    // Get available stock count for each product
    const productsWithStock = await Promise.all(
      products.map(async (product) => {
        const availableStock = await prisma.productStock.count({
          where: {
            productId: product.id,
            status: "AVAILABLE",
          },
        })
        return {
          ...product,
          stockCount: availableStock,
        }
      })
    )

    return NextResponse.json(productsWithStock)
  } catch (error) {
    console.error("Admin products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST create new product
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || ((session.user as any).role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description || "",
        price: parseFloat(body.price),
        discount: body.discount ? parseFloat(body.discount) : 0,
        image: body.image || null,
        categoryId: body.categoryId,
        isUnlimited: body.isUnlimited || false,
        pointsEarn: parseInt(body.pointsEarn) || 0,
        isHot: body.isHot || false,
        badge: body.badge || null,
        isActive: body.isActive !== false,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Create product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
