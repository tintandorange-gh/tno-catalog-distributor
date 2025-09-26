import { type NextRequest, NextResponse } from "next/server"
import { getModels, createModel, isValidObjectId } from "@/lib/db"
import { uploadToS3 } from "@/lib/s3"

export async function GET() {
  try {
    const models = await getModels()
    return NextResponse.json(models)
  } catch (error) {
    console.error("Error fetching models:", error)
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const name = formData.get("name") as string
    const description = (formData.get("description") as string) || ""
    const subBrandId = formData.get("subBrandId") as string
    const imageFiles = formData.getAll("images") as File[]

    if (!name || !subBrandId) {
      return NextResponse.json({ error: "Name and sub-brand ID are required" }, { status: 400 })
    }

    if (!isValidObjectId(subBrandId)) {
      return NextResponse.json({ error: "Invalid sub-brand ID" }, { status: 400 })
    }

    const imageUrls = []
    for (const imageFile of imageFiles) {
      if (imageFile instanceof File && imageFile.size > 0) {
        const key = `models/${Date.now()}-${imageFile.name}`
        const imageUrl = await uploadToS3(imageFile, key)
        imageUrls.push(imageUrl)
      }
    }

    const modelId = await createModel(name, description, subBrandId, imageUrls)
    return NextResponse.json({ id: modelId })
  } catch (error) {
    console.error("Error creating model:", error)
    if (error.code === 11000) {
      return NextResponse.json({ error: "Model name already exists for this sub-brand" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create model" }, { status: 500 })
  }
}
