import { getBrands } from "@/lib/db"
import Link from "next/link"
import Image from "next/image"

export default async function BrandGrid() {
  const brands = await getBrands()

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {brands.map((brand) => (
        <Link
          key={brand._id}
          href={`/brand/${brand.slug}`}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 flex flex-col items-center justify-center min-h-[120px]"
        >
          {brand.logo ? (
            <Image
              src={brand.logo || "/placeholder.svg"}
              alt={brand.name}
              width={60}
              height={60}
              className="mb-2 object-contain"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-full mb-2 flex items-center justify-center">
              <span className="text-gray-500 font-semibold">{brand.name.charAt(0)}</span>
            </div>
          )}
          <span className="text-sm font-medium text-gray-900 text-center">{brand.name.toUpperCase()}</span>
        </Link>
      ))}
    </div>
  )
}
