import mongoose from "mongoose";
import Brand from "./models/Brand";
import SubBrand from "./models/SubBrand";
import Model from "./models/Model";

const MONGODB_URI =
	process.env.MONGODB_URI || "mongodb://localhost:27017/car-catalog";

if (!MONGODB_URI) {
	throw new Error(
		"Please define the MONGODB_URI environment variable inside .env.local"
	);
}

interface MongooseCache {
	conn: typeof mongoose | null;
	promise: Promise<typeof mongoose> | null;
}

declare global {
	var _mongoose: MongooseCache | undefined;
}

let cached = global._mongoose;

if (!cached) {
	cached = global._mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
	if (cached!.conn) {
		return cached!.conn;
	}

	if (!cached!.promise) {
		const opts = {
			bufferCommands: false,
		};

		cached!.promise = mongoose.connect(MONGODB_URI, opts);
	}

	try {
		cached!.conn = await cached!.promise;
	} catch (e) {
		cached!.promise = null;
		throw e;
	}

	return cached!.conn;
}

// Brand operations
export async function getBrands() {
	await connectToDatabase();
	const brands = await Brand.find({}).sort({ name: 1 }).lean();
	return brands.map((brand) => ({
		...brand,
		_id: brand._id.toString(),
	}));
}

export async function getBrandBySlug(slug: string) {
	await connectToDatabase();
	const brand = await Brand.findOne({ slug }).lean();
	if (!brand) return null;
	return {
		...brand,
		_id: brand._id.toString(),
	};
}

export async function getBrandById(id: string) {
	await connectToDatabase();
	const brand = await Brand.findById(id).lean();
	if (!brand) return null;
	return {
		...brand,
		_id: brand._id.toString(),
	};
}

export async function createBrand(name: string, logo?: string) {
	await connectToDatabase();
	const slug = name
		.toLowerCase()
		.replace(/[^a-z0-9 -]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();
	const brand = new Brand({ name, slug, logo });
	const savedBrand = await brand.save();
	return savedBrand._id.toString();
}

export async function updateBrand(id: string, name: string, logo?: string) {
	await connectToDatabase();
	const updateData: any = { name };
	if (logo) updateData.logo = logo;

	await Brand.findByIdAndUpdate(id, updateData, { new: true });
}

export async function deleteBrand(id: string) {
	await connectToDatabase();
	// Also delete related sub-brands and models
	const subBrands = await SubBrand.find({ brandId: id });
	const subBrandIds = subBrands.map((sb) => sb._id);

	await Model.deleteMany({ subBrandId: { $in: subBrandIds } });
	await SubBrand.deleteMany({ brandId: id });
	await Brand.findByIdAndDelete(id);
}

// Sub-brand operations
export async function getSubBrandsByBrand(brandId: string) {
	await connectToDatabase();
	const subBrands = await SubBrand.find({ brandId }).sort({ name: 1 }).lean();
	return subBrands.map((subBrand) => ({
		...subBrand,
		_id: subBrand._id.toString(),
		brandId: subBrand.brandId.toString(),
	}));
}

export async function getSubBrands() {
	await connectToDatabase();
	const subBrands = await SubBrand.find({})
		.populate("brandId", "name")
		.sort({ name: 1 })
		.lean();

	return subBrands.map((subBrand) => ({
		...subBrand,
		_id: subBrand._id.toString(),
		brandId: subBrand.brandId._id.toString(),
		brandName: (subBrand.brandId as any).name,
	}));
}

export async function getSubBrandBySlug(slug: string) {
	await connectToDatabase();
	const subBrand = await SubBrand.findOne({ slug }).lean();
	if (!subBrand) return null;
	return {
		...subBrand,
		_id: subBrand._id.toString(),
		brandId: subBrand.brandId.toString(),
	};
}

export async function createSubBrand(name: string, brandId: string) {
	await connectToDatabase();
	const slug = name
		.toLowerCase()
		.replace(/[^a-z0-9 -]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();
	const subBrand = new SubBrand({ name, slug, brandId });
	const savedSubBrand = await subBrand.save();
	return savedSubBrand._id.toString();
}

export async function updateSubBrand(
	id: string,
	name: string,
	brandId: string
) {
	await connectToDatabase();
	await SubBrand.findByIdAndUpdate(id, { name, brandId }, { new: true });
}

export async function deleteSubBrand(id: string) {
	await connectToDatabase();
	// Also delete related models
	await Model.deleteMany({ subBrandId: id });
	await SubBrand.findByIdAndDelete(id);
}

// Model operations
export async function getModelsBySubBrand(subBrandId: string) {
	await connectToDatabase();
	const models = await Model.find({ subBrandId }).sort({ name: 1 }).lean();
	return models.map((model) => ({
		...model,
		_id: model._id.toString(),
		subBrandId: model.subBrandId.toString(),
	}));
}

export async function getModelBySlug(slug: string) {
	await connectToDatabase();
	const model = await Model.findOne({ slug }).lean();
	if (!model) return null;
	return {
		...model,
		_id: model._id.toString(),
		subBrandId: model.subBrandId.toString(),
	};
}

export async function getModels() {
	await connectToDatabase();
	const models = await Model.find({})
		.populate({
			path: "subBrandId",
			populate: {
				path: "brandId",
				select: "name",
			},
		})
		.sort({ name: 1 })
		.lean();

	return models.map((model) => ({
		...model,
		_id: model._id.toString(),
		subBrandId: model.subBrandId._id.toString(),
		subBrandName: (model.subBrandId as any).name,
		brandName: (model.subBrandId as any).brandId.name,
	}));
}

export async function createModel(
	name: string,
	description: string,
	subBrandId: string,
	images: string[]
) {
	await connectToDatabase();
	const slug = name
		.toLowerCase()
		.replace(/[^a-z0-9 -]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();
	const model = new Model({ name, slug, description, subBrandId, images });
	const savedModel = await model.save();
	return savedModel._id.toString();
}

export async function updateModel(
	id: string,
	name: string,
	description: string,
	subBrandId: string,
	images?: string[]
) {
	await connectToDatabase();
	const updateData: any = { name, description, subBrandId };
	if (images && images.length > 0) updateData.images = images;

	await Model.findByIdAndUpdate(id, updateData, { new: true });
}

export async function deleteModel(id: string) {
	await connectToDatabase();
	await Model.findByIdAndDelete(id);
}

// Stats
export async function getStats() {
	await connectToDatabase();
	const [brands, subBrands, models] = await Promise.all([
		Brand.countDocuments(),
		SubBrand.countDocuments(),
		Model.countDocuments(),
	]);
	return { brands, subBrands, models };
}

// Utility function to validate ObjectId
export function isValidObjectId(id: string): boolean {
	return mongoose.Types.ObjectId.isValid(id);
}
