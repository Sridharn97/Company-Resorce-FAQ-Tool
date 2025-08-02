import dbConnect from '../../../lib/mongodb.js';
import FAQ from '../../../models/FAQ';
import { requireAdmin } from '../../../lib/middleware';

export default async function handler(req, res) {
  await dbConnect();
  
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const faq = await FAQ.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true }
      ).populate('createdBy', 'email');

      if (!faq) {
        return res.status(404).json({ error: 'FAQ not found' });
      }

      res.status(200).json(faq);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch FAQ' });
    }
  } else if (req.method === 'PUT') {
    // Update FAQ - Admin only
    return requireAdmin(async (req, res) => {
      const { question, answer, category, tags } = req.body;

      try {
        const faq = await FAQ.findByIdAndUpdate(
          id,
          { question, answer, category, tags },
          { new: true }
        ).populate('createdBy', 'email');

        if (!faq) {
          return res.status(404).json({ error: 'FAQ not found' });
        }

        res.status(200).json(faq);
      } catch (error) {
        res.status(500).json({ error: 'Failed to update FAQ' });
      }
    })(req, res);
  } else if (req.method === 'DELETE') {
    // Delete FAQ - Admin only
    return requireAdmin(async (req, res) => {
      try {
        const faq = await FAQ.findByIdAndDelete(id);

        if (!faq) {
          return res.status(404).json({ error: 'FAQ not found' });
        }

        res.status(200).json({ success: true, message: 'FAQ deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete FAQ' });
      }
    })(req, res);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}