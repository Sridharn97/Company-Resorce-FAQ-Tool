import mongoose from 'mongoose';

const UserQuestionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  question: { type: String, required: true },
  userId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'reviewed', 'converted'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.UserQuestion || mongoose.model('UserQuestion', UserQuestionSchema); 