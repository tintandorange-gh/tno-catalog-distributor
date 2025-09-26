import mongoose, { Schema, type Document } from "mongoose";

export interface ISubBrand extends Document {
	name: string;
	slug: string;
	brandId: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const SubBrandSchema: Schema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		slug: {
			type: String,
			required: true,
			lowercase: true,
		},
		brandId: {
			type: Schema.Types.ObjectId,
			ref: "Brand",
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

// Create compound index for unique sub-brand per brand
SubBrandSchema.index({ name: 1, brandId: 1 }, { unique: true });

// Create slug from name before saving
SubBrandSchema.pre<ISubBrand>("save", function (next) {
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

export default mongoose.models.SubBrand ||
	mongoose.model<ISubBrand>("SubBrand", SubBrandSchema);
