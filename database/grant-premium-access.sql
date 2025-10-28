-- ============================================================================
-- GRANT PREMIUM ACCESS
-- Run this in Supabase SQL Editor to give your account full access
-- ============================================================================

-- Update company biz_3GYHNPbGkZCEky to Scale tier (unlimited everything)
INSERT INTO clients (
  company_id,
  whop_user_id,
  email,
  name,
  current_tier,
  subscription_tier,
  subscription_status,
  trial_ends_at,
  whop_plan_id,
  updated_at
)
VALUES (
  'biz_3GYHNPbGkZCEky',
  'biz_3GYHNPbGkZCEky',
  'dev@premium.test',
  'Premium Dev Account',
  'surge',                      -- Top tier (Scale)
  'premium',                    -- For RLS
  'active',                     -- Active subscription
  (NOW() + INTERVAL '1 year'), -- Trial ends in 1 year
  'prod_bm98P1RCFrFmF',        -- Scale plan ID
  NOW()
)
ON CONFLICT (company_id) 
DO UPDATE SET
  current_tier = 'surge',
  subscription_tier = 'premium',
  subscription_status = 'active',
  trial_ends_at = (NOW() + INTERVAL '1 year'),
  whop_plan_id = 'prod_bm98P1RCFrFmF',
  updated_at = NOW();

-- Verify the update
SELECT 
  company_id,
  current_tier,
  subscription_status,
  trial_ends_at
FROM clients 
WHERE company_id = 'biz_3GYHNPbGkZCEky';

-- ============================================================================
-- RESULTS:
-- You should see:
-- - current_tier: surge (Scale - $599/mo)
-- - subscription_status: active
-- - trial_ends_at: [1 year from now]
--
-- UNLOCKED FEATURES:
-- ✅ Unlimited students
-- ✅ Unlimited responses
-- ✅ 20 AI insights/day
-- ✅ All 6 dashboard metrics
-- ✅ CSV + PDF exports
-- ✅ API access
-- ✅ All time range options
-- ✅ No paywalls anywhere
-- ============================================================================

