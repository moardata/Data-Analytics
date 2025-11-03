# Quick Testing Guide - Owner Authentication

## 🚀 How to Test Right Now

### 1. Pull Latest Code
```bash
git pull
```

### 2. Deploy/Restart Your App
The changes are server-side, so you need to:
- **Vercel/Production:** Push to trigger deployment
- **Local Dev:** Restart your dev server

### 3. Open Browser Console
- **Chrome/Edge:** F12 or Cmd+Option+I
- **Firefox:** F12 or Cmd+Option+K
- **Safari:** Cmd+Option+C

### 4. Navigate to Your App
Go to your Whop app in a browser where you're logged into Whop.

### 5. Look for This Output

#### ✅ Good - Working Correctly
```
🔬 [WhopClientAuth] Full diagnostics: {
  checks: {
    hasUserToken: true,
    companyId: "biz_XXX",
    whopClientConfigured: true,
    appId: "SET",
    apiKey: "SET"
  },
  jwt: {
    valid: true,
    hasUserId: true,
    expired: false
  },
  accessCheck: {
    success: true,
    accessLevel: "admin",
    isOwner: true
  }
}

🎯 [Check Owner] Result: OWNER (access_level: admin)
```

#### ❌ Problem - Auth Failing
```
🔬 [WhopClientAuth] Full diagnostics: {
  ...
  accessCheck: {
    success: false,
    error: "Some error message here"
  }
}

❌ [Check Owner] Access check failed: [error details]
```

---

## 🔍 What Each Field Means

### `hasUserToken`
- `true` → Whop is sending authentication
- `false` → **PROBLEM:** Whop isn't authenticating your app

### `jwt.valid`
- `true` → Token can be decoded
- `false` → **PROBLEM:** Token is malformed

### `jwt.expired`
- `false` → Token is still valid
- `true` → **PROBLEM:** Token expired, refresh page

### `accessCheck.success`
- `true` → Whop API call succeeded
- `false` → **PROBLEM:** See `accessCheck.error` for details

### `accessLevel`
- `"admin"` → You're the owner
- `"customer"` → You're a student/member
- `"no_access"` → No access to this company

---

## 📋 Copy This for Support

If you're still having issues, copy and paste this info:

```
Company ID: [from URL or logs]
Expected Role: [owner/student]
Actual Role Shown: [owner/student]

Diagnostic Output:
[Paste the full 🔬 diagnostic output]

Check Owner Result:
[Paste the 🎯 result]

Any Errors:
[Paste any ❌ error messages]
```

---

## 🐛 Common Issues & Fixes

### Issue: "No company ID provided"
**Symptom:** App shows blank or loading forever  
**Check:** Is `companyId` in the URL? Like `?companyId=biz_XXX`  
**Fix:** Make sure you're accessing the app through Whop's interface

### Issue: "hasUserToken: false"
**Symptom:** No Whop authentication headers  
**Check:** Are you accessing through Whop's app store interface?  
**Fix:** Access the app from within Whop, not directly via URL

### Issue: "accessCheck.success: false"
**Symptom:** Whop API call failing  
**Check:** Look at `accessCheck.error` for the reason  
**Possible causes:**
- Wrong API key
- Wrong app ID
- API rate limit
- Network issue

### Issue: "accessLevel: customer" but you're the owner
**Symptom:** You own the company but API says you're a customer  
**Possible causes:**
- Testing with a different account
- Need to refresh Whop's token
- Company ownership changed
**Fix:** Try logging out of Whop and back in

---

## 🎯 Expected Behavior

| Your Role | Environment | Auth Fails? | What You See |
|-----------|------------|-------------|--------------|
| Owner | Production | ❌ No | Owner Dashboard |
| Owner | Production | ✅ Yes | Student View (safe fallback) |
| Owner | Development | ❌ No | Owner Dashboard |
| Owner | Development | ✅ Yes | Owner Dashboard (dev bypass) |
| Student | Production | ❌ No | Student View |
| Student | Production | ✅ Yes | Student View |
| Student | Development | ❌ No | Student View |
| Student | Development | ✅ Yes | Owner Dashboard (dev bypass) |

**Note:** Development mode (`NODE_ENV=development`) will grant owner access when auth fails to make testing easier.

---

## 🔧 Environment Variables to Check

Make sure these are set correctly:

```bash
# In .env.local or Vercel environment variables

NEXT_PUBLIC_WHOP_APP_ID=app_xxxxx
WHOP_API_KEY=whop_xxxxx
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

All five are required for proper authentication!

---

## 📞 Ready to Debug?

Run these commands in your browser console:

```javascript
// Check if Whop is sending headers
fetch('/api/debug/headers').then(r => r.json()).then(console.log)

// Run full diagnostics (replace with your company ID)
fetch('/api/auth/diagnose?companyId=biz_XXX').then(r => r.json()).then(console.log)

// Check owner status directly
fetch('/api/auth/check-owner?companyId=biz_XXX').then(r => r.json()).then(console.log)
```

Share the output of all three!

