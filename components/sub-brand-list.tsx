import { getModelsBySubBrand } from "@/lib/db"
import Link from "next/link"
import Image from "next/image"

interface SubBrandListProps {
  brandId: string
  brandSlug: string
  subBrands: any[]
}

export default async function SubBrandList({ brandId, brandSlug, subBrands }: SubBrandListProps) {
  const subBrandsWithModels = await Promise.all(
    subBrands.map(async (subBrand) => {
      const models = await getModelsBySubBrand(subBrand._id)
      return { ...subBrand, models }
    }),
  )

  return (
    <div className="space-y-8">
      {/* Sub-brand filter pills */}
      <div className="flex flex-wrap gap-2">
        {subBrands.map((subBrand) => (
          <Link
            key={subBrand._id}
            href={`#${subBrand.slug}`}
            className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {subBrand.name}
          </Link>
        ))}
      </div>

      {/* Models grouped by sub-brand */}
      {subBrandsWithModels.map((subBrand) => (
        <div key={subBrand._id} id={subBrand.slug} className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-4">
            {subBrand.name} ({subBrand.models.length})
          </h3>
          <div className="space-y-4">
            {subBrand.models.map((model: any) => (
              <Link
                key={model._id}
                href={`/brand/${brandSlug}/sub-brand/${subBrand.slug}/model/${model.slug}`}
                className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-20 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {model.images && model.images.length > 0 ? (
                    <Image
                      src={model.images[0] || "/placeholder.svg"}
                      alt={model.name}
                      width={80}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="text-gray-400 text-xs">No Image</div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{model.name}</h4>
                  {model.description && <p className="text-sm text-gray-500">{model.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
