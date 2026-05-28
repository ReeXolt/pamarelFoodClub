import mongoose, {
	Schema,
	model,
	models,
	InferSchemaType,
	HydratedDocument,
	Model,
} from 'mongoose';

/* ----------------------------- Variant Schema ----------------------------- */

const VariantSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},

		options: [
			{
				type: String,
				required: true,
			},
		],
	},
	{
		_id: false,
	},
);

/* --------------------------- Flash Sale Schema ---------------------------- */

const FlashSaleSchema = new Schema(
	{
		active: {
			type: Boolean,
			default: false,
		},

		discountPercentage: {
			type: Number,
			min: 0,
			max: 100,
		},

		startDate: {
			type: Date,
		},

		endDate: {
			type: Date,
		},
	},
	{
		_id: false,
	},
);

/* ----------------------------- Product Schema ----------------------------- */

const ProductSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},

		description: {
			type: String,
			trim: true,
		},

		sellingPrice: {
			type: Number,
			required: true,
			min: 0,
		},

		section: {
			type: String,
			enum: ['food', 'gadget'],
			required: true,
		},

		category: {
			type: Schema.Types.ObjectId,
			ref: 'Category',
		},

		price: {
			type: Number,
			required: true,
			min: 0,
		},

		images: [
			{
				type: String,
				required: true,
			},
		],

		variants: [VariantSchema],

		stock: {
			type: Number,
			default: 0,
		},

		numberSold: {
			type: Number,
			default: 0,
		},

		featured: {
			type: Boolean,
			default: false,
		},

		flashSale: FlashSaleSchema,

		tags: [
			{
				type: String,
			},
		],

		ratings: {
			average: {
				type: Number,
				default: 0,
				min: 0,
				max: 5,
			},

			count: {
				type: Number,
				default: 0,
			},
		},
	},
	{
		timestamps: true,
	},
);

/* --------------------------------- Types --------------------------------- */

export type VariantType = InferSchemaType<typeof VariantSchema>;

export type SelectedVariants = Record<string, string>;

export type FlashSaleType = InferSchemaType<typeof FlashSaleSchema>;

export type ProductType = InferSchemaType<typeof ProductSchema>;

export type ProductDTO = Omit<ProductType, never> & {
	_id: string;
};

export type ProductDocument = HydratedDocument<ProductDTO>;

/* --------------------------------- Model --------------------------------- */

const Product: Model<ProductDTO> =
	models.Product || model<ProductDTO>('Product', ProductSchema);

export default Product;