import mongoose from 'mongoose';

const UserQuestionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  question: { type: String, required: true },
  userId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'answered', 'converted'], default: 'pending' },
  answer: { type: String, default: '' },
  answeredBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  answeredAt: { type: Date },
  category: { type: String, default: '' },
  tags: [{ type: String, trim: true }],
  convertedToFaq: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'FAQ' 
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.UserQuestion || mongoose.model('UserQuestion', UserQuestionSchema); 