# Experience ID vs Company ID - Explained

## 🤔 Your Question

> "Why does `biz_Jkhjc11f6HHRxh` have access? Aren't you identifying from the experience ID?"

Great question! Here's the full explanation.

---

## 🆔 What Are These IDs?

### Company IDs
- Format: `biz_XXXXXXXXXXXX`
- Represents: A Whop company/creator account
- **`biz_3GYHNPbGkZCEky`** → Your dev company ("Creative Skills Hub")
- **`biz_Jkhjc11f6HHRxh`** → Test company ("TechEd Academy") used in mock data scripts

### Experience IDs
- Format: `exp_XXXXXXXXXXXX`
- Represents: A specific app/experience within a company
- **`exp_2BXhmdlqcnLGc5`** → Your experience that maps to `biz_3GYHNPbGkZCEky`

---

## 🔄 How The App Works (Both Are Supported!)

### Method 1: Direct Company ID (Development)
```
URL: ?companyId=biz_3GYHNPbGkZCEky
```
- Simple, direct access
- Used for local development
- Used in test scripts

### Method 2: Experience ID (Production - Whop Platform)
```
URL: ?experienceId=exp_2BXhmdlqcnLGc5
```
- Proper Whop platform method
- App automatically converts: `experienceId` → `companyId`
- More secure, proper for production

---

## 🔍 The Conversion Flow

When a user accesses via experience ID:

```
1. User URL: ?experienceId=exp_2BXhmdlqcnLGc5

2. App calls: /api/experiences/exp_2BXhmdlqcnLGc5/access

3. API fetches: whopClient.experiences.retrieve(experienceId)

4. Extracts: companyId = experience.company.id
   Result: biz_3GYHNPbGkZCEky

5. App uses companyId internally for everything
```

**See the code:**
- `lib/hooks/useWhopAuth.ts` - Lines 67-82 (experience → company conversion)
- `app/api/experiences/[experienceId]/access/route.ts` - The API that does the mapping

---

## 🛠️ Why Was `biz_Jkhjc11f6HHRxh` in the Bypass?

I found it **hardcoded throughout your codebase** in:
- All mock data generation scripts (`scripts/simulate-realistic-data.js`)
- Test dashboard scripts
- Webhook simulators
- Mock data summaries

It's the **second test company** used for multi-tenant testing. I included it in the dev bypass to keep all your existing test scripts working without modifications.

**But you don't need it!** I've just removed it from the bypass.

---

## ✅ What Changed (Just Now)

### Before:
```typescript
const DEV_COMPANY_IDS = ['biz_3GYHNPbGkZCEky', 'biz_Jkhjc11f6HHRxh'];
```
- Both test companies had full access bypass

### After:
```typescript
const DEV_COMPANY_IDS = ['biz_3GYHNPbGkZCEky']; // Only your dev company
```
- Only YOUR company has bypass
- Test company will follow normal tier rules

---

## 🎯 Recommended Setup

### For Local Development:
```
http://localhost:3000/analytics?companyId=biz_3GYHNPbGkZCEky
```

### For Production (Whop Platform):
```
http://your-app.vercel.app?experienceId=exp_2BXhmdlqcnLGc5
```
(Whop will automatically provide this when users access through their platform)

### Add Your Experience ID Mapping:

In `app/api/auth/permissions/route.ts`:
```typescript
const experienceToCompanyMap: Record<string, string> = {
  'exp_2BXhmdlqcnLGc5': 'biz_3GYHNPbGkZCEky', // Already there!
  // Add more as you create more experiences
};
```

---

## 🧪 Testing Both Methods

### Test with Company ID:
```bash
curl "http://localhost:3000/api/usage/check?companyId=biz_3GYHNPbGkZCEky"
```

### Test with Experience ID:
```bash
curl "http://localhost:3000/api/experiences/exp_2BXhmdlqcnLGc5/access"
# Should return companyId in response
```

---

## 📝 Summary

| Question | Answer |
|----------|--------|
| **Why did biz_Jkhjc11f6HHRxh have access?** | It's a test company used in your mock data scripts. I included it in the bypass by mistake. |
| **Should you use experience IDs?** | **Yes, for production!** Your app already supports it. |
| **Does the app convert experienceId → companyId?** | **Yes!** It's fully implemented. |
| **What's the primary identifier internally?** | **Company ID** - Experience IDs get converted to company IDs. |
| **Is the test company still whitelisted?** | **No** - I just removed it. Only your dev company is whitelisted now. |

---

## 🚀 Next Steps

1. ✅ Test company removed from bypass
2. ✅ Your company (`biz_3GYHNPbGkZCEky`) still has full access
3. ✅ Experience ID → Company ID conversion already working
4. 🎯 When deploying to Whop, use experience IDs
5. 🎯 Add more experience mappings as you create more Whop experiences

---

**Bottom Line:** Your app is properly set up to use both methods. Experience IDs are the "proper" way for production on Whop's platform, and your app already handles the conversion automatically! 🎉






