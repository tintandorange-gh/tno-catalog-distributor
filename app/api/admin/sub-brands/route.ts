import { type NextRequest, NextResponse } from "next/server"
import { getSubBrands, createSubBrand, isValidObjectId } from "@/lib/db"

export async function GET() {
  try {
    const subBrands = await getSubBrands()
    return NextResponse.json(subBrands)
  } catch (error) {
    console.error("Error fetching sub-brands:", error)
    return NextResponse.json({ error: "Failed to fetch sub-brands" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, brandId } = await request.json()

    if (!name || !brandId) {
      return NextResponse.json({ error: "Name and brand ID are required" }, { status: 400 })
    }

    if (!isValidObjectId(brandId)) {
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 })
    }

    const subBrandId = await createSubBrand(name, brandId)
    return NextResponse.json({ id: subBrandId })
  } catch (error) {
    console.error("Error creating sub-brand:", error)
    if (error.code === 11000) {
      return NextResponse.json({ error: "Sub-brand name already exists for this brand" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create sub-brand" }, { status: 500 })
  }
}
