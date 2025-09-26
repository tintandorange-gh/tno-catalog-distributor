import { type NextRequest, NextResponse } from "next/server"
import { updateSubBrand, deleteSubBrand } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, brandId } = await request.json()
    await updateSubBrand(params.id, name, brandId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update sub-brand" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteSubBrand(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete sub-brand" }, { status: 500 })
  }
}
