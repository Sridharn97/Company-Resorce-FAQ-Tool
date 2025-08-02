import dbConnect from '../../lib/mongodb.js';
import UserQuestion from '../../models/UserQuestion';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const { name, email, question, userId } = req.body;
    if (!name || !email || !question || !userId) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    try {
      const userQuestion = await UserQuestion.create({ name, email, question, userId });
      return res.status(201).json({ message: 'Question submitted!', userQuestion });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to submit question.' });
    }
  } else if (req.method === 'GET') {
    // Admin-only endpoint to get user questions for a specific userId
    try {
      const { status, userId } = req.query;
      const filter = {};
      if (status) filter.status = status;
      if (userId) filter.userId = userId;
      const userQuestions = await UserQuestion.find(filter).sort({ createdAt: -1 });
      return res.status(200).json(userQuestions);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch user questions.' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 