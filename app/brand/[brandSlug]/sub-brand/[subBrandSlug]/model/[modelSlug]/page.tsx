import { getModelBySlug, getModelsForStaticGeneration, getBrandBySlug, getSubBrandBySlug } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import ModelPageClient from "./model-page-client"

interface ModelPageProps {
  params: {
    brandSlug: string
    subBrandSlug: string
    modelSlug: string
  }
}

// ISR Configuration
export const revalidate = 10 // Revalidate every 10 seconds
export const dynamic = 'force-static'

// Generate static params for all models
export async function generateStaticParams() {
  try {
    const modelParams = await getModelsForStaticGeneration()
    
    return modelParams.map(param => ({
      brandSlug: param.brandSlug,
      subBrandSlug: param.subBrandSlug,
      modelSlug: param.modelSlug,
    }))
  } catch (error) {
    console.error('Error generating static params for models:', error)
    return []
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ModelPageProps) {
  try {
    const modelData = await getModelBySlug(params.modelSlug)
    
    if (!modelData) {
      return {
        title: 'Model Not Found',
      }
    }

    // Type assertion for populated model data
    const model = modelData as any

    // Extract populated data
    const subBrand = typeof model.subBrandId === 'object' ? model.subBrandId : null
    const brand = subBrand && typeof subBrand.brandId === 'object' ? subBrand.brandId : null

    const brandName = brand?.name || 'Unknown Brand'
    const subBrandName = subBrand?.name || 'Unknown Category'

    return {
      title: `${model.name} - ${brandName} ${subBrandName} | Tint & Orange`,
      description: model.description || `Explore the ${model.name} from ${brandName}'s ${subBrandName} collection. View detailed specifications and images.`,
      openGraph: {
        title: `${model.name} - ${brandName} ${subBrandName}`,
        description: model.description || `${model.name} from ${brandName}`,
        images: model.images && model.images.length > 0 ? [{ url: model.images[0], alt: `${model.name} image` }] : [],
      },
    }
  } catch (error) {
    console.error('Error generating metadata for model:', error)
    return {
      title: 'Model',
    }
  }
}

export default async function ModelPage({ params }: ModelPageProps) {
  try {
    const modelData = await getModelBySlug(params.modelSlug)
    
    if (!modelData) {
      return notFound()
    }

    // Type assertion for populated model data
    const model = modelData as any

    console.log("Model data from DB:", {
      name: model.name,
      dealerPricing: model.dealerPricing,
      distributorPricing: model.distributorPricing
    })

    // Get sub-brand and brand data for breadcrumbs (fallback if populated data isn't available)
    const subBrand = typeof model.subBrandId === 'object' ? model.subBrandId : await getSubBrandBySlug(params.subBrandSlug)
    const brand = subBrand && typeof subBrand.brandId === 'object' ? subBrand.brandId : await getBrandBySlug(params.brandSlug)
    
    if (!subBrand || !brand) {
      return notFound()
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
            <div className="flex items-center justify-between h-12 sm:h-16">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link href="/" className="text-orange-600 hover:text-orange-700 text-lg sm:text-xl font-bold">
                  Tint & Orange
                </Link>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                <Link href={`/brand/${params.brandSlug}`} className="text-gray-600 hover:text-gray-900 text-sm sm:text-base font-medium">
                  {brand.name}
                </Link>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                <Link href={`/brand/${params.brandSlug}/sub-brand/${params.subBrandSlug}`} className="text-gray-600 hover:text-gray-900 text-sm sm:text-base font-medium">
                  {subBrand.name}
                </Link>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                <span className="text-gray-900 text-sm sm:text-base font-medium">{model.name}</span>
              </div>
              <div className="w-8 sm:w-10"></div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-8">
            <ModelPageClient
              model={{
                name: model.name,
                description: model.description,
                images: model.images,
                dealerPricing: model.dealerPricing,
                distributorPricing: model.distributorPricing
              }}
            />
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error loading model page:', error)
    return notFound()
  }
}
