import mongoose, { Schema, type Document } from "mongoose";

export interface IModel extends Document {
	name: string;
	slug: string;
	description?: string;
	subBrandId: mongoose.Types.ObjectId;
	images: string[];
	createdAt: Date;
	updatedAt: Date;
}

const ModelSchema: Schema = new Schema(
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
		description: {
			type: String,
			trim: true,
			default: "",
		},
		subBrandId: {
			type: Schema.Types.ObjectId,
			ref: "SubBrand",
			required: true,
		},
		images: [
			{
				type: String,
				validate: {
					validator: (v: string) => /^https?:\/\/.+/.test(v),
					message: "Image must be a valid URL",
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

// Create compound index for unique model per sub-brand
ModelSchema.index({ name: 1, subBrandId: 1 }, { unique: true });

// Create slug from name before saving
ModelSchema.pre("save", function (this: IModel, next) {
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

export default mongoose.models.Model ||
	mongoose.model<IModel>("Model", ModelSchema);
