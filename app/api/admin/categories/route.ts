import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET all categories
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || ((session.user as any).role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Admin categories error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST create new category
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || ((session.user as any).role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: { name: body.name },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Create category error:", error)
    return NextResponse.json({ error: "Internal server error - name might be duplicate" }, { status: 500 })
  }
}
