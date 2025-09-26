-- MongoDB Collections Setup
-- This is a reference for the MongoDB collections structure

-- Brands Collection
{
  "_id": ObjectId,
  "name": String,
  "slug": String,
  "logo": String (S3 URL),
  "createdAt": Date,
  "updatedAt": Date
}

-- SubBrands Collection
{
  "_id": ObjectId,
  "name": String,
  "slug": String,
  "brandId": ObjectId (reference to brands),
  "createdAt": Date,
  "updatedAt": Date
}

-- Models Collection
{
  "_id": ObjectId,
  "name": String,
  "slug": String,
  "description": String,
  "subBrandId": ObjectId (reference to subBrands),
  "images": [String] (array of S3 URLs),
  "createdAt": Date,
  "updatedAt": Date
}
