# User Error Messages - Limits & Restrictions

**Last Updated:** October 27, 2025  
**Purpose:** Ensure users get clear, helpful messages when hitting limits

---

## Current Error Messages

### 1. **Student Limit Reached**

**Where:** Webhooks, Member Import

**Message:**
```
Student limit reached (100). Upgrade to add more students.

Current: 100 students
Limit: 100 students
Your Plan: Starter ($30/mo)

Upgrade Options:
→ Growth Plan ($99/mo): 1,000 students
→ Pro Plan ($299/mo): 2,000 students  
→ Scale Plan ($599/mo): Unlimited students

[Upgrade Now]
```

**HTTP Status:** 429 Too Many Requests

---

### 2. **Response Limit Reached**

**Where:** Form Submissions

**Message:**
```
Monthly response limit reached (100). Upgrade to analyze more responses.

Current: 100 responses this month
Limit: 100 responses/month
Your Plan: Starter ($30/mo)
Resets: [Date of next month]

Upgrade Options:
→ Growth Plan ($99/mo): 1,000 responses/month
→ Pro Plan ($299/mo): 10,000 responses/month
→ Scale Plan ($599/mo): Unlimited responses

[Upgrade Now]
```

**HTTP Status:** 429 Too Many Requests

---

### 3. **AI Insights Limit Reached**

**Where:** Insights Generation

**Message:**
```
Daily AI insight limit reached (5). Try again tomorrow or upgrade for more insights.

Current: 5 insights today
Limit: 5 insights/day
Your Plan: Starter ($30/mo)
Resets: Tomorrow at midnight

Upgrade Options:
→ Growth Plan ($99/mo): 10 insights/day
→ Pro Plan ($299/mo): 15 insights/day
→ Scale Plan ($599/mo): 20 insights/day

[Upgrade Now]
```

**HTTP Status:** 429 Too Many Requests

---

### 4. **CSV Export Not Available**

**Where:** Export Endpoints

**Message:**
```
CSV Export requires Growth plan or higher.

Your Plan: Starter ($30/mo)
Feature Available In: Growth, Pro, Scale

Upgrade to Growth Plan ($99/mo) to unlock:
✓ CSV exports
✓ 1,000 students
✓ 1,000 responses/month
✓ 10 daily AI insights
✓ All 6 dashboard metrics

[Upgrade Now]
```

**HTTP Status:** 403 Forbidden

---

### 5. **PDF Export Not Available**

**Where:** Export Endpoints

**Message:**
```
PDF Export requires Pro plan or higher.

Your Plan: Growth ($99/mo)
Feature Available In: Pro, Scale

Upgrade to Pro Plan ($299/mo) to unlock:
✓ PDF exports
✓ CSV exports
✓ 2,000 students
✓ 10,000 responses/month
✓ 15 daily AI insights
✓ At-risk student alerts
✓ White-label forms

[Upgrade Now]
```

**HTTP Status:** 403 Forbidden

---

### 6. **Dashboard Metric Locked**

**Where:** Dashboard Metrics

**UI Message:**
```
🔒 Upgrade to Unlock

This metric is available in Growth plan and higher.

Your Plan: Starter ($30/mo)

Unlock all 6 dashboard metrics with Growth Plan ($99/mo):
✓ Student Consistency
✓ Aha Moment Tracker
✓ Content Pathways
✓ Popular Content
✓ Feedback Themes
✓ Commitment Probability

[Upgrade Now]
```

**Display:** Overlay on locked metric card

---

### 7. **Time Range Locked (Reports)**

**Where:** Export Time Range Selector

**UI Message:**
```
🔒 Premium Feature

Monthly, 6-month, and yearly reports require Pro plan or higher.

Your Plan: Growth ($99/mo)

Upgrade to Pro Plan ($299/mo) to unlock:
✓ Extended time range reports
✓ PDF exports
✓ White-label forms
✓ At-risk alerts
✓ Priority support

[Upgrade Now]
```

**Display:** Disabled button with lock icon

---

## Error Response Format

All API errors follow this consistent format:

```json
{
  "error": "User-friendly error message",
  "limitReached": true,
  "details": {
    "current": 100,
    "limit": 100,
    "tier": "atom",
    "tierName": "Starter",
    "resetDate": "2025-11-01T00:00:00Z"
  },
  "upgrade": {
    "message": "Upgrade to continue",
    "url": "/upgrade?companyId=biz_xxx",
    "recommendedTier": "core",
    "recommendedTierName": "Growth"
  }
}
```

---

## Frontend Error Handling

### Show User-Friendly Toasts

```typescript
// When API returns 429 or 403
if (response.status === 429 || response.status === 403) {
  const data = await response.json();
  
  showToast({
    title: "Limit Reached",
    description: data.error,
    action: {
      label: "Upgrade Plan",
      onClick: () => router.push(data.upgrade.url)
    },
    variant: "warning"
  });
}
```

### Usage Dashboard Warnings

- **75% usage:** Yellow warning with "approaching limit"
- **90% usage:** Orange warning with "upgrade recommended"
- **100% usage:** Red error with "limit reached - upgrade now"

---

## What Users See vs What They Get

### Starter Plan ($30/mo) User Sees:

**When trying to import 101st student:**
```
⚠️ Student Limit Reached

You've reached your limit of 100 students on the Starter plan.

Upgrade to Growth to get 1,000 students.

[View Plans]
```

**When trying to submit 101st response:**
```
⚠️ Response Limit Reached

You've analyzed 100 responses this month (your limit on Starter plan).

Upgrade to Growth for 1,000 responses/month or wait until Nov 1st when your limit resets.

[Upgrade Now] [View Usage]
```

**When trying to generate 6th AI insight:**
```
⚠️ Daily Limit Reached

You've generated 5 AI insights today (your daily limit on Starter plan).

Try again tomorrow or upgrade to Growth for 10 insights/day.

[Upgrade Now] [View Plans]
```

**When trying CSV export:**
```
🔒 Feature Locked

CSV exports are available starting with the Growth plan.

Your plan: Starter ($30/mo)
Unlock with: Growth ($99/mo)

[Upgrade Now]
```

---

## Recommendations for User Experience

### ✅ DO:
- Show current usage vs limit clearly
- Explain when limits reset (daily/monthly)
- Show specific upgrade options with pricing
- Include direct upgrade links
- Use friendly, helpful tone
- Show progress bars before limits are hit

### ❌ DON'T:
- Just say "error" or "forbidden"
- Hide pricing information
- Make users guess what they need
- Use technical jargon
- Show generic 500 errors

---

## Testing Checklist

- [ ] User on Starter plan hits 100 students → See clear limit message
- [ ] User on Starter plan tries CSV export → See upgrade prompt
- [ ] User on Growth plan tries PDF export → See upgrade prompt
- [ ] User approaches 75% of any limit → See warning in dashboard
- [ ] User clicks upgrade button → Redirected to pricing page
- [ ] Error messages include current tier name
- [ ] Error messages include recommended tier to upgrade to
- [ ] All limits show when they reset

---

## Implementation Status

✅ **Backend:** All limits enforced with proper error responses  
✅ **Error Messages:** User-friendly with upgrade CTAs  
✅ **Usage Dashboard:** Shows progress bars with warnings  
🔄 **Toast Notifications:** Need to implement frontend toasts  
🔄 **Trial Warnings:** Need to add "trial ending soon" alerts

---

**All error messages are production-ready and user-friendly! 🚀**

