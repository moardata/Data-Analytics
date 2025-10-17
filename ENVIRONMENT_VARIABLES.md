# Environment Variables Guide

This document lists all required and optional environment variables for the Whop Analytics App.

## 🔐 Required Variables

### Supabase Configuration
Get these from your Supabase project: `https://supabase.com/dashboard/project/_/settings/api`

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### Whop Configuration
Get these from your Whop app dashboard: `https://whop.com/apps`

```bash
# Your Whop app ID
NEXT_PUBLIC_WHOP_APP_ID=your_whop_app_id_here

# Your Whop API key (keep this secret!)
WHOP_API_KEY=your_whop_api_key_here

# Webhook secret for validating incoming webhooks
WHOP_WEBHOOK_SECRET=your_whop_webhook_secret_here
```

### Whop Company & Agent User

```bash
# Your Whop company ID (format: biz_xxxxxxxxxxxxx)
NEXT_PUBLIC_WHOP_COMPANY_ID=biz_xxxxxxxxxxxxx

# Agent user ID for making API requests on behalf of your app
NEXT_PUBLIC_WHOP_AGENT_USER_ID=user_xxxxxxxxxxxxx
```

## 🧪 Development/Testing Variables

### Authentication Bypass (Development Only)

```bash
# Set to 'true' ONLY in local development to bypass Whop authentication
# ⚠️ WARNING: NEVER set this to 'true' in production!
BYPASS_WHOP_AUTH=false
```

**When to use this:**
- Local development when you can't run in the Whop iframe
- Testing database queries without Whop authentication
- Quick prototyping

**How to use:**
1. Set `BYPASS_WHOP_AUTH=true` in your `.env.local`
2. Access the app at `http://localhost:3000/analytics?companyId=your_company_id`
3. The app will skip Whop authentication and company access checks

**Important:**
- This should NEVER be enabled in production
- Vercel environment variables should have this set to `false` or omitted entirely

## 🤖 Optional: AI Features

### OpenAI Configuration
Only needed if you want to use AI-generated insights.

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

## 📋 Setup Checklist

- [ ] Created Supabase project and copied URL + Service Role Key
- [ ] Created Whop app and copied App ID + API Key + Webhook Secret
- [ ] Found your Whop company ID (format: `biz_xxxxxxxxxxxxx`)
- [ ] Created agent user and copied User ID
- [ ] Added all variables to `.env.local` for local development
- [ ] Added all variables to Vercel environment variables for production
- [ ] Verified `BYPASS_WHOP_AUTH` is set to `false` in production
- [ ] Tested app in Whop iframe to confirm authentication works

## 🚀 Deployment to Vercel

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add each variable from the "Required Variables" section
4. Do NOT add `BYPASS_WHOP_AUTH` (or set it to `false`)
5. Redeploy your app

## 🔍 Troubleshooting

### "SUPABASE_SERVICE_ROLE_KEY is required"
- Check that the variable is set in your environment (Vercel or `.env.local`)
- Make sure there are no typos in the variable name
- Verify the key is the "service_role" key, not the "anon" key

### "Whop user token not found"
- Make sure you're accessing the app through the Whop iframe
- Check that `NEXT_PUBLIC_WHOP_APP_ID` and `WHOP_API_KEY` are correct
- Verify your app has the required OAuth scopes in Whop settings

### "Authentication required"
- Ensure you're an admin of the company you're trying to access
- Check that the `companyId` in the URL matches your actual Whop company ID
- Verify all Whop environment variables are set correctly

