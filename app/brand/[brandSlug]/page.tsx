import { getBrandBySlug, getSubBrandsByBrand } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import SubBrandList from "@/components/sub-brand-list"

interface BrandPageProps {
  params: {
    brandSlug: string
  }
}

export default async function BrandPage({ params }: BrandPageProps) {
  const brand = await getBrandBySlug(params.brandSlug)

  if (!brand) {
    notFound()
  }

  const subBrands = await getSubBrandsByBrand(brand._id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tint & Orange</h1>
              </div>
            </div>
            <div className="w-10 h-10 flex items-center justify-center">
              {brand.logo && (
                <img src={brand.logo || "/placeholder.svg"} alt={brand.name} className="w-8 h-8 object-contain" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SubBrandList brandId={brand._id} brandSlug={params.brandSlug} subBrands={subBrands} />
      </main>
    </div>
  )
}
