import dbConnect from '../../../lib/mongodb.js';
import FAQ from '../../../models/FAQ';
import { requireAdmin } from '../../../lib/middleware';

// GET all FAQs or CREATE new FAQ
export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { search, category, tags, sort, page = 1, limit = 6 } = req.query;
      
      let query = {};
      
      // Advanced search in question, answer, and tags
      if (search) {
        query.$or = [
          { question: { $regex: search, $options: 'i' } },
          { answer: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ];
      }
      
      // Filter by category
      if (category && category !== 'all') {
        query.category = category;
      }
      
      // Filter by tags
      if (tags && tags !== 'all') {
        query.tags = { $in: [tags] };
      }


      let sortOption = { createdAt: -1 }; 
      if (sort === 'helpful') {
        sortOption = { helpfulYes: -1 };
      } else if (sort === 'views') {
        sortOption = { views: -1 };
      } else if (sort === 'newest') {
        sortOption = { createdAt: -1 };
      }

      // Calculate pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Get total count for pagination
      const totalFaqs = await FAQ.countDocuments(query);
      const totalPages = Math.ceil(totalFaqs / limitNum);

      const faqs = await FAQ.find(query)
        .populate('createdBy', 'email')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum);

      const allFaqs = await FAQ.find({});
      const categories = [...new Set(allFaqs.map(faq => faq.category))];
      const allTags = [...new Set(allFaqs.flatMap(faq => faq.tags))];

      res.status(200).json({
        faqs,
        categories,
        tags: allTags,
        totalFaqs,
        totalPages,
        currentPage: pageNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch FAQs' });
    }
  } else if (req.method === 'POST') {

    return requireAdmin(async (req, res) => {
      const { question, answer, category, tags } = req.body;

      if (!question || !answer || !category) {
        return res.status(400).json({ error: 'Question, answer, and category are required' });
      }

      try {
        const faq = new FAQ({
          question,
          answer,
          category,
          tags: tags || [],
          createdBy: req.user.userId,
        });

        await faq.save();
        await faq.populate('createdBy', 'email');

        res.status(201).json(faq);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create FAQ' });
      }
    })(req, res);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}