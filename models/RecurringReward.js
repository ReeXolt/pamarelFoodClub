import mongoose from 'mongoose';

const RecurringRewardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  boardType: {
    type: String,
    required: true,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum']
  },
  description: {
    type: String, // e.g., "Monthly food supplies"
    required: true
  },
  walletType: {
    type: String,
    required: true,
    enum: ['food', 'gadget', 'cash']
  },
  monthlyAmount: {
    type: Number,
    required: true
  },
  totalMonths: {
    type: Number,
    required: true
  },
  monthsPaid: {
    type: Number,
    default: 1 // First month is paid immediately upon claim
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  nextDueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  history: [{
    paidAt: Date,
    amount: Number,
    monthNumber: Number
  }]
}, { timestamps: true });

// Index for efficient querying by due date and status
RecurringRewardSchema.index({ status: 1, nextDueDate: 1 });

export default mongoose.models.RecurringReward || mongoose.model('RecurringReward', RecurringRewardSchema);
