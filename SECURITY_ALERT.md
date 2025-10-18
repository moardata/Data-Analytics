# 🚨 SECURITY ALERT - ACTION REQUIRED

## Exposed Credentials Detected and Removed

During cleanup, we found **exposed API keys and secrets** in several files. These have been sanitized, but you **MUST rotate these keys immediately** since they may have been exposed in git history.

---

## ⚠️ ROTATE THESE KEYS NOW:

### 1. **Whop API Key**
- Go to: https://whop.com/apps → Your App → Settings
- Generate a NEW API key
- Update in Vercel: `WHOP_API_KEY`

### 2. **Whop Webhook Secret** 
- Go to: https://whop.com/apps → Your App → Webhooks
- Regenerate webhook secret
- Update in Vercel: `WHOP_WEBHOOK_SECRET`

### 3. **Supabase Service Role Key**
- Go to: https://supabase.com → Your Project → Settings → API
- **Reset** the service role key
- Update in Vercel: `SUPABASE_SERVICE_ROLE_KEY`

---

## Files That Were Cleaned:

### Deleted (had real credentials):
- ✅ `env.local.txt`
- ✅ `TROUBLESHOOTING.md`
- ✅ `COMPANY_CONTEXT_FIX.md`
- ✅ `scripts/list-companies.js`

### Sanitized (removed hardcoded fallbacks):
- ✅ `SAFE_ENV_TEMPLATE.md` - Now has placeholders only
- ✅ `lib/supabase-server.ts` - Removed hardcoded key fallback
- ✅ `lib/env-config.ts` - Removed hardcoded key fallback

---

## Files That Are Still Safe:

These files are from previous commits and were NOT created/modified by us:
- `README.md` - Only has placeholder examples
- Database schema files - No actual credentials
- Other documentation - Uses placeholder text

---

## Next Steps (CRITICAL):

### 1. Rotate All Keys (Do This First!)
```bash
# 1. Rotate Whop API Key at: https://whop.com/apps
# 2. Rotate Webhook Secret at: https://whop.com/apps → Webhooks
# 3. Reset Supabase Key at: https://supabase.com → Settings → API
```

### 2. Update Vercel Environment Variables
```bash
# Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
# Update these with your NEW keys:
- WHOP_API_KEY=<new-key>
- WHOP_WEBHOOK_SECRET=<new-secret>  
- SUPABASE_SERVICE_ROLE_KEY=<new-key>
```

### 3. Redeploy
```bash
# Trigger a new deployment so Vercel uses the new keys
vercel --prod
```

### 4. Commit the Cleaned Code
```bash
git add .
git commit -m "security: remove exposed credentials, sanitize hardcoded keys"
git push
```

---

## Why This Happened:

- Template files were created with actual values instead of placeholders
- Code files had hardcoded credentials as "fallbacks"
- The old `env.local.txt` was committed with real keys

---

## Prevention for Future:

✅ **Never commit credentials to git**
✅ **Use placeholders in templates (xxx... format)**
✅ **No hardcoded keys in code - throw errors instead**
✅ **All secrets must come from environment variables**
✅ **Add sensitive files to .gitignore**

---

## After You Rotate Keys:

Once you've rotated all keys and updated Vercel:

1. Delete this file: `SECURITY_ALERT.md`
2. Test that the app works with new keys
3. Monitor for any unauthorized API usage
4. Consider enabling 2FA on Whop and Supabase accounts

---

**This is NOT optional. Rotate the keys NOW before pushing to production.**

The old keys are potentially exposed in:
- Git history  
- Any local copies
- Your terminal history (if you copied/pasted them)

Even though we cleaned the files, anyone with access to the git history could potentially find them.

---

*Created: October 18, 2025*
*Priority: CRITICAL - Do not deploy until keys are rotated*

