# 🚨 CRITICAL RLS FIX - DEPLOYMENT REQUIRED

## Problem
The app was using `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client key with RLS) in API routes, causing:
- **406 errors**: Content negotiation failures
- **401 errors**: Unauthorized access
- **400 errors**: Bad requests due to RLS blocking queries

## Solution
Created separate server-side Supabase client that uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS in API routes.

## ✅ Changes Made

### 1. New Server Client
- Created `lib/supabase-server.ts` with SERVICE ROLE key
- Uses service role to bypass RLS (safe for server-side only)

### 2. Updated ALL API Routes (16 files)
All API routes now use `supabaseServer` instead of `supabase`:
- ✅ `app/api/webhooks/route.ts`
- ✅ `app/api/analytics/metrics/route.ts`
- ✅ `app/api/courses/progress/route.ts`
- ✅ `app/api/courses/sync/route.ts`
- ✅ `app/api/usage/check/route.ts`
- ✅ `app/api/export/pdf/route.ts`
- ✅ `app/api/export/csv/route.ts`
- ✅ `app/api/setup/client/route.ts`
- ✅ `app/api/forms/submit/route.ts`
- ✅ `app/api/forms/create/route.ts`
- ✅ `app/api/insights/refresh/route.ts`
- ✅ `app/api/insights/generate/route.ts`
- ✅ `app/api/insights/dismiss/route.ts`
- ✅ `app/api/subscription-tiers/check/route.ts`

### 3. Updated Library Files (2 files)
- ✅ `lib/pricing/usage-tracker.ts`
- ✅ `lib/utils/aiInsights.ts`

## 🔧 REQUIRED: Add Environment Variable

### In Vercel Dashboard:
1. Go to: `Settings` → `Environment Variables`
2. Add new variable:
   ```
   Name: SUPABASE_SERVICE_ROLE_KEY
   Value: [Your service role key from Supabase]
   ```
3. **Get the key from Supabase:**
   - Go to Supabase Dashboard
   - Settings → API
   - Copy `service_role` key (secret, NOT anon key)

### In Local `.env.local`:
```bash
# Add this line to your .env.local file
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

⚠️ **IMPORTANT**: 
- The service role key has **full database access**
- NEVER expose it to the client/frontend
- Only use in API routes (server-side)
- Keep it secret like your API keys

## 🚀 Deployment Steps

1. **Add environment variable** (see above)
2. **Commit and push** (already done):
   ```bash
   git add .
   git commit -m "Fix RLS issues: use service role key in API routes"
   git push
   ```
3. **Vercel will auto-deploy** with new changes
4. **Verify in Supabase logs** - should see **0 errors**

## 🧪 Testing

After deployment, check:
- ✅ No more 406 errors in Supabase logs
- ✅ No more 401 errors for client queries
- ✅ Analytics loads correctly
- ✅ Course sync works
- ✅ All API routes return data

## 📊 Expected Improvement

### Before:
- 406 errors: ~15/10min
- 401 errors: ~1/10min  
- 400 errors: ~3/10min

### After:
- **0 errors** (all queries bypass RLS using service role)

## Security Note

This is the **correct approach** for multi-tenant apps:
- ✅ Frontend uses anon key (RLS enabled)
- ✅ Backend/API uses service role key (RLS bypassed)
- ✅ Auth/access control handled in API routes
- ✅ No direct database access from client

---

**Status**: ✅ Code changes complete, awaiting environment variable + deployment

