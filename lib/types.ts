export interface BrandType {
  _id: string
  name: string
  slug: string
  logo?: string
  createdAt: Date
  updatedAt: Date
}

export interface SubBrandType {
  _id: string
  name: string
  slug: string
  brandId: string
  brandName?: string
  createdAt: Date
  updatedAt: Date
}

export interface ModelType {
  _id: string
  name: string
  slug: string
  description?: string
  subBrandId: string
  subBrandName?: string
  brandName?: string
  images: string[]
  dealerPricing?: number
  distributorPricing?: number
  createdAt: Date
  updatedAt: Date
}
