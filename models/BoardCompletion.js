import mongoose from 'mongoose';

const boardCompletionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  board: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold'],
    required: true
  },
  completionDate: {
    type: Date,
    default: Date.now
  },
  earnings: {
    type: Object,
    required: true
  }
});

const BoardCompletion = mongoose.models.BoardCompletion || mongoose.model('BoardCompletion', boardCompletionSchema);

export default BoardCompletion;
