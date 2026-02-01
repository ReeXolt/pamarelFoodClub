import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one review per product per user per order
reviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });

// Update product ratings when a review is saved
reviewSchema.post('save', async function(doc) {
  const Product = mongoose.model('Product');
  const product = await Product.findById(doc.product);
  
  if (product) {
    const reviews = await mongoose.model('Review').find({ product: doc.product });
    const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
    
    product.rating = totalRatings;
    product.numReviews = reviews.length;
    await product.save();
  }
});

export default mongoose.models.Review || mongoose.model('Review', reviewSchema);