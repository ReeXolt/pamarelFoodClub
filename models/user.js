import mongoose from 'mongoose';

const boardProgressSchema = new mongoose.Schema({
  boardType: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    required: true
  },
  directReferrals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  indirectReferrals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  completed: {
    type: Boolean,
    default: false
  },
  completionDate: Date,
  rewardsClaimed: {
    type: Boolean,
    default: false
  },
  claimedOption: String,
  claimedAt: Date
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true
  },
  verifyToken: {
    type: String
  },
  expireToken: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended'],
    default: 'pending'
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  referralCode: {
    type: String,
    unique: true,
    required: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  currentPlan: {
    type: String,
    enum: ['basic', 'classic', 'deluxe']
  },
  plan: { // Legacy field for backward compatibility
    type: String,
    enum: ['basic', 'classic', 'deluxe']
  },
  currentBoard: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze',
    set: function(value) {
      return value ? value.toLowerCase() : 'bronze';
    }
  },
  boardProgress: [boardProgressSchema],
  wallets: {
    food: {
      type: Number,
      default: 0
    },
    gadget: {
      type: Number,
      default: 0
    },
    cash: {
      type: Number,
      default: 0
    }
  },
  earnings: {
    foodWallet: {
      type: Number,
      default: 0
    },
    gadgetsWallet: {
      type: Number,
      default: 0
    },
    cashWallet: {
      type: Number,
      default: 0
    }
  },
  downlines: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to handle data migration and validation
userSchema.pre('save', function(next) {
  // Migrate plan to currentPlan if needed
  if (this.plan && !this.currentPlan) {
    this.currentPlan = this.plan;
  }
  
  // Migrate earnings to wallets if needed
  if (this.earnings && (!this.wallets || Object.keys(this.wallets).length === 0)) {
    this.wallets = {
      food: this.earnings.foodWallet || 0,
      gadget: this.earnings.gadgetsWallet || 0,
      cash: this.earnings.cashWallet || 0
    };
  }
  
  // Ensure currentBoard is lowercase
  if (this.currentBoard && this.currentBoard !== this.currentBoard.toLowerCase()) {
    this.currentBoard = this.currentBoard.toLowerCase();
  }
  
  // Ensure boardProgress boardType is lowercase and valid
  if (Array.isArray(this.boardProgress)) {
    this.boardProgress = this.boardProgress.map(board => {
      if (board.boardType && board.boardType !== board.boardType.toLowerCase()) {
        board.boardType = board.boardType.toLowerCase();
      }
      return board;
    });
  }
  
  next();
});

userSchema.methods.generateReferralCode = function() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;