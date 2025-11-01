-- ============================================================================
-- GRANT TRIAL STARTER ACCESS TO exp_DYk5fbXwZk8acI
-- Your friend who started the 7-day free trial yesterday
-- ============================================================================

-- Update exp_DYk5fbXwZk8acI to TRIAL Starter (started yesterday)
UPDATE clients
SET
  current_tier = 'atom',
  subscription_tier = 'pro',
  subscription_status = 'trialing',
  trial_ends_at = NOW() + INTERVAL '6 days',  -- 6 days left (started yesterday)
  whop_plan_id = 'prod_Tdu9YayfFDxhc',
  updated_at = NOW()
WHERE company_id = 'exp_DYk5fbXwZk8acI';

-- If no record exists, create it
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
SELECT
  'exp_DYk5fbXwZk8acI',
  'exp_DYk5fbXwZk8acI',
  'trial@starter.customer',
  'Trial Starter Customer',
  'atom',
  'pro',
  'trialing',
  NOW() + INTERVAL '6 days',  -- 6 days left
  'prod_Tdu9YayfFDxhc',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients WHERE company_id = 'exp_DYk5fbXwZk8acI'
);

-- Verify the update
SELECT 
  '✅ TRIAL STARTER ACCESS GRANTED!' as status,
  company_id,
  current_tier,
  subscription_status,
  trial_ends_at::date as trial_ends,
  whop_plan_id,
  updated_at
FROM clients 
WHERE company_id = 'exp_DYk5fbXwZk8acI';

-- ============================================================================
-- RESULT:
-- - current_tier: atom (Starter - $30/mo)
-- - subscription_status: trialing
-- - trial_ends_at: 6 days from now (started yesterday)
-- - whop_plan_id: prod_Tdu9YayfFDxhc
--
-- UNLOCKED FEATURES DURING TRIAL (Starter Tier):
-- ✅ Up to 100 students
-- ✅ 250 AI-analyzed survey responses/month
-- ✅ 5 AI insights/day
-- ✅ 14 days data retention
-- ✅ 3 dashboard metrics (consistency, popular, feedback)
-- ✅ Generate AI insights (no paywall)
-- ❌ CSV/PDF exports (locked - need Growth+)
-- ❌ API access (locked - need Growth+)
--
-- After 7 days, they'll be charged $30/mo and status changes to 'active'
-- ============================================================================

