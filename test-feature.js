// Simple test script to verify the user question and admin answer feature
// Run this with: node test-feature.js

const testUserQuestionSubmission = async () => {
  console.log('🧪 Testing User Question Submission...');
  
  try {
    const response = await fetch('http://localhost:3000/api/user-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        question: 'How do I reset my password?',
        userId: `test_${Date.now()}`
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ User question submitted successfully!');
      console.log('Question ID:', data.userQuestion._id);
      return data.userQuestion._id;
    } else {
      console.log('❌ Failed to submit question:', data.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Error submitting question:', error.message);
    return null;
  }
};

const testAdminAnswerQuestion = async (questionId) => {
  if (!questionId) return;
  
  console.log('🧪 Testing Admin Answer Question...');
  
  try {
    const response = await fetch(`http://localhost:3000/api/user-questions?id=${questionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answer: 'To reset your password, go to the login page and click "Forgot Password". Follow the instructions sent to your email.',
        category: 'Account Management',
        tags: ['password', 'reset', 'account']
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Question answered successfully!');
      console.log('Status:', data.userQuestion.status);
      return true;
    } else {
      console.log('❌ Failed to answer question:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Error answering question:', error.message);
    return false;
  }
};

const testConvertToFaq = async (questionId) => {
  if (!questionId) return;
  
  console.log('🧪 Testing Convert to FAQ...');
  
  try {
    const response = await fetch(`http://localhost:3000/api/user-questions?id=${questionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'Account Management',
        tags: ['password', 'reset', 'account']
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Question converted to FAQ successfully!');
      console.log('FAQ ID:', data.faq._id);
      return true;
    } else {
      console.log('❌ Failed to convert to FAQ:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Error converting to FAQ:', error.message);
    return false;
  }
};

const runTests = async () => {
  console.log('🚀 Starting Feature Tests...\n');
  
  // Test 1: Submit user question
  const questionId = await testUserQuestionSubmission();
  
  if (questionId) {
    console.log('\n---\n');
    
    // Test 2: Admin answers question
    const answered = await testAdminAnswerQuestion(questionId);
    
    if (answered) {
      console.log('\n---\n');
      
      // Test 3: Convert to FAQ
      await testConvertToFaq(questionId);
    }
  }
  
  console.log('\n🏁 Tests completed!');
  console.log('\n📝 To test the UI:');
  console.log('1. Open http://localhost:3000');
  console.log('2. Click "Ask a Question" to submit a question');
  console.log('3. Go to http://localhost:3000/admin/user-questions to answer questions');
  console.log('4. Use the "Convert to FAQ" button to create public FAQs');
};

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runTests().catch(console.error);
} 