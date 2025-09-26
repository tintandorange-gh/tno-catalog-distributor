const mongoose = require("mongoose")

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/car-catalog"

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB")

    // Clear existing data
    await mongoose.connection.db.dropDatabase()
    console.log("Database cleared")

    // Create Brand schema
    const brandSchema = new mongoose.Schema(
      {
        name: { type: String, required: true, unique: true },
        slug: { type: String, required: true, unique: true },
        logo: String,
      },
      { timestamps: true },
    )

    brandSchema.pre("save", function (next) {
      if (this.isModified("name")) {
        this.slug = this.name
          .toLowerCase()
          .replace(/[^a-z0-9 -]/g, "")
          .replace(/\s+/g, "-")
      }
      next()
    })

    const Brand = mongoose.model("Brand", brandSchema)

    // Create SubBrand schema
    const subBrandSchema = new mongoose.Schema(
      {
        name: { type: String, required: true },
        slug: { type: String, required: true },
        brandId: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
      },
      { timestamps: true },
    )

    subBrandSchema.pre("save", function (next) {
      if (this.isModified("name")) {
        this.slug = this.name
          .toLowerCase()
          .replace(/[^a-z0-9 -]/g, "")
          .replace(/\s+/g, "-")
      }
      next()
    })

    const SubBrand = mongoose.model("SubBrand", subBrandSchema)

    // Create Model schema
    const modelSchema = new mongoose.Schema(
      {
        name: { type: String, required: true },
        slug: { type: String, required: true },
        description: String,
        subBrandId: { type: mongoose.Schema.Types.ObjectId, ref: "SubBrand", required: true },
        images: [String],
      },
      { timestamps: true },
    )

    modelSchema.pre("save", function (next) {
      if (this.isModified("name")) {
        this.slug = this.name
          .toLowerCase()
          .replace(/[^a-z0-9 -]/g, "")
          .replace(/\s+/g, "-")
      }
      next()
    })

    const Model = mongoose.model("Model", modelSchema)

    // Seed data
    const brands = [
      { name: "Mahindra" },
      { name: "KIA" },
      { name: "MG" },
      { name: "Skoda" },
      { name: "Volkswagen" },
      { name: "Tata" },
      { name: "Porsche" },
      { name: "Hyundai" },
      { name: "Mercedes" },
      { name: "BMW" },
    ]

    console.log("Creating brands...")
    const createdBrands = await Brand.insertMany(brands)

    // Find Mahindra brand
    const mahindra = createdBrands.find((b) => b.name === "Mahindra")

    const subBrands = [
      { name: "XUV700", brandId: mahindra._id },
      { name: "3XO", brandId: mahindra._id },
      { name: "Scorpio N", brandId: mahindra._id },
      { name: "Thar", brandId: mahindra._id },
      { name: "BE6", brandId: mahindra._id },
      { name: "XEV9", brandId: mahindra._id },
    ]

    console.log("Creating sub-brands...")
    const createdSubBrands = await SubBrand.insertMany(subBrands)

    // Find XUV700 and 3XO sub-brands
    const xuv700 = createdSubBrands.find((sb) => sb.name === "XUV700")
    const threexo = createdSubBrands.find((sb) => sb.name === "3XO")

    const models = [
      {
        name: "XUV700 with Electronic Brake (MT)",
        description: "Manual transmission with electronic brake system",
        subBrandId: xuv700._id,
        images: [],
      },
      {
        name: "XUV700 with Electronic Brake (AT)",
        description: "Automatic transmission with electronic brake system",
        subBrandId: xuv700._id,
        images: [],
      },
      {
        name: "XUV 700 With Handbrake (AT)",
        description: "Automatic transmission with handbrake system",
        subBrandId: xuv700._id,
        images: [],
      },
      {
        name: "XUV 700 With Handbrake (MT)",
        description: "Manual transmission with handbrake system",
        subBrandId: xuv700._id,
        images: [],
      },
      {
        name: "Mahindra 3XO",
        description: "Compact SUV from Mahindra",
        subBrandId: threexo._id,
        images: [],
      },
      {
        name: "Mahindra 3XO Premium",
        description: "Premium variant of 3XO",
        subBrandId: threexo._id,
        images: [],
      },
    ]

    console.log("Creating models...")
    await Model.insertMany(models)

    console.log("Database seeded successfully!")
    console.log(`Created ${createdBrands.length} brands`)
    console.log(`Created ${createdSubBrands.length} sub-brands`)
    console.log(`Created ${models.length} models`)
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await mongoose.connection.close()
    console.log("Database connection closed")
  }
}

seedDatabase()
