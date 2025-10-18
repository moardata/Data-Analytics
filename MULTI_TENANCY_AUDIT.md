# 🚨 MULTI-TENANCY SECURITY AUDIT - CRITICAL ISSUES FOUND

## Executive Summary

**Status:** 🔴 **CRITICAL SECURITY VULNERABILITIES FOUND**

Your app has **severe multi-tenant security holes** that allow ANY user to access ANY company's data by simply changing the URL parameter.

---

## 🔴 CRITICAL ISSUE #1: Client-Passed Tenant ID Trusted

### The Problem

**Multiple API endpoints accept `companyId` from the client (URL parameter) and use it directly without server-side validation.**

###Files Affected:

1. `/app/api/forms/submit/route.ts` (GET endpoint) - Lines 84-99
2. `/app/api/export/csv/route.ts` - Line 12
3. `/app/api/export/pdf/route.ts` - Line 12

### Example Vulnerability:

```typescript
// app/api/forms/submit/route.ts Line 84
const companyId = searchParams.get('companyId') || searchParams.get('clientId');

// NO VALIDATION - Any user can pass ANY company ID!
// Attacker can do: /api/forms/submit?companyId=ANY_COMPANY_ID
```

### Impact

- ❌ **Complete data breach** - Users can access ANY company's form submissions
- ❌ **Complete data breach** - Users can export ANY company's data (CSV/PDF)
- ❌ **Zero authentication** on these endpoints

### Proof of Exploit

```bash
# Attacker can view Company A's form submissions:
GET /api/forms/submit?companyId=biz_CompanyA

# Then switch to Company B's data:
GET /api/forms/submit?companyId=biz_CompanyB

# Export any company's data:
GET /api/export/csv?companyId=biz_AnyCompany&type=events
```

---

## 🟡 ISSUE #2: RLS Policies Not Being Used

### The Problem

**Your database has RLS (Row Level Security) policies defined, but your application code NEVER sets the required session variables.**

### What You Have:

- ✅ RLS policies defined in `database/02-rls-policies.sql`
- ✅ Helper function `set_user_context(user_id, client_id)` exists

### What's Missing:

- ❌ **No code actually CALLS `set_user_context()`**
- ❌ RLS policies are effectively **DISABLED** because session variables are never set
- ❌ Using `supabaseServer` with service role key **BYPASSES RLS entirely**

### Impact

RLS is supposed to be your safety net, but it's not active. Your app relies 100% on application-level filtering.

---

## 🟡 ISSUE #3: Hard-Coded Fallback Company IDs

### The Problem

**Multiple pages have hard-coded fallback company IDs that will expose test/demo data.**

### Files Affected:

```typescript
// app/setup/page.tsx Line 14
const companyId = searchParams.get('companyId') || 'biz_3GYHNPbGkZCEky';

// app/courses/page.tsx Line 18
const companyId = searchParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;

// app/students/page.tsx Line 19
const clientId = searchParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;

// app/forms/page.tsx Line 23
const clientId = searchParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;

// app/insights/page.tsx Line 29
const clientId = searchParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;

// app/revenue/page.tsx Line 16
const clientId = searchParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;

// app/upgrade/page.tsx Line 27
const clientId = searchParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
```

### Impact

- Users accessing without `?companyId=` will see the same company's data
- Creates a "default tenant" that leaks data
- If `NEXT_PUBLIC_WHOP_COMPANY_ID` is set, ALL users see that company's data

---

## 🟡 ISSUE #4: No Cache Key Tenanting

### The Problem

No caching implementation found, but if you add caching later without including `companyId` in keys, you'll have cross-tenant data leakage.

---

## ✅ GOOD: What's Working

1. ✅ **Most API routes use `requireAdminAccess()`** which does validate
2. ✅ **Database queries include `.eq('client_id', clientId)`** - proper filtering
3. ✅ **Webhooks properly extract company_id from Whop events**
4. ✅ **RLS policies ARE defined** (just not being used)
5. ✅ **Schema has proper `client_id` columns everywhere**
6. ✅ **No global analytics sink** - all events are scoped to client_id

---

## 🔧 REQUIRED FIXES (Priority Order)

### FIX #1: Secure the Vulnerable Endpoints (CRITICAL)

**These endpoints MUST require authentication:**

```typescript
// app/api/forms/submit/route.ts - GET endpoint
// app/api/export/csv/route.ts
// app/api/export/pdf/route.ts
```

**Change from:**
```typescript
const companyId = searchParams.get('companyId');
```

**To:**
```typescript
const auth = await requireAdminAccess({ request });
const companyId = auth.companyId; // Server-validated, not client-passed
```

### FIX #2: Remove All Hard-Coded Fallbacks

**All frontend pages should:**

```typescript
// BAD:
const companyId = searchParams.get('companyId') || 'biz_3GYHNPbGkZCEky';

// GOOD:
const { companyId, hasCompanyAccess } = useWhopAuth();
if (!hasCompanyAccess) return <AccessDenied />;
```

### FIX #3: Enable RLS (Optional but Recommended)

Add to every API route that uses Supabase:

```typescript
// At the start of the request handler
await supabase.rpc('set_user_context', {
  user_id: auth.userId,
  client_id: clientUUID
});
```

This makes RLS your second line of defense.

### FIX #4: Add Server-Side Validation Everywhere

**Rule:** NEVER trust `?companyId=` from the client.

**Always:**
1. Get `companyId` from Whop authentication context (server-side)
2. Validate user has access to that company
3. Use that validated `companyId` in queries

---

## 🧪 TESTING PLAN

### Test 1: Cross-Tenant Data Access

```bash
# As Company A user, try to access Company B's data:
curl "https://your-app.com/api/forms/submit?companyId=biz_CompanyB"

# Expected: 403 Forbidden or authentication error
# Actual (CURRENT): Returns Company B's data ❌
```

### Test 2: Missing Company ID

```bash
# Access API without companyId parameter:
curl "https://your-app.com/api/export/csv?type=events"

# Expected: 400 Bad Request or redirect
# Actual: Depends on fallbacks
```

### Test 3: Hard-Coded Fallback

```bash
# Access frontend pages without ?companyId=:
https://your-app.com/students

# Expected: Error or redirect to login
# Actual (CURRENT): Shows default company data ❌
```

---

## 📊 RISK ASSESSMENT

| Issue | Severity | Exploitability | Impact | Priority |
|-------|----------|----------------|--------|----------|
| Client-passed tenant trusted | 🔴 CRITICAL | Easy | Complete data breach | **P0 - Fix Now** |
| RLS not enabled | 🟡 HIGH | N/A | No safety net | P1 |
| Hard-coded fallbacks | 🟡 MEDIUM | Easy | Data leakage | P1 |
| No cache tenanting | 🟢 LOW | N/A | Future risk | P2 |

---

## ✅ WHAT TO DO NOW

1. **Immediately fix the 3 vulnerable API endpoints** (forms/submit GET, export/csv, export/pdf)
2. **Remove all hard-coded fallback company IDs** from frontend pages
3. **Use `useWhopAuth()` hook everywhere** instead of reading URL params directly
4. **Test with 2 different companies** to verify isolation
5. **Consider enabling RLS** as a second layer of defense

---

## 📝 NOTES

- **Webhooks are secure** - they get company_id from Whop's webhook payload
- **Most API routes are secure** - they use `requireAdminAccess()`
- **Database queries are good** - they all filter by `client_id`
- **The issue is**: A few endpoints trust the client instead of the server

---

**Bottom Line:** Your app is 90% there, but has 3 critical holes that must be fixed before launch.

