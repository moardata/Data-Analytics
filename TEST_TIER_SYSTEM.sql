-- ============================================================================
-- TEST TIER SYSTEM
-- Use this to verify that paid upgrades would work correctly
-- ============================================================================

-- Step 1: Check current status of your dev account
SELECT 
  company_id,
  name,
  current_tier,
  subscription_status,
  subscription_tier,
  trial_ends_at,
  created_at
FROM clients 
WHERE company_id = 'biz_3GYHNPbGkZCEky';

-- ============================================================================
-- TIER TESTING: Run these one at a time and test the dashboard after each
-- ============================================================================

-- Test 1: Set to ATOM tier (Starter - $30/mo)
-- Should see 3 metrics, no exports
UPDATE clients 
SET current_tier = 'atom', subscription_status = 'active'
WHERE company_id = 'biz_3GYHNPbGkZCEky';

-- Test 2: Set to CORE tier (Growth - $99/mo)
-- Should see all 6 metrics, CSV exports only
UPDATE clients 
SET current_tier = 'core', subscription_status = 'active'
WHERE company_id = 'biz_3GYHNPbGkZCEky';

-- Test 3: Set to PULSE tier (Pro - $299/mo)
-- Should see all 6 metrics, CSV + PDF exports
UPDATE clients 
SET current_tier = 'pulse', subscription_status = 'active'
WHERE company_id = 'biz_3GYHNPbGkZCEky';

-- Test 4: Set to SURGE tier (Scale - $599/mo)
-- Should see everything, unlimited usage
UPDATE clients 
SET current_tier = 'surge', subscription_status = 'active'
WHERE company_id = 'biz_3GYHNPbGkZCEky';

-- ============================================================================
-- RECOMMENDED: Set to SURGE for development (unlimited access)
-- ============================================================================

UPDATE clients 
SET 
  current_tier = 'surge',
  subscription_status = 'active',
  subscription_tier = 'premium',
  trial_ends_at = (NOW() + INTERVAL '1 year')
WHERE company_id = 'biz_3GYHNPbGkZCEky';

-- Verify the update
SELECT 
  company_id,
  current_tier,
  subscription_status,
  subscription_tier
FROM clients 
WHERE company_id = 'biz_3GYHNPbGkZCEky';

-- ============================================================================
-- EXPECTED RESULTS BY TIER
-- ============================================================================

-- ATOM (Starter):
--   - 3 metrics: consistency, popular, feedback
--   - No CSV/PDF exports
--   - 100 students max
--   - 100 responses/month
--   - 5 AI insights/day

-- CORE (Growth):
--   - All 6 metrics
--   - CSV exports only
--   - 1,000 students max
--   - 1,000 responses/month
--   - 10 AI insights/day

-- PULSE (Pro):
--   - All 6 metrics
--   - CSV + PDF exports
--   - 2,000 students max
--   - 10,000 responses/month
--   - 15 AI insights/day

-- SURGE (Scale):
--   - All 6 metrics
--   - CSV + PDF exports
--   - Unlimited students
--   - Unlimited responses
--   - 20 AI insights/day
--   - API access

-- ============================================================================
-- NOTE: Your dev account (biz_3GYHNPbGkZCEky) has a HARDCODED BYPASS
-- To test the tier system properly, you must temporarily remove your ID
-- from the DEV_COMPANY_IDS array in lib/pricing/tiers.ts
-- ============================================================================

