import dbConnect from '../../lib/mongodb.js';
import UserQuestion from '../../models/UserQuestion';
import FAQ from '../../models/FAQ';

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
    // Admin-only endpoint to get user questions
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
  } else if (req.method === 'PUT') {
    // Admin-only endpoint to answer questions
    try {
      const { id } = req.query;
      const { answer, category, tags } = req.body;
      
      if (!id || !answer) {
        return res.status(400).json({ error: 'Question ID and answer are required.' });
      }

      const userQuestion = await UserQuestion.findById(id);
      if (!userQuestion) {
        return res.status(404).json({ error: 'Question not found.' });
      }

      userQuestion.answer = answer;
      userQuestion.status = 'answered';
      userQuestion.answeredAt = new Date();
      if (category) userQuestion.category = category;
      if (tags) userQuestion.tags = tags;
      // For now, we'll use a default admin ID since we don't have session management
      userQuestion.answeredBy = '64f8b8b8b8b8b8b8b8b8b8b8';

      await userQuestion.save();
      return res.status(200).json({ message: 'Question answered successfully!', userQuestion });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to answer question.' });
    }
  } else if (req.method === 'PATCH') {
    // Admin-only endpoint to convert question to FAQ
    try {
      const { id } = req.query;
      const { category, tags } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Question ID is required.' });
      }

      const userQuestion = await UserQuestion.findById(id);
      if (!userQuestion) {
        return res.status(404).json({ error: 'Question not found.' });
      }

      if (!userQuestion.answer) {
        return res.status(400).json({ error: 'Question must be answered before converting to FAQ.' });
      }

      // Create new FAQ from the question
      const newFaq = await FAQ.create({
        question: userQuestion.question,
        answer: userQuestion.answer,
        category: category || userQuestion.category || 'General',
        tags: tags || userQuestion.tags || [],
        createdBy: userQuestion.answeredBy || '64f8b8b8b8b8b8b8b8b8b8b8' // Default admin ID
      });

      // Update user question status
      userQuestion.status = 'converted';
      userQuestion.convertedToFaq = newFaq._id;
      await userQuestion.save();

      return res.status(200).json({ 
        message: 'Question converted to FAQ successfully!', 
        faq: newFaq,
        userQuestion 
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to convert question to FAQ.' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET', 'PUT', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 