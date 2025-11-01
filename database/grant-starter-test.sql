-- ============================================================================
-- GRANT STARTER PACK ACCESS FOR TESTING
-- Run this in Supabase SQL Editor to give exp_DYk5fbXwZk8acI starter access
-- ============================================================================

-- Grant Starter tier (atom) to exp_DYk5fbXwZk8acI
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
  'exp_DYk5fbXwZk8acI',
  'exp_DYk5fbXwZk8acI',
  'test@starter.test',
  'Starter Test Account',
  'atom',                       -- Starter tier
  'pro',                        -- For RLS (maps to paid tier)
  'active',                     -- Active subscription
  (NOW() + INTERVAL '30 days'), -- Trial ends in 30 days
  'prod_Tdu9YayfFDxhc',         -- Starter plan ID
  NOW()
)
ON CONFLICT (company_id) 
DO UPDATE SET
  current_tier = 'atom',
  subscription_tier = 'pro',
  subscription_status = 'active',
  trial_ends_at = (NOW() + INTERVAL '30 days'),
  whop_plan_id = 'prod_Tdu9YayfFDxhc',
  updated_at = NOW();

-- Verify the update
SELECT 
  company_id,
  current_tier,
  subscription_status,
  trial_ends_at,
  whop_plan_id
FROM clients 
WHERE company_id = 'exp_DYk5fbXwZk8acI';

-- ============================================================================
-- RESULTS:
-- You should see:
-- - company_id: exp_DYk5fbXwZk8acI
-- - current_tier: atom (Starter - $30/mo)
-- - subscription_status: active
-- - trial_ends_at: [30 days from now]
-- - whop_plan_id: prod_Tdu9YayfFDxhc
--
-- UNLOCKED FEATURES (Starter Tier):
-- ✅ Up to 100 students
-- ✅ 250 AI-analyzed survey responses/month
-- ✅ 5 AI insights/day
-- ✅ 14 days data retention
-- ✅ 3 dashboard metrics (consistency, popular, feedback)
-- ❌ CSV/PDF exports (locked)
-- ❌ API access (locked)
-- ❌ Time filters (locked)
-- ============================================================================

