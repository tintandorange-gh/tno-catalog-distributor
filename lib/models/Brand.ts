import mongoose, { Schema, type Document } from "mongoose";

export interface IBrand extends Document {
	name: string;
	slug: string;
	logo?: string;
	createdAt: Date;
	updatedAt: Date;
}

const BrandSchema: Schema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},
		slug: {
			type: String,
			lowercase: true,
		},
		logo: {
			type: String,
			default: null,
		},
	},
	{
		timestamps: true,
	}
);

// Create slug from name before saving
BrandSchema.pre("save", function (this: IBrand, next) {
	if (this.isModified("name")) {
		this.slug = this.name
			.toLowerCase()
			.replace(/[^a-z0-9 -]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			.trim();
	}
	next();
});

export default mongoose.models.Brand ||
	mongoose.model<IBrand>("Brand", BrandSchema);
