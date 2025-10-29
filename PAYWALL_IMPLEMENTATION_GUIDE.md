# 🔒 Paywall System Implementation Guide

## Overview

This app now has a **complete paywall system** with:
- ✅ Whop's **professional checkout flow** (like the screenshots you shared)
- ✅ **7-day free trial** for first-time users on Starter plan
- ✅ **One-time trial** (users can't get free trial again)
- ✅ Automatic **subscription status checking**
- ✅ Paywall that blocks all features without subscription

---

## 🎯 How It Works

### 1. Checkout Flow
When users click "upgrade" or try to access features without a subscription, they're redirected to Whop's checkout page where Whop displays their professional payment modal.

### 2. Free Trial Logic
- **First-time users**: Get 7-day free trial on Starter plan ($30/month after)
- **Returning users**: Must pay immediately (no free trial)
- Trial eligibility is tracked in database

### 3. Access Control
Without an active subscription, users:
- Can browse the upgrade page
- **Cannot** access analytics, forms, insights, or any premium features
- Get prompted with checkout modal when they try

---

## 🚀 Quick Start: Adding Paywalls

### Method 1: Wrap Entire Pages (Recommended)

Wrap any page content with `<PaywallGuard>`:

```tsx
'use client';

import { PaywallGuard } from '@/components/PaywallGuard';
import YourPageContent from '@/components/YourPageContent';

export default function ProtectedPage() {
  return (
    <PaywallGuard feature="Analytics Dashboard">
      <YourPageContent />
    </PaywallGuard>
  );
}
```

**What happens:**
- ✅ If user has subscription → Shows content
- ❌ If no subscription → Shows "Subscription Required" message + button to open checkout
- Automatically opens paywall modal

---

### Method 2: Protect Specific Features

For protecting individual buttons/actions:

```tsx
'use client';

import { usePaywall } from '@/hooks/use-paywall';
import { PaywallModal } from '@/components/PaywallModal';

export function AnalyticsButton() {
  const { hasAccess, showPaywall, setShowPaywall, requireSubscription } = usePaywall();

  const handleGenerateInsights = () => {
    // Check subscription before allowing action
    if (!requireSubscription('AI Insights Generation')) {
      return; // Paywall modal will show automatically
    }

    // User has access - proceed with action
    generateInsights();
  };

  return (
    <>
      <button onClick={handleGenerateInsights}>
        Generate AI Insights
      </button>

      <PaywallModal 
        isOpen={showPaywall} 
        onClose={() => setShowPaywall(false)}
      />
    </>
  );
}
```

---

## 📦 Components Created

### 1. `<PaywallModal />` 
The main checkout modal component.

**Props:**
- `isOpen: boolean` - Show/hide modal
- `onClose: () => void` - Callback when closed
- `reason?: string` - Why paywall was triggered (e.g., "AI Insights Generation")

**Features:**
- Automatically detects trial eligibility
- Shows 7-day trial offer for new users
- Shows all plans for returning users
- Uses Whop's embedded checkout (no external redirect)

---

### 2. `<PaywallGuard />`
Wraps content that requires subscription.

**Props:**
- `children: ReactNode` - Content to protect
- `feature?: string` - Feature name for messaging
- `fallback?: ReactNode` - Custom loading state

**Example:**
```tsx
<PaywallGuard feature="Revenue Dashboard">
  <RevenueDashboard />
</PaywallGuard>
```

---

### 3. `usePaywall()` Hook
Check subscription status and trigger paywall.

**Returns:**
```typescript
{
  hasAccess: boolean;           // Does user have active subscription?
  currentTier: string | null;   // Their current plan (atom/core/pulse/surge)
  subscriptionStatus: string;   // active/cancelled/expired/none
  loading: boolean;             // Checking subscription status
  showPaywall: boolean;         // Is paywall modal open?
  setShowPaywall: (show: boolean) => void;
  requireSubscription: (reason?: string) => boolean; // Check and show paywall if needed
  refreshStatus: () => Promise<void>; // Re-check subscription
}
```

---

## 🔌 API Endpoints Created

### 1. `GET /api/subscription/status`
Check if user has active subscription.

**Query params:**
- `companyId` - Whop company ID

**Returns:**
```json
{
  "hasAccess": true,
  "currentTier": "core",
  "subscriptionStatus": "active",
  "planId": "prod_UNx31yqmQcXOx"
}
```

---

### 2. `GET /api/subscription/check-trial`
Check if user is eligible for free trial.

**Query params:**
- `companyId` - Whop company ID

**Returns:**
```json
{
  "eligibleForTrial": true,
  "reason": "new_user",
  "hasActiveSubscription": false
}
```

**Logic:**
- ✅ Eligible if: Never had subscription before
- ❌ Not eligible if: Has/had subscription previously

---

## 🎨 How Checkout Works

When users click "Upgrade" or "Start Trial", they're redirected to Whop's checkout page where Whop displays their professional payment modal.

```tsx
function UpgradeButton() {
  const handleUpgrade = () => {
    // Redirect to Whop checkout page
    window.location.href = 'https://whop.com/api-app-s-n-bw-kv-th-ikvw-n9-starter/';
  };

  return <button onClick={handleUpgrade}>Start Free Trial</button>;
}
```

**Your Checkout URLs:**
- Starter: `https://whop.com/api-app-s-n-bw-kv-th-ikvw-n9-starter/`
- Growth: `https://whop.com/api-app-s-n-bw-kv-th-ikvw-n9-growth/`
- Pro: `https://whop.com/api-app-s-n-bw-kv-th-ikvw-n9-pro/`
- Scale: `https://whop.com/api-app-s-n-bw-kv-th-ikvw-n9-scale/`

**Your Product IDs:**
- Starter: `prod_Tdu9YayfFDxhc`
- Growth: `prod_UNx31yqmQcXOx`
- Pro: `prod_03fZxoux0PVvW`
- Scale: `prod_QFtQEu91TO2yh`

---

## 📋 Implementation Checklist

### Step 1: Protect All Pages
Add `<PaywallGuard>` to these pages:
- [ ] `/analytics` - Analytics dashboard
- [ ] `/insights` - AI insights
- [ ] `/forms` - Form builder
- [ ] `/revenue` - Revenue tracking
- [ ] Any other premium features

### Step 2: Update Navigation
Show "Upgrade" badge on nav items if no subscription:

```tsx
const { hasAccess } = usePaywall();

<NavItem>
  Analytics {!hasAccess && <span className="badge">Upgrade</span>}
</NavItem>
```

### Step 3: Test Flow
1. **New user flow:**
   - User opens app → Sees paywall
   - Clicks "Start Free Trial" → Whop checkout modal opens
   - Completes payment → Gets 7-day trial → Can access features

2. **Existing user flow:**
   - User with expired subscription → Sees paywall
   - Clicks "View Plans" → Must pay (no trial)
   - Completes payment → Instant access

### Step 4: Dev Bypass
Dev company IDs bypass paywall (already configured):
- `biz_3GYHNPbGkZCEky` - Your dev company

---

## 🎯 Example: Full Page Implementation

Here's a complete example of protecting the Analytics page:

```tsx
'use client';

import { PaywallGuard } from '@/components/PaywallGuard';
import DashboardCreatorAnalytics from '@/components/DashboardCreatorAnalytics';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function AnalyticsPage() {
  return (
    <PaywallGuard 
      feature="Analytics Dashboard"
      fallback={<LoadingScreen />}
    >
      <DashboardCreatorAnalytics />
    </PaywallGuard>
  );
}
```

That's it! The `PaywallGuard` handles:
- Checking subscription status
- Showing loading state
- Blocking access if no subscription
- Opening checkout modal
- Allowing access if subscribed

---

## 🚨 Important Notes

### Trial Logic
- Free trial is **one-time per company**
- Once they've subscribed (even if cancelled), no more free trials
- Trial is only on Starter plan ($30/month)

### Subscription Status
Subscription is considered "active" when:
- User has paid
- Trial period is active
- Subscription hasn't been cancelled/expired

### Database Updates
Subscription status is updated automatically via Whop webhooks (`/api/webhooks`):
- `membership.created` → User subscribes
- `membership.renewed` → Subscription renews
- `membership.cancelled` → User cancels
- `membership.expired` → Subscription expires

---

## 🔄 Testing

### Test with Dev Bypass:
```typescript
// In /api/subscription/status/route.ts
const DEV_COMPANY_IDS = ['biz_3GYHNPbGkZCEky'];
```

### Test Without Bypass:
1. Use a different Whop company ID
2. Test the paywall flow
3. Test trial eligibility
4. Test checkout modal

---

## 💡 Tips

1. **Don't break existing users**: If you have users already using the app, make sure their subscription status is set correctly in the database before deploying paywall.

2. **Smooth UX**: The paywall modal is non-blocking - users can close it and browse around, but they can't access features.

3. **Clear messaging**: Always pass a `feature` prop to explain what they're trying to access.

4. **Test thoroughly**: Test both new user and returning user flows before deploying.

---

## 🎉 You're Done!

The embedded checkout modal (like in your screenshots) is now integrated. Users will see the beautiful Whop payment modal instead of being redirected externally!

**Next steps:**
1. Wrap all premium pages with `<PaywallGuard>`
2. Test the checkout flow
3. Deploy and watch subscriptions roll in! 💰

