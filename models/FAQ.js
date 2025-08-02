import mongoose from 'mongoose';

const FAQSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  answer: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  views: {
    type: Number,
    default: 0,
  },
  helpfulYes: {
    type: Number,
    default: 0,
  },
  helpfulNo: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false }, // Only manage createdAt
});

// Only createdAt is now available on each FAQ document

export default mongoose.models.FAQ || mongoose.model('FAQ', FAQSchema);