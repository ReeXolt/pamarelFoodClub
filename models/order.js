import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  isReviewed: {
    type: Boolean,
    default: false
  },
  selectedVariants: {
    type: Map,
    of: String,
    default: {}
  },
  variantSku: {
    type: String
  }
});

const shippingInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  address: {
    type: String,
    // Not required for pickup orders
  },
  city: {
    type: String,
    // Not required for pickup orders
  },
  zip: {
    type: String,
  }
});

const pickupInfoSchema = new mongoose.Schema({
  centerId: {
    type: String,
    required: true
  },
  centerName: {
    type: String,
    required: true
  },
  centerAddress: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  hours: {
    type: String,
    default: 'Mon-Sat: 9am - 5pm'
  },
  daysOpen: {
    type: String,
    default: 'Monday - Saturday'
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shippingInfo: shippingInfoSchema,
  pickupInfo: pickupInfoSchema, // New field for pickup orders
  items: [orderItemSchema],
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  },
  isReviewed: {
    type: Boolean,
    default: false
  },
  deliveryMethod: {
    type: String,
    required: true,
    enum: ['standard', 'express', 'pickup'] // Added 'pickup'
  },
  deliveryPrice: {
    type: Number,
    required: true,
    default: 0
  },
  subtotal: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash_wallet', 'food_wallet', 'gadget_wallet', 'bank_transfer', 'card', 'pay_on_delivery']
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['processing', 'shipped', 'delivered', 'cancelled', 'ready_for_pickup'], // Added 'ready_for_pickup'
    default: 'processing'
  },
  walletBalanceUsed: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);