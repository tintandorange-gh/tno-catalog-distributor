import { type NextRequest, NextResponse } from "next/server"
import { updateModel, deleteModel } from "@/lib/db"
import { uploadToS3 } from "@/lib/s3"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const subBrandId = formData.get("subBrandId") as string
    const imageFiles = formData.getAll("images") as File[]

    let imageUrls = undefined
    if (imageFiles.length > 0) {
      imageUrls = []
      for (const imageFile of imageFiles) {
        if (imageFile instanceof File) {
          const key = `models/${Date.now()}-${imageFile.name}`
          const imageUrl = await uploadToS3(imageFile, key)
          imageUrls.push(imageUrl)
        }
      }
    }

    await updateModel(params.id, name, description, subBrandId, imageUrls)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update model" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteModel(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete model" }, { status: 500 })
  }
}
