# 🚀 COMPLETE SETUP GUIDE - Whop Creator Analytics

## ⚠️ CRITICAL: This guide will make your app fully functional with real multi-tenancy

### Step 1: Database Setup (REQUIRED)

1. **Go to your Supabase project dashboard**
2. **Open the SQL Editor**
3. **Run this ENTIRE file**: `database/complete-working-schema.sql`
4. **Then run this file**: `database/rls-functions.sql`

```sql
-- This creates ALL tables the code actually needs:
-- ✅ Main tables: clients, entities, events, subscriptions, insights, form_templates, form_submissions
-- ✅ AI tables: ai_runs, ai_text_pool  
-- ✅ Proper RLS policies for multi-tenancy
-- ✅ All indexes for performance
```

### Step 2: Environment Variables (REQUIRED)

Create `.env.local` in your project root:

```bash
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Whop (REQUIRED)
NEXT_PUBLIC_WHOP_APP_ID=your_whop_app_id
WHOP_API_KEY=your_whop_api_key
WHOP_WEBHOOK_SECRET=your_whop_webhook_secret

# OpenAI (OPTIONAL - for real AI insights)
OPENAI_API_KEY=sk-proj-your-openai-key

# JWT Secret (REQUIRED)
JWT_SECRET=your-random-secret-key-here
```

### Step 3: Whop App Configuration (REQUIRED)

1. **In your Whop app dashboard**, set these URLs:
   - **Redirect URI**: `https://your-domain.com/auth/whop/callback`
   - **Webhook URL**: `https://your-domain.com/api/webhooks`

2. **Enable these scopes**:
   - `read:users`
   - `read:companies` 
   - `read:memberships`

### Step 4: Test the Setup

1. **Start your app**: `npm run dev`
2. **Go to**: `http://localhost:3000/auth/login`
3. **Click "Continue with Whop"**
4. **Complete OAuth flow**
5. **You should be redirected to**: `/dashboard/[companyId]`

### Step 5: Verify Multi-Tenancy

1. **Create a test client** (if needed):
```bash
curl -X POST http://localhost:3000/api/setup/client \
  -H "Content-Type: application/json" \
  -H "x-whop-company-id: test-company-123" \
  -H "x-whop-user-id: test-user-456"
```

2. **Test data isolation**:
   - Each company should only see their own data
   - RLS policies prevent cross-company access

## 🔧 What This Fixes

### ✅ **Multi-Tenancy**
- **Before**: All users saw same data (hardcoded fallbacks)
- **After**: Each company gets isolated data via proper OAuth + RLS

### ✅ **AI Insights**
- **Before**: Failed silently due to missing `ai_runs` and `ai_text_pool` tables
- **After**: Works with real OpenAI integration OR graceful fallbacks

### ✅ **Authentication**
- **Before**: No real auth flow
- **After**: Complete OAuth flow with proper session management

### ✅ **Database Schema**
- **Before**: Missing tables caused errors
- **After**: All tables exist with proper relationships and indexes

## 🎯 Expected Behavior After Setup

1. **User visits**: `/auth/login`
2. **Clicks**: "Continue with Whop" 
3. **Completes**: OAuth flow
4. **Gets redirected**: `/dashboard/[companyId]`
5. **Sees**: Only their company's data
6. **Can generate**: Real AI insights from their form data
7. **All data**: Isolated by company via RLS policies

## 🚨 Troubleshooting

### "Missing Whop auth headers" error
- **Cause**: Not coming from Whop OAuth flow
- **Fix**: Make sure you're going through `/auth/login` first

### "Table doesn't exist" errors
- **Cause**: Didn't run the SQL schema files
- **Fix**: Run both `complete-working-schema.sql` and `rls-functions.sql`

### AI insights not generating
- **Cause**: No form submissions to analyze
- **Fix**: Create some forms and submit test data first

### Data mixing between companies
- **Cause**: RLS not working properly
- **Fix**: Check that `rls-functions.sql` was run and user context is set

## 📊 Verification Checklist

- [ ] Database schema created (all tables exist)
- [ ] RLS functions installed
- [ ] Environment variables set
- [ ] Whop app configured with correct URLs
- [ ] OAuth flow works end-to-end
- [ ] Each company sees only their data
- [ ] AI insights generate (even if stub data)
- [ ] Form submissions work
- [ ] Dashboard shows real metrics

## 🎉 Success!

If all steps complete successfully, you now have:
- ✅ **Fully functional multi-tenant analytics app**
- ✅ **Real Whop OAuth authentication**
- ✅ **Working AI insights system**
- ✅ **Proper data isolation**
- ✅ **Production-ready database schema**

Your app is now ready for real Whop creators to use!

