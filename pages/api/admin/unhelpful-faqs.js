import dbConnect from '../../../lib/mongodb.js';
import FAQ from '../../../models/FAQ';
import { requireAdmin } from '../../../lib/middleware';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return requireAdmin(async (req, res) => {
    await dbConnect();

    try {
      // Find FAQs where helpfulNo > 0, and sort by highest helpfulNo first
      const faqs = await FAQ.find({ helpfulNo: { $gt: 0 } })
        .populate('createdBy', 'email')
        .sort({ helpfulNo: -1 });

      res.status(200).json({ faqs });
    } catch (error) {
      console.error('Failed to fetch unhelpful FAQs:', error);
      res.status(500).json({ error: 'Failed to fetch unhelpful FAQs' });
    }
  })(req, res);
}
