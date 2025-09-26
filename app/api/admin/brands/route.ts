import { type NextRequest, NextResponse } from "next/server"
import { getBrands, createBrand } from "@/lib/db"
import { uploadToS3 } from "@/lib/s3"

export async function GET() {
  try {
    const brands = await getBrands()
    return NextResponse.json(brands)
  } catch (error) {
    console.error("Error fetching brands:", error)
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const name = formData.get("name") as string
    const logoFile = formData.get("logo") as File | null

    if (!name) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 })
    }

    let logoUrl = undefined
    if (logoFile && logoFile.size > 0) {
      const key = `brands/${Date.now()}-${logoFile.name}`
      logoUrl = await uploadToS3(logoFile, key)
    }

    const brandId = await createBrand(name, logoUrl)
    return NextResponse.json({ id: brandId })
  } catch (error) {
    console.error("Error creating brand:", error)
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json({ error: "Brand name already exists" }, { status: 400 })
    }
    // Return more detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Detailed error:", { error, message: errorMessage })
    return NextResponse.json({ 
      error: "Failed to create brand", 
      details: errorMessage 
    }, { status: 500 })
  }
}
