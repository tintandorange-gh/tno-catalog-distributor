import { getModelBySlug } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"

interface ModelPageProps {
  params: {
    brandSlug: string
    subBrandSlug: string
    modelSlug: string
  }
}

export default async function ModelPage({ params }: ModelPageProps) {
  const model = await getModelBySlug(params.modelSlug)

  if (!model) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href={`/brand/${params.brandSlug}`} className="flex items-center space-x-2">
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
            <div className="w-10 h-10"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">{model.name}</h1>

          {model.description && <p className="text-gray-600 mb-8 text-center">{model.description}</p>}

          {/* Images Grid */}
          {model.images && model.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {model.images.map((image: string, index: number) => (
                <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${model.name} - Image ${index + 1}`}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {(!model.images || model.images.length === 0) && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-gray-400">No Images</span>
              </div>
              <p className="text-gray-500">No images available for this model.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
