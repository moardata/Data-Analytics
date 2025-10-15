# Whop Creator Analytics

Modern analytics dashboard for Whop course creators to track students, revenue, engagement, and get AI-driven insights.

## ✅ What's Working

- **Dashboard** - Real-time metrics and charts
- **AI Insights** - Automated recommendations (OpenAI powered)
- **Custom Forms** - Collect student feedback
- **Revenue Tracking** - Monitor earnings
- **Student Management** - View all learners
- **Data Export** - CSV and PDF exports
- **Webhooks** - Auto-sync with Whop events
- **Multi-Tenancy** - Each company gets isolated data

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create `.env.local`:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Whop
NEXT_PUBLIC_WHOP_APP_ID=your_app_id
WHOP_API_KEY=your_api_key
WHOP_WEBHOOK_SECRET=your_webhook_secret

# OpenAI (optional)
OPENAI_API_KEY=sk-proj-your-key

# Session
JWT_SECRET=random-secret-key-here
```

### 3. Set Up Database
Run in Supabase SQL Editor:
1. `database/schema.sql` - Main tables
2. `database/schema-ai-simple.sql` - AI tables
3. `database/seed.sql` - Test data (optional)

### 4. Run Development Server
```bash
npm run dev
```

Open http://localhost:3000/analytics

## 📦 Deploy to Vercel

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

Then update Whop dashboard:
- **Base URL:** `https://your-app.vercel.app`
- **Dashboard Path:** `/dashboard/[companyId]`
- **Webhook URL:** `https://your-app.vercel.app/api/webhooks`

## 🎯 How Multi-Tenancy Works

When a company accesses your app through Whop:
1. Whop sends them to `/dashboard/[companyId]`
2. App redirects to `/analytics?companyId=xyz`
3. All pages filter data by that companyId
4. Each company sees only their own data

## 🗂️ Project Structure

```
app/
├── analytics/      # Main dashboard
├── insights/       # AI insights
├── forms/          # Form builder
├── students/       # Student list
├── revenue/        # Revenue tracking
└── api/
    ├── analytics/  # Metrics calculation
    ├── insights/   # AI generation
    ├── webhooks/   # Whop events
    └── export/     # CSV/PDF exports

components/
├── DashboardCreatorAnalytics.tsx  # Main dashboard
├── AIInsightsGrid.tsx             # Insights display
└── FormBuilderEnhanced.tsx        # Form creator

lib/
├── supabase.ts         # Database client
├── whop-sdk.ts         # Whop API
├── ai/openai-*.ts      # AI integration
└── utils/              # Helpers
```

## 📊 Features

### Analytics Dashboard
- Active students count
- Engagement rate %
- Revenue tracking
- Completion rate
- Sentiment analysis
- Interactive charts

### AI Insights
- Weekly performance summaries
- Actionable recommendations
- Alerts for issues
- Trend detection

### Forms System
- Custom form builder
- Multiple field types
- Response tracking
- CSV export

### Data Export
- Events, subscriptions, students → CSV
- Full dashboard → PDF

## 🔧 Tech Stack

- Next.js 15.3
- React 19
- Supabase (PostgreSQL)
- Whop SDK
- OpenAI API
- Tailwind CSS v4
- Recharts

## 📞 Support

- Whop Docs: https://dev.whop.com
- Supabase Docs: https://supabase.com/docs

## 📄 License

MIT
