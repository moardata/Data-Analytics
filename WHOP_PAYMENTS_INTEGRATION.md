# 💳 Whop Payments Integration Guide

## How Payments Work in Whop

Whop handles **ALL payment processing** for your app. You don't need Stripe, PayPal, or any other payment processor!

### The Flow:

```
1. Creator visits Whop marketplace
   ↓
2. Sees your app with pricing tiers
   ↓
3. Clicks "Subscribe" on a tier (e.g. $20/month Starter plan)
   ↓
4. Whop processes payment (Stripe backend, handled by Whop)
   ↓
5. Whop sends webhook to your app: membership.created
   {
     "action": "membership.created",
     "data": {
       "company_id": "biz_ABC123",
       "user_id": "user_XYZ",
       "plan_id": "plan_starter_monthly",
       "amount": 2000, // $20 in cents
       "status": "active"
     }
   }
   ↓
6. Your webhook updates client tier in database
   ↓
7. Creator now has access to Starter plan features
```

---

## Setting Up Pricing Plans in Whop

### Step 1: Create Membership Plans

1. Go to [Whop Developer Dashboard](https://whop.com/apps)
2. Open your app
3. Go to **"Pricing" or "Plans"** section
4. Create 4 membership plans:

#### Free Plan
- **Name**: Free
- **Price**: $0/month
- **Plan ID**: `plan_free` (copy this!)
- **Features**: List the free tier features

#### Starter Plan
- **Name**: Starter
- **Price**: $20/month
- **Plan ID**: `plan_starter_monthly` (copy this!)
- **Features**: List starter features

#### Growth Plan
- **Name**: Growth
- **Price**: $100/month
- **Plan ID**: `plan_growth_monthly` (copy this!)
- **Features**: List growth features

#### Pro Plan
- **Name**: Pro
- **Price**: $200/month
- **Plan ID**: `plan_pro_monthly` (copy this!)
- **Features**: List pro features

#### Enterprise Plan
- **Name**: Enterprise
- **Price**: $400/month
- **Plan ID**: `plan_enterprise_monthly` (copy this!)
- **Features**: List enterprise features

---

### Step 2: Map Whop Plan IDs to Your Tiers

In `whop-app/lib/pricing/tiers.ts`, add the `whopPlanId`:

```typescript
export const PRICING_TIERS: Record<TierName, PricingTier> = {
  free: {
    // ...
    whopPlanId: 'plan_free', // ← Copy from Whop dashboard
  },
  starter: {
    // ...
    whopPlanId: 'plan_starter_monthly', // ← Copy from Whop dashboard
  },
  growth: {
    // ...
    whopPlanId: 'plan_growth_monthly', // ← Copy from Whop dashboard
  },
  pro: {
    // ...
    whopPlanId: 'plan_pro_monthly', // ← Copy from Whop dashboard
  },
  enterprise: {
    // ...
    whopPlanId: 'plan_enterprise_monthly', // ← Copy from Whop dashboard
  },
};
```

---

### Step 3: Update Webhook to Assign Tiers

Your webhook (`app/api/webhooks/route.ts`) already creates clients. Now it needs to assign the correct tier based on the plan they purchased.

**Already implemented in webhook:**
```typescript
// When membership.created webhook comes in:
const whopPlanId = eventData.plan_id; // e.g. 'plan_starter_monthly'

// Map plan ID to tier
const tierMapping: Record<string, TierName> = {
  'plan_free': 'free',
  'plan_starter_monthly': 'starter',
  'plan_growth_monthly': 'growth',
  'plan_pro_monthly': 'pro',
  'plan_enterprise_monthly': 'enterprise',
};

const tier = tierMapping[whopPlanId] || 'free';

// Create/update client with tier
await supabase.from('clients').upsert({
  company_id: eventData.company_id,
  current_tier: tier,
  whop_plan_id: whopPlanId,
  subscription_status: 'active',
});
```

---

## Revenue Split

**Whop takes 30% of all transactions** (standard platform fee).

### Your Profit Per Plan:
- **Free**: $0/month (customer acquisition)
- **Starter**: $20/month → You get **$14/month** (70%)
- **Growth**: $100/month → You get **$70/month** (70%)
- **Pro**: $200/month → You get **$140/month** (70%)
- **Enterprise**: $400/month → You get **$280/month** (70%)

### Costs:
- **OpenAI**: ~$0.001 per insight generation
- **Supabase**: Free tier ($0-25/month)
- **Vercel**: Free tier ($0-20/month)

**Net Profit**: ~95-98% of your 70% share (after infrastructure costs)

---

## Handling Plan Changes

### Upgrade (Starter → Growth)
```
1. User clicks "Upgrade" in Whop
   ↓
2. Whop processes payment
   ↓
3. Webhook: membership.updated
   {
     "action": "membership.updated",
     "data": {
       "company_id": "biz_ABC123",
       "plan_id": "plan_growth_monthly",
       "status": "active"
     }
   }
   ↓
4. Your webhook updates client tier:
   UPDATE clients 
   SET current_tier = 'growth', 
       whop_plan_id = 'plan_growth_monthly'
   WHERE company_id = 'biz_ABC123'
   ↓
5. User immediately gets Growth plan limits
```

### Downgrade (Growth → Starter)
Same flow, but tier goes down.

### Cancellation
```
Webhook: membership.cancelled
  ↓
UPDATE clients 
SET subscription_status = 'cancelled',
    subscription_expires_at = NOW() + interval '30 days'
  ↓
User retains access until expiration date
  ↓
After expiration: tier = 'free'
```

---

## Testing Payments Locally

### Option 1: Whop Test Mode
1. Enable test mode in Whop dashboard
2. Use test credit cards: `4242 4242 4242 4242`
3. Webhooks fire normally
4. No real money charged

### Option 2: Manual Testing
1. Run SQL in Supabase:
   ```sql
   UPDATE clients 
   SET current_tier = 'growth', 
       subscription_status = 'active'
   WHERE company_id = 'YOUR_COMPANY_ID';
   ```
2. Refresh your app
3. You now have Growth plan features

---

## Upgrade Button Implementation

In your app, link to Whop's pricing page:

```tsx
// components/UpgradeButton.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function UpgradeButton() {
  return (
    <Button asChild>
      <Link href="https://whop.com/your-app-name/pricing" target="_blank">
        Upgrade Plan
      </Link>
    </Button>
  );
}
```

Or embed Whop's pricing modal:
```tsx
import { WhopApp } from '@whop/react/components';

// In your pricing page:
<WhopApp>
  {/* Whop automatically shows pricing UI here */}
</WhopApp>
```

---

## Checking User's Plan in Your App

### Client-Side:
```tsx
'use client';
import { useEffect, useState } from 'react';

export function useTier() {
  const [tier, setTier] = useState('free');
  const [limits, setLimits] = useState(null);

  useEffect(() => {
    fetch('/api/usage/check')
      .then(res => res.json())
      .then(data => {
        setTier(data.tier);
        setLimits(data.limits);
      });
  }, []);

  return { tier, limits };
}

// Usage:
function MyComponent() {
  const { tier, limits } = useTier();
  
  return (
    <div>
      <p>Your plan: {tier}</p>
      <p>AI insights left today: {limits?.aiInsightsPerDay - usage.aiInsightsToday}</p>
    </div>
  );
}
```

### Server-Side:
```tsx
// In a Server Component or API route:
import { supabase } from '@/lib/supabase';
import { getTier } from '@/lib/pricing/tiers';

const { data: client } = await supabase
  .from('clients')
  .select('current_tier')
  .eq('company_id', companyId)
  .single();

const tierData = getTier(client.current_tier || 'free');
```

---

## Paywall Example

```tsx
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function GenerateInsightsButton() {
  const [canGenerate, setCanGenerate] = useState(true);
  const [error, setError] = useState('');

  const handleClick = async () => {
    // Check limits
    const res = await fetch('/api/usage/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generateInsight' }),
    });

    const data = await res.json();

    if (!data.allowed) {
      setCanGenerate(false);
      setError(data.reason);
      return;
    }

    // Generate insights
    await fetch('/api/insights/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeRange: 'week' }),
    });
  };

  if (!canGenerate) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">{error}</p>
        <Button asChild>
          <Link href="/upgrade">Upgrade Plan</Link>
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleClick}>
      Generate AI Insights
    </Button>
  );
}
```

---

## Summary

✅ **Whop handles ALL payments** (you don't need Stripe)  
✅ **Webhooks tell you what plan user purchased**  
✅ **You store tier in database and enforce limits**  
✅ **Users upgrade/downgrade through Whop's UI**  
✅ **You get 70% of revenue** (Whop takes 30%)  
✅ **Test mode available** for development  

**Next Steps:**
1. Create pricing plans in Whop dashboard
2. Copy plan IDs to `tiers.ts`
3. Update webhook to assign tiers (already implemented!)
4. Run schema update: `database/schema-pricing.sql`
5. Deploy and test!

---

**Questions?** Check Whop docs: https://docs.whop.com/apps/monetization



