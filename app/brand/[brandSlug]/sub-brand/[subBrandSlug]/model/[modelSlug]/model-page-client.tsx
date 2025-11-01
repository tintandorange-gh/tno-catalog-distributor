'use client'

import { useState } from 'react'
import Image from 'next/image'
import ImageGallery from '@/components/image-gallery'

interface ModelPageClientProps {
  model: {
    name: string
    description?: string
    images?: string[]
    dealerPricing?: number
    distributorPricing?: number
  }
}

export default function ModelPageClient({ model }: ModelPageClientProps) {
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
    setGalleryOpen(true)
  }

  return (
    <>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center px-4">{model.name}</h1>

      {model.description && <p className="text-gray-600 mb-4 sm:mb-6 text-center text-sm sm:text-base px-4">{model.description}</p>}

      {/* Pricing Section */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8 px-4 justify-center items-center">
        <div className="bg-white border-2 border-green-200 rounded-lg p-4 sm:p-6 shadow-sm min-w-[280px] sm:min-w-[320px]">
          <div className="text-center">
            <p className="text-sm sm:text-base text-gray-600 mb-2">Dealer Pricing</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-700">
              {model.dealerPricing ? `₹${model.dealerPricing.toLocaleString('en-IN')}` : 'N/A'}
            </p>
          </div>
        </div>

        <div className="bg-white border-2 border-blue-200 rounded-lg p-4 sm:p-6 shadow-sm min-w-[280px] sm:min-w-[320px]">
          <div className="text-center">
            <p className="text-sm sm:text-base text-gray-600 mb-2">Distributor Pricing</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-700">
              {model.distributorPricing ? `₹${model.distributorPricing.toLocaleString('en-IN')}` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Images Grid */}
      {model.images && model.images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
          {model.images.map((image: string, index: number) => (
            <div 
              key={index} 
              className="aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity group relative touch-manipulation"
              onClick={() => handleImageClick(index)}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${model.name} - Image ${index + 1}`}
                width={600}
                height={400}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                priority={index < 2}
              />
              {/* Overlay hint */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 rounded-full p-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
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

      {/* Image Gallery Modal */}
      {model.images && model.images.length > 0 && (
        <ImageGallery
          images={model.images}
          initialIndex={selectedImageIndex}
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          modelName={model.name}
        />
      )}
    </>
  )
}