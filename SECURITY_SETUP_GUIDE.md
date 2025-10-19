# 🔒 Security Setup Guide

## ✅ How to Set Up Environment Variables Securely

This guide ensures you **never accidentally leak secrets** to GitHub or attackers.

---

## 🚨 The Golden Rules

1. ✅ **DO** use `.env.local` for local development
2. ✅ **DO** use Vercel dashboard for production secrets
3. ✅ **DO** commit `.env.example` (template with no real values)
4. ❌ **NEVER** commit `.env.local` to Git
5. ❌ **NEVER** put API keys directly in code
6. ❌ **NEVER** share your `.env.local` file

---

## 📋 Step-by-Step Secure Setup

### **STEP 1: Local Development (Your Computer)**

#### **A. Get Your Credentials**

**Whop Credentials:**
1. Go to https://whop.com/apps
2. Select your app
3. Go to **Settings** → **API Keys**
4. Copy your API key (starts with `whop_`)
5. Note your App ID (starts with `app_`)

**Supabase Credentials:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - Project URL
   - `anon public` key
   - `service_role` key (keep this extra secret!)

**OpenAI (Optional):**
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy it (starts with `sk-`)

#### **B. Update .env.local**

Open the file at:
```
/Users/tylermckenzie/Desktop/whop template/.env.local
```

Replace these values:
```bash
# Replace this:
WHOP_API_KEY=your_whop_api_key_here
# With your real key:
WHOP_API_KEY=whop_abc123xyz789...

# Replace this:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
# With your real URL:
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co

# Etc...
```

#### **C. Verify It's Secure**

Run this command to confirm `.env.local` won't be committed:
```bash
git status
```

You should **NOT** see `.env.local` in the list. ✅

---

### **STEP 2: Production (Vercel)**

#### **A. Add Environment Variables to Vercel**

1. Go to https://vercel.com/your-username/your-project
2. Click **Settings** → **Environment Variables**
3. Add each variable:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_WHOP_APP_ID` | `app_qMCiZm0xUewsGe` | Production, Preview, Development |
| `WHOP_API_KEY` | `whop_your_real_key` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | Production, Preview, Development |
| `OPENAI_API_KEY` | `sk-your_key` (optional) | Production, Preview, Development |
| `WHOP_WEBHOOK_SECRET` | Your webhook secret | Production, Preview, Development |

4. Click **Save**
5. Redeploy your app (Vercel → Deployments → Redeploy)

---

## 🔍 Security Checklist

Before you commit code, verify:

- [ ] `.env.local` is in `.gitignore` ✅ (already done)
- [ ] `.env.local` has your real credentials
- [ ] `.env.example` only has placeholder values
- [ ] Run `git status` - `.env.local` should NOT appear
- [ ] Never put API keys in code files
- [ ] Vercel has all environment variables set
- [ ] Vercel deployment succeeded

---

## ⚠️ What If I Accidentally Commit a Secret?

**If you accidentally commit `.env.local` or an API key:**

### **Immediate Actions:**

1. **Rotate ALL keys immediately:**
   - Whop: Create new API key, delete old one
   - Supabase: Reset service role key
   - OpenAI: Create new key, delete old one

2. **Remove from Git history:**
   ```bash
   # Contact us for help - don't do this alone!
   # Git history removal is complex
   ```

3. **Notify team members** if applicable

4. **Check for unauthorized usage:**
   - Whop dashboard → Usage
   - Supabase dashboard → Database activity
   - OpenAI dashboard → Usage

---

## 🎯 Quick Reference

### **Files and Their Purpose:**

| File | Purpose | Commit to Git? |
|------|---------|----------------|
| `.env.local` | Your real secrets (local dev) | ❌ NEVER |
| `.env.example` | Template with placeholders | ✅ YES |
| `.gitignore` | Tells git to ignore `.env.local` | ✅ YES |
| Code files (`.ts`, `.tsx`) | Your application code | ✅ YES |

### **Where Secrets Live:**

| Environment | Where Secrets Are Stored |
|-------------|-------------------------|
| **Local Development** | `.env.local` on your computer |
| **Production** | Vercel dashboard → Environment Variables |
| **GitHub** | NOWHERE - secrets never go here! |

---

## 🚀 Testing Your Setup

### **Test Local:**
```bash
# Start dev server
npm run dev

# Visit:
http://localhost:3000/analytics?companyId=biz_3GYHNPbGkZCEky

# Should see: No errors, dashboard loads
```

### **Test Production:**
```bash
# After Vercel deployment
# Visit: https://your-app.vercel.app/analytics?companyId=biz_3GYHNPbGkZCEky

# Should see: Dashboard loads with your company data
```

---

## 📞 If Something Goes Wrong

### **Error: "appId is required"**
- ✅ Check `.env.local` has `NEXT_PUBLIC_WHOP_APP_ID`
- ✅ Restart dev server after adding variables

### **Error: "Cannot connect to database"**
- ✅ Check Supabase URL and keys are correct
- ✅ Check Supabase project is not paused

### **Deployment fails on Vercel**
- ✅ Check all environment variables are set in Vercel dashboard
- ✅ Redeploy after adding variables

---

## ✅ You're Secure When:

- ✅ `.env.local` exists and has real values
- ✅ `.env.local` is NOT in `git status`
- ✅ `.env.example` is committed (safe template)
- ✅ Vercel has all variables set
- ✅ App works locally and in production
- ✅ No secrets in code files

---

**Your secrets are now safe! 🔒**

