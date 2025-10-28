-- ============================================================================
-- GRANT PREMIUM ACCESS ONLY
-- ============================================================================
-- Use this if tables already exist
-- Just updates your account to premium tier
-- ============================================================================

-- Grant premium access to your dev account
INSERT INTO clients (
  company_id,
  whop_user_id,
  email,
  name,
  current_tier,
  subscription_tier,
  subscription_status,
  trial_ends_at,
  whop_plan_id
)
VALUES (
  'biz_3GYHNPbGkZCEky',
  'biz_3GYHNPbGkZCEky',
  'dev@premium.test',
  'Premium Dev Account',
  'surge',
  'premium',
  'active',
  NOW() + INTERVAL '1 year',
  'prod_bm98P1RCFrFmF'
)
ON CONFLICT (company_id) 
DO UPDATE SET
  current_tier = 'surge',
  subscription_tier = 'premium',
  subscription_status = 'active',
  trial_ends_at = NOW() + INTERVAL '1 year',
  whop_plan_id = 'prod_bm98P1RCFrFmF',
  updated_at = NOW();

-- Verify it worked
SELECT 
  '✅ PREMIUM ACCESS GRANTED!' as status,
  company_id,
  current_tier,
  subscription_tier,
  subscription_status,
  trial_ends_at::date
FROM clients 
WHERE company_id = 'biz_3GYHNPbGkZCEky';

-- ============================================================================
-- RESULT:
-- You should see:
-- - current_tier: surge
-- - subscription_tier: premium
-- - subscription_status: active
-- - trial_ends_at: [1 year from now]
--
-- UNLOCKED:
-- ✅ Unlimited students
-- ✅ Unlimited responses
-- ✅ 20 AI insights/day
-- ✅ All dashboard metrics
-- ✅ CSV + PDF exports
-- ✅ All time ranges
-- ============================================================================

