# GhostQA Setup Guide

Complete setup instructions for the AI-Powered Website Testing Platform.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **PostgreSQL** (or use Supabase) - [Download here](https://www.postgresql.org/)
- **Code Editor** (VS Code recommended) - [Download here](https://code.visualstudio.com/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/akshat-mechlin/Ghost.git
cd Ghost
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Playwright Browsers

```bash
npx playwright install
```

### 4. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Copy the example file
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ghostqa"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Stripe (Optional)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# OpenAI (Required for AI test generation)
OPENAI_API_KEY="sk-your-openai-api-key"

# Redis (Optional)
REDIS_URL="redis://localhost:6379"

# App Configuration
APP_URL="http://localhost:3000"
SUBDOMAIN_SUFFIX=".localhost:3000"

# SMTP (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

## 🗄️ Database Setup

### Option 1: Supabase (Recommended)

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up and create a new project

2. **Get Database Credentials**
   - Go to Settings → Database
   - Copy the connection string
   - Update `DATABASE_URL` in `.env.local`

3. **Example Supabase URL:**
   ```env
   DATABASE_URL="postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres"
   ```

### Option 2: Local PostgreSQL

1. **Install PostgreSQL**
   ```bash
   # Windows (using Chocolatey)
   choco install postgresql

   # macOS (using Homebrew)
   brew install postgresql

   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   ```

2. **Create Database**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres

   # Create database
   CREATE DATABASE ghostqa;

   # Create user (optional)
   CREATE USER ghostqa_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE ghostqa TO ghostqa_user;

   # Exit
   \q
   ```

3. **Update DATABASE_URL**
   ```env
   DATABASE_URL="postgresql://ghostqa_user:your_password@localhost:5432/ghostqa"
   ```

## 🔧 Database Migration

Run Prisma migrations to set up the database schema:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed the database
npx prisma db seed
```

## 🤖 OpenAI Setup

1. **Create OpenAI Account**
   - Go to [platform.openai.com](https://platform.openai.com)
   - Sign up and verify your account

2. **Get API Key**
   - Go to API Keys section
   - Create a new secret key
   - Copy the key and add to `.env.local`

3. **Add Credits**
   - Add billing information
   - Purchase credits for API usage

## 💳 Stripe Setup (Optional)

1. **Create Stripe Account**
   - Go to [stripe.com](https://stripe.com)
   - Sign up for a developer account

2. **Get API Keys**
   - Go to Developers → API Keys
   - Copy Publishable and Secret keys
   - Add to `.env.local`

3. **Set Up Webhooks**
   - Go to Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`

## 🚀 Running the Application

### Development Mode

```bash
# Start the development server
npm run dev

# The application will be available at:
# http://localhost:3000
```

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🧪 Testing the Application

### 1. Test Database Connection

```bash
# Check if database is connected
npx prisma db pull

# View database in Prisma Studio
npx prisma studio
```

### 2. Test Website Crawling

1. Go to http://localhost:3000/websites
2. Click "Add Website"
3. Enter a website URL (e.g., https://example.com)
4. Click "Crawl" and watch the real-time progress

### 3. Test AI Test Generation

1. After crawling a website, go to "Test Cases"
2. Click "Generate with AI"
3. Wait for AI to generate test cases
4. Review the generated test cases

### 4. Test Test Execution

1. Go to any test case
2. Click "Run Test"
3. Watch the browser automation in action
4. View detailed results and screenshots

## 🐳 Docker Setup (Alternative)

### Using Docker Compose

1. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     postgres:
       image: postgres:15
       environment:
         POSTGRES_DB: ghostqa
         POSTGRES_USER: ghostqa_user
         POSTGRES_PASSWORD: your_password
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data

     redis:
       image: redis:7
       ports:
         - "6379:6379"

   volumes:
     postgres_data:
   ```

2. **Run with Docker**
   ```bash
   # Start services
   docker-compose up -d

   # Run migrations
   npx prisma migrate dev

   # Start application
   npm run dev
   ```

## 🌐 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel

   # Follow the prompts:
   # - Link to existing project? No
   # - Project name: ghostqa
   # - Directory: ./
   # - Override settings? No
   ```

3. **Set Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all variables from `.env.local`

4. **Redeploy**
   ```bash
   vercel --prod
   ```

### Netlify

1. **Build Command**
   ```bash
   npm run build
   ```

2. **Publish Directory**
   ```
   .next
   ```

3. **Environment Variables**
   - Add all variables from `.env.local` in Netlify dashboard

### Railway

1. **Connect GitHub Repository**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository

2. **Add PostgreSQL Service**
   - Add PostgreSQL database service
   - Copy connection string to `DATABASE_URL`

3. **Deploy**
   - Railway will automatically deploy on push to main branch

## 🔍 Troubleshooting

### Common Issues

#### 1. Database Connection Error

```bash
# Check if PostgreSQL is running
# Windows
net start postgresql

# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

#### 2. Playwright Browser Not Found

```bash
# Install browsers
npx playwright install

# Install system dependencies (Linux)
npx playwright install-deps
```

#### 3. OpenAI API Error

```bash
# Check API key
echo $OPENAI_API_KEY

# Test API connection
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
```

#### 4. Prisma Migration Issues

```bash
# Reset database
npx prisma migrate reset

# Generate client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

#### 5. Port Already in Use

```bash
# Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Logs and Debugging

#### 1. Enable Debug Logs

```bash
# Add to .env.local
DEBUG=prisma:*
NODE_ENV=development
```

#### 2. View Application Logs

```bash
# Development
npm run dev

# Production
npm start

# With PM2
pm2 start npm --name "ghostqa" -- start
pm2 logs ghostqa
```

#### 3. Database Logs

```bash
# Prisma Studio
npx prisma studio

# Direct database access
psql -U postgres -d ghostqa
```

## 📚 Additional Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Playwright Documentation](https://playwright.dev/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

### Community

- [GitHub Issues](https://github.com/akshat-mechlin/Ghost/issues)
- [Discord Community](https://discord.gg/ghostqa)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/ghostqa)

### Support

- **Email**: support@ghostqa.com
- **GitHub Issues**: Create an issue for bugs or feature requests
- **Documentation**: Check this setup guide and README.md

## 🎯 Next Steps

After successful setup:

1. **Explore the Dashboard** - Navigate through all features
2. **Add Your First Website** - Test the crawling functionality
3. **Generate Test Cases** - Use AI to create comprehensive tests
4. **Run Tests** - Execute automated browser tests
5. **Customize** - Modify test cases and add your own logic
6. **Deploy** - Set up production environment
7. **Scale** - Add more websites and test cases

## 🏆 Success Checklist

- [ ] Repository cloned successfully
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Database connected and migrated
- [ ] OpenAI API key working
- [ ] Application running on localhost:3000
- [ ] Website crawling functional
- [ ] AI test generation working
- [ ] Test execution successful
- [ ] Production deployment ready

---

**Happy Testing! 🚀**

For any issues or questions, please refer to the troubleshooting section or create an issue on GitHub.
