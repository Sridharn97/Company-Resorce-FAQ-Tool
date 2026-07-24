import dbConnect from '../../../../lib/mongodb.js';
import FAQ from '../../../../models/FAQ';
import { requireAuth } from '../../../../lib/middleware';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return requireAuth(async (req, res) => {
    await dbConnect();

    const { id } = req.query;
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    try {
      const faq = await FAQ.findById(id);

      if (!faq) {
        return res.status(404).json({ error: 'FAQ not found' });
      }

      // Add the new comment
      faq.comments.push({
        text: text.trim(),
        user: req.user.userId,
      });

      await faq.save();

      // Populate the newly added comment's user for the response
      await faq.populate('comments.user', 'email name role');

      // Get the last added comment (which is the one we just added)
      const newComment = faq.comments[faq.comments.length - 1];

      res.status(201).json({ success: true, comment: newComment });
    } catch (error) {
      console.error('Failed to add comment:', error);
      res.status(500).json({ error: 'Failed to add comment' });
    }
  })(req, res);
}
