# Safe Environment Configuration Template

## Copy this to `.env.local` in your project root

```env
# =============================================================================
# WHOP CONFIGURATION
# =============================================================================
# Get these from: https://whop.com/apps -> Your App -> Settings

# Your Whop App ID (safe to expose in client-side)
NEXT_PUBLIC_WHOP_APP_ID=app_xxxxxxxxxxxxx

# Your Whop API Key (KEEP SECRET - server-side only)
WHOP_API_KEY=your-whop-api-key-here

# Agent User ID for API requests (safe to expose)
NEXT_PUBLIC_WHOP_AGENT_USER_ID=user_xxxxxxxxxxxxx

# Default Company ID for local testing (safe to expose)
NEXT_PUBLIC_WHOP_COMPANY_ID=biz_xxxxxxxxxxxxx

# Webhook Secret (KEEP SECRET - for webhook verification)
WHOP_WEBHOOK_SECRET=ws_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# =============================================================================
# SUPABASE CONFIGURATION
# =============================================================================
# Get these from: https://supabase.com -> Your Project -> Settings -> API

# Supabase Project URL (safe to expose)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Supabase Anon Key (safe to expose - for client-side queries)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Supabase Service Role Key (KEEP SECRET - server-side only, full database access)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# =============================================================================
# OPENAI CONFIGURATION (Optional - for AI insights)
# =============================================================================

# OpenAI API Key (KEEP SECRET - server-side only)
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your-openai-key-here

# =============================================================================
# DEVELOPMENT SETTINGS
# =============================================================================

# Auth Bypass for Local Testing (NEVER set to 'true' in production!)
# Only works when NODE_ENV=development
BYPASS_WHOP_AUTH=false

# Production App URL
NEXT_PUBLIC_APP_URL=https://data-analytics-gold.vercel.app

# =============================================================================
# SECURITY NOTES
# =============================================================================
# ✅ NEXT_PUBLIC_* variables are exposed to the browser - only use for public data
# ❌ Variables without NEXT_PUBLIC_ are server-only - use for secrets
# 🔒 NEVER commit .env.local to git (it's in .gitignore)
# 🚫 NEVER set BYPASS_WHOP_AUTH=true in production
# 🔐 Rotate your API keys regularly
# 📝 Use different keys for development and production environments
```

## How to Use

1. **Copy this entire file's contents**
2. **Create a file named `.env.local`** in your project root (same level as package.json)
3. **Paste the contents**
4. **Verify your keys are correct**

The file is already in `.gitignore` so it won't be committed to git.

## Vercel Deployment

For production on Vercel, add these same variables in:
**Vercel Dashboard → Your Project → Settings → Environment Variables**

Make sure to select the appropriate environment (Production/Preview/Development) for each variable.

