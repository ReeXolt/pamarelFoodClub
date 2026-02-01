import mongoose from "mongoose";

const { Schema } = mongoose;

const VariantSchema = new Schema({
  name: { type: String, required: true },
  options: [{ type: String, required: true }],
}, { _id: false });

const FlashSaleSchema = new Schema({
  active: { type: Boolean, default: false },
  discountPercentage: { type: Number, min: 0, max: 100 },
  startDate: { type: Date },
  endDate: { type: Date },
}, { _id: false });

const ProductSchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  sellingPrice: { type: Number, required: true, min: 0 },
  section: { 
    type: String, 
    enum: ["food", "gadget"], 
    required: true 
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  price: { type: Number, required: true, min: 0 },
  images: [{ type: String, required: true }],
  variants: [VariantSchema],
  stock: { type: Number, default: 0 },
  numberSold: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  flashSale: FlashSaleSchema,
  tags: [{ type: String }],
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
