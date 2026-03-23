import dbConnect from '../../../lib/mongodb';
import FAQ from '../../../models/FAQ';
import UserQuestion from '../../../models/UserQuestion';
import { requireAdmin } from '../../../lib/middleware';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return requireAdmin(async (req, res) => {
    await dbConnect();

    try {
      // 1. Get overall stats
      const totalFaqsCount = await FAQ.countDocuments();
      const totalUserQuestionsCount = await UserQuestion.countDocuments();
      const pendingQuestionsCount = await UserQuestion.countDocuments({ status: 'pending' });
      
      const faqsList = await FAQ.find({});
      const totalViews = faqsList.reduce((sum, faq) => sum + (faq.views || 0), 0);
      const totalHelpful = faqsList.reduce((sum, faq) => sum + (faq.helpfulYes || 0), 0);

      // 2. Aggregate data by category
      const categories = [...new Set(faqsList.map(faq => faq.category))];
      
      const categoryData = categories.map(category => {
        const categoryFaqs = faqsList.filter(f => f.category === category);
        const categoryViews = categoryFaqs.reduce((sum, f) => sum + (f.views || 0), 0);
        const faqCount = categoryFaqs.length;
        
        return {
          category,
          faqCount,
          totalViews: categoryViews,
          efficiencyScore: faqCount > 0 ? (categoryViews / faqCount).toFixed(2) : 0
        };
      });

      // 3. Identify Knowledge Gaps
      // Gaps are categories with high user interest (simulated by high view/FAQ ratio or high pending questions)
      // or categories present in user questions but missing in FAQs.
      const userQuestions = await UserQuestion.find({});
      const questionCategories = [...new Set(userQuestions.map(q => q.category))].filter(Boolean);
      
      const knowledgeGaps = [];

      // Categorize pending user questions to find missing knowledge
      const pendingByCat = {};
      userQuestions.filter(q => q.status === 'pending').forEach(q => {
        const cat = q.category || 'Uncategorized';
        pendingByCat[cat] = (pendingByCat[cat] || 0) + 1;
      });

      // Check categories from user questions that don't have enough FAQs
      questionCategories.forEach(cat => {
        const faqCount = faqsList.filter(f => f.category === cat).length;
        const pendingCount = pendingByCat[cat] || 0;
        
        if (faqCount < 3 && pendingCount > 0) {
          knowledgeGaps.push({
            category: cat,
            reason: faqCount === 0 ? 'No FAQs for this category' : 'High demand, few FAQs',
            pendingQuestions: pendingCount,
            priority: pendingCount > 2 ? 'High' : 'Medium'
          });
        }
      });

      // Also find high-view categories that might need more content
      categoryData.sort((a, b) => b.efficiencyScore - a.efficiencyScore);
      const highDemandGaps = categoryData.slice(0, 3).filter(d => d.faqCount < 5);
      highDemandGaps.forEach(d => {
        if (!knowledgeGaps.find(g => g.category === d.category)) {
          knowledgeGaps.push({
            category: d.category,
            reason: 'Trending high views per FAQ',
            currentFaqs: d.faqCount,
            efficiencyScore: d.efficiencyScore,
            priority: 'Medium'
          });
        }
      });

      res.status(200).json({
        stats: {
          totalFaqs: totalFaqsCount,
          totalUserQuestions: totalUserQuestionsCount,
          pendingQuestions: pendingQuestionsCount,
          totalViews,
          totalHelpful
        },
        categoryData,
        knowledgeGaps: knowledgeGaps.sort((a, b) => (a.priority === 'High' ? -1 : 1))
      });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  })(req, res);
}
