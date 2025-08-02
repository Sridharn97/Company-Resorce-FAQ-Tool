# Company Resource FAQ Tool

A comprehensive FAQ management system built with Next.js, MongoDB, and modern web technologies.

## Features

### For Users
- **Browse FAQs**: Search and filter through existing FAQs by category, tags, and keywords
- **Ask Questions**: Submit new questions when you can't find what you're looking for
- **Track Status**: Monitor the status of your submitted questions (pending, answered, converted to FAQ)
- **User Authentication**: Secure login and registration system

### For Admins
- **FAQ Management**: Create, edit, and delete FAQs with rich content
- **Question Review**: Review and answer user-submitted questions
- **Convert to FAQ**: Convert answered questions into public FAQs
- **Dashboard Analytics**: View statistics and manage content

## User Question Workflow

1. **User Submits Question**: Users can submit questions through the "Ask a Question" page
2. **Admin Review**: Admins can view all pending questions in the admin dashboard
3. **Admin Answers**: Admins can provide detailed answers with categories and tags
4. **Convert to FAQ**: Once answered, questions can be converted to public FAQs
5. **Status Tracking**: Questions progress through: pending → answered → converted

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technology Stack

- **Frontend**: Next.js, React, CSS Modules
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Custom session-based auth
- **Styling**: Modern CSS with gradients and animations

## Project Structure

```
company-resource-faq-tool/
├── pages/
│   ├── api/           # API endpoints
│   ├── admin/         # Admin dashboard pages
│   ├── ask.js         # User question submission
│   └── index.js       # Main FAQ listing
├── models/            # MongoDB schemas
├── styles/            # CSS modules
└── lib/              # Utility functions
```

## API Endpoints

- `GET /api/faqs` - List all FAQs with filtering
- `POST /api/user-questions` - Submit a new question
- `GET /api/user-questions` - Get all user questions (admin only)
- `PUT /api/user-questions` - Answer a question (admin only)
- `PATCH /api/user-questions` - Convert question to FAQ (admin only)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
