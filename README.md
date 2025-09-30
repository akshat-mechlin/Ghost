# GhostQA - AI-Powered Website Testing Platform

A comprehensive, production-ready website testing platform that uses AI to generate test cases and automate browser testing.

## 🚀 Features

### **Real Website Crawling**
- **Puppeteer-powered** web crawling
- **Real-time status updates** (PENDING → CRAWLING → COMPLETED)
- **Page extraction** with forms, buttons, links
- **Database storage** of crawled pages
- **Error handling** for failed crawls

### **AI-Powered Test Generation**
- **OpenAI GPT-4** integration for intelligent test case generation
- **Website structure analysis** to create relevant test cases
- **Fallback test cases** if AI fails
- **Priority and tagging** system
- **Database storage** of generated tests

### **Real Test Execution**
- **Playwright automation** for actual test execution
- **Real browser testing** with screenshots
- **Step-by-step execution** with detailed results
- **Error tracking** and logging
- **Database storage** of test results

### **Production-Ready APIs**
- **RESTful endpoints** for all operations
- **Proper error handling** and validation
- **Database transactions** and data integrity
- **Real-time status updates**
- **Comprehensive logging**

## 🛠️ Tech Stack

- **Frontend**: Next.js 13, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **AI**: OpenAI GPT-4
- **Testing**: Playwright, Puppeteer
- **UI Components**: shadcn/ui

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pareekakshat/Ghost.git
   cd Ghost
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install
   ```

4. **Set up environment variables**
   Create a `.env.local` file with:
   ```env
   # Database
   DATABASE_URL="your-supabase-database-url"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   
   # Stripe
   STRIPE_SECRET_KEY="your-stripe-secret-key"
   STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
   
   # OpenAI
   OPENAI_API_KEY="your-openai-api-key"
   ```

5. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

## 🎯 Usage

1. **Visit**: http://localhost:3000/websites
2. **Add a Website**: Click "Add Website" → Fill form → Submit
3. **Crawl Website**: Click "Crawl" → Watch real-time status updates
4. **View Results**: See actual pages, forms, and buttons found
5. **Generate Tests**: Click "Test Cases" → "Generate with AI"
6. **Run Tests**: Click "Run Test" → Watch real browser automation
7. **View Results**: See detailed test execution results with screenshots

## 📁 Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── websites/          # Website management APIs
│   │   ├── test-runs/         # Test execution APIs
│   │   └── auth/              # Authentication APIs
│   ├── dashboard/             # Dashboard page
│   ├── websites/              # Website management pages
│   └── globals.css            # Global styles
├── components/                # Reusable UI components
├── lib/                      # Utility functions
├── prisma/                   # Database schema
└── types/                    # TypeScript type definitions
```

## 🔧 API Endpoints

### Websites
- `GET /api/websites` - Get all websites
- `POST /api/websites` - Create new website
- `POST /api/websites/crawl` - Start website crawling
- `GET /api/websites/[id]/status` - Get website status

### Test Cases
- `GET /api/websites/[id]/test-cases` - Get test cases for website
- `POST /api/websites/generate-tests` - Generate AI test cases

### Test Execution
- `POST /api/test-runs/execute` - Execute test cases
- `GET /api/websites/[id]/test-runs` - Get test run history

## 🚀 Deployment

The application is ready for deployment on platforms like:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **Heroku**

Make sure to set up your environment variables in your deployment platform.

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support, email support@ghostqa.com or create an issue in this repository.

---

**Built with ❤️ by the GhostQA Team**
