import mongoose from "mongoose"

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  flutterwaveTxRef: {
    type: String,
    required: true,
    unique: true // Remove this line to avoid duplicate index
  },
  flutterwaveId: {
    type: Number,
    unique: true,
    sparse: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userPhone: {
    type: String
  },
  userName: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'NGN'
  },
  planType: {
    type: String,
    enum: ['basic', 'classic', 'deluxe', 'wallet_funding', 'wallet_withdraw', 'flutterwave_withdraw'],
    required: true
  },
  planName: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'successful', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['successful', 'failed', 'pending', 'abandoned'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'mobile_money', 'ussd', 'account']
  },
  flutterwaveResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  paidAt: {
    type: Date
  }
});

transactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Define indexes only once here (remove unique: true from schema fields above)
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: 1 });

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);