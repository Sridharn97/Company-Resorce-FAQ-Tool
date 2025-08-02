import dbConnect from '../../lib/mongodb.js';
import User from '../../models/User';
import UserQuestion from '../../models/UserQuestion';
import FAQ from '../../models/FAQ';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await dbConnect();

  try {
    // Get user from session (this assumes you have session middleware)
    const userRes = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/me`, {
      headers: req.headers,
    });

    if (!userRes.ok) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userData = await userRes.json();
    const user = await User.findById(userData.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's submitted questions
    const userQuestions = await UserQuestion.find({ email: user.email }).sort({ createdAt: -1 });

    // Get FAQs the user marked as helpful
    const helpfulFaqs = await FAQ.find({ _id: { $in: user.helpfulVotes } }).populate('createdBy', 'email');

    res.status(200).json({
      user: {
        email: user.email,
        role: user.role,
      },
      userQuestions,
      helpfulFaqs,
    });
  } catch (error) {
    console.error('Profile API error:', error);
    res.status(500).json({ error: 'Failed to fetch profile data' });
  }
} 