import mongoose from 'mongoose'

const shippingRateSchema = new mongoose.Schema({
  state: {
    type: String,
    required: false,
    trim: true
  },
  city: {
    type: String,
    required: false,
    trim: true
  },
  standard: {
    type: Number,
    required: true,
    min: 0
  },
  express: {
    type: Number,
    required: true,
    min: 0
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Compound index for efficient lookups
shippingRateSchema.index({ state: 1, city: 1 }, { unique: true, partialFilterExpression: { state: { $exists: true }, city: { $exists: true } } })
shippingRateSchema.index({ state: 1 }, { unique: true, partialFilterExpression: { state: { $exists: true }, city: null } })
shippingRateSchema.index({ isDefault: 1 }, { unique: true, partialFilterExpression: { isDefault: true } })

export default mongoose.models.ShippingRate || mongoose.model('ShippingRate', shippingRateSchema)