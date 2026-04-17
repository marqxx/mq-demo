import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET stock items for a product
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || ((session.user as any).role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const stockItems = await prisma.productStock.findMany({
      where: { productId: id },
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
          }
        }
      }
    })

    return NextResponse.json(stockItems)
  } catch (error) {
    console.error("Get stock error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST add stock items (bulk)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || ((session.user as any).role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    
    // Support both single item and bulk items
    const items = Array.isArray(body.items) ? body.items : [body]
    
    const createdItems = await prisma.productStock.createMany({
      data: items.map((item: { email: string; password: string; data?: string }) => ({
        productId: id,
        accountEmail: item.email,
        accountPass: item.password,
        accountData: item.data || null,
        status: "AVAILABLE",
      }))
    })

    return NextResponse.json({ 
      success: true, 
      count: createdItems.count 
    }, { status: 201 })
  } catch (error) {
    console.error("Add stock error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE remove stock item
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || ((session.user as any).role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const stockId = searchParams.get("stockId")
    
    if (!stockId) {
      return NextResponse.json({ error: "Stock ID required" }, { status: 400 })
    }

    // Only allow deleting AVAILABLE stock
    const stock = await prisma.productStock.findUnique({
      where: { id: stockId }
    })

    if (!stock) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 })
    }

    if (stock.status !== "AVAILABLE") {
      return NextResponse.json({ error: "Cannot delete sold stock" }, { status: 400 })
    }

    await prisma.productStock.delete({
      where: { id: stockId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete stock error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
