import { type NextRequest, NextResponse } from "next/server"
import { updateBrand, deleteBrand, isValidObjectId } from "@/lib/db"
import { uploadToS3 } from "@/lib/s3"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isValidObjectId(params.id)) {
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 })
    }

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

    await updateBrand(params.id, name, logoUrl)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating brand:", error)
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isValidObjectId(params.id)) {
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 })
    }

    await deleteBrand(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting brand:", error)
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 })
  }
}
