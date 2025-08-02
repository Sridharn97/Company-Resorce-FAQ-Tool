# Testing Guide: User Question & Admin Answer Feature

## 🚀 Quick Start

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open the application:**
   - Main page: http://localhost:3000
   - Ask question: http://localhost:3000/ask
   - Admin dashboard: http://localhost:3000/admin/dashboard
   - User questions: http://localhost:3000/admin/user-questions

## 🧪 Testing Scenarios

### Scenario 1: User Submits a Question

1. **Navigate to Ask Page:**
   - Go to http://localhost:3000/ask
   - Or click "Ask a Question" from the main page

2. **Fill out the form:**
   - Name: "John Doe"
   - Email: "john@example.com"
   - Question: "How do I access my employee benefits?"

3. **Submit the question:**
   - Click "Submit Question"
   - You should see a success message

### Scenario 2: Admin Reviews and Answers Questions

1. **Access Admin Panel:**
   - Go to http://localhost:3000/admin/user-questions
   - You should see the submitted question with "pending" status

2. **Answer the question:**
   - Click "Answer Question" button
   - Fill in the modal:
     - Answer: "You can access your employee benefits through the HR portal..."
     - Category: "Benefits"
     - Tags: "benefits, hr, portal"
   - Click "Submit Answer"

3. **Verify status change:**
   - The question status should change to "answered"
   - You should see the answer displayed

### Scenario 3: Convert to FAQ

1. **Convert answered question:**
   - Click "Convert to FAQ" button
   - Confirm the action
   - The status should change to "converted"

2. **Verify FAQ creation:**
   - Go to http://localhost:3000
   - You should see the new FAQ in the list
   - Click on it to view the full FAQ

## 🔧 API Testing

Run the automated test script:
```bash
node test-feature.js
```

This will test:
- User question submission
- Admin answering questions
- Converting questions to FAQs

## 📊 Expected Workflow

```
User Question → Admin Review → Admin Answer → Convert to FAQ
     ↓              ↓              ↓              ↓
  pending      →  pending    →  answered   →  converted
```

## 🎯 Key Features to Test

### For Users:
- [ ] Question submission form validation
- [ ] Success/error message display
- [ ] Form reset after successful submission

### For Admins:
- [ ] View all user questions
- [ ] Answer questions with rich text
- [ ] Add categories and tags
- [ ] Convert answered questions to FAQs
- [ ] Status tracking (pending → answered → converted)

### UI/UX:
- [ ] Responsive design on mobile
- [ ] Modal dialogs work properly
- [ ] Loading states during operations
- [ ] Error handling and user feedback

## 🐛 Common Issues & Solutions

### Issue: "Failed to submit question"
**Solution:** Check if MongoDB is running and connected

### Issue: "Question not found"
**Solution:** Ensure the question ID is correct in the URL

### Issue: Modal doesn't close
**Solution:** Check browser console for JavaScript errors

### Issue: Status doesn't update
**Solution:** Refresh the page or check network requests

## 📝 Notes

- The system uses a default admin ID for now
- Questions are stored with unique user IDs
- FAQs created from questions maintain the original question/answer
- All timestamps are automatically managed

## 🎉 Success Criteria

✅ User can submit questions successfully
✅ Admin can view and answer questions
✅ Admin can convert questions to FAQs
✅ Status tracking works correctly
✅ UI is responsive and user-friendly
✅ Error handling works properly 