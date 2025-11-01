-- ============================================================================
-- GRANT PAID STARTER ACCESS TO exp_DYk5fbXwZk8acI
-- Your friend who actually paid for Starter plan
-- ============================================================================

-- Update exp_DYk5fbXwZk8acI to PAID Starter (they already paid!)
UPDATE clients
SET
  current_tier = 'atom',
  subscription_tier = 'pro',
  subscription_status = 'active',
  trial_ends_at = NULL,  -- No trial - they PAID
  whop_plan_id = 'prod_Tdu9YayfFDxhc',
  updated_at = NOW()
WHERE company_id = 'exp_DYk5fbXwZk8acI';

-- If no record exists, create it (shouldn't happen since we created earlier)
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
  'paid@starter.customer',
  'Paid Starter Customer',
  'atom',
  'pro',
  'active',
  NULL,  -- No trial - they PAID
  'prod_Tdu9YayfFDxhc',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients WHERE company_id = 'exp_DYk5fbXwZk8acI'
);

-- Verify the update
SELECT 
  '✅ PAID STARTER ACCESS GRANTED!' as status,
  company_id,
  current_tier,
  subscription_status,
  trial_ends_at,
  whop_plan_id,
  updated_at
FROM clients 
WHERE company_id = 'exp_DYk5fbXwZk8acI';

-- ============================================================================
-- RESULT:
-- - current_tier: atom (Starter - $30/mo)
-- - subscription_status: active
-- - trial_ends_at: NULL (they PAID, no trial)
-- - whop_plan_id: prod_Tdu9YayfFDxhc
--
-- UNLOCKED FEATURES (Starter Tier):
-- ✅ Up to 100 students
-- ✅ 250 AI-analyzed survey responses/month
-- ✅ 5 AI insights/day
-- ✅ 14 days data retention
-- ✅ 3 dashboard metrics (consistency, popular, feedback)
-- ✅ Generate AI insights (no paywall)
-- ❌ CSV/PDF exports (locked - need Growth+)
-- ❌ API access (locked - need Growth+)
-- ============================================================================

