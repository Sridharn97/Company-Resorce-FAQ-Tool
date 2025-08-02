import dbConnect from '../../../lib/mongodb.js';
import FAQ from '../../../models/FAQ';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await dbConnect();

  const { faqId, helpful } = req.body;

  if (!faqId || typeof helpful !== 'boolean') {
    return res.status(400).json({ error: 'FAQ ID and helpful flag are required' });
  }

  try {
    const updateField = helpful ? { helpfulYes: 1 } : { helpfulNo: 1 };
    
    const faq = await FAQ.findByIdAndUpdate(
      faqId,
      { $inc: updateField },
      { new: true }
    );

    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    res.status(200).json({
      success: true,
      helpfulYes: faq.helpfulYes,
      helpfulNo: faq.helpfulNo,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
}