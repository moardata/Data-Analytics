-- ============================================================================
-- URGENT: Update Tier Names in Database
-- ============================================================================
-- Run this in your Supabase SQL Editor IMMEDIATELY
-- This fixes 500 errors caused by old tier names in the database
-- ============================================================================

-- Update all old tier names to new tier names
UPDATE clients
SET current_tier = CASE current_tier
  WHEN 'atom' THEN 'starter'
  WHEN 'core' THEN 'growth'
  WHEN 'pulse' THEN 'pro'
  WHEN 'surge' THEN 'scale'
  WHEN 'quantum' THEN 'scale'
  WHEN 'free' THEN NULL  -- Old value, no subscription
  WHEN 'pro' THEN 'growth'  -- Old bundle system
  WHEN 'premium' THEN 'scale'  -- Old bundle system
  ELSE current_tier  -- Keep existing valid values
END;

-- Verify the update
SELECT 
  current_tier, 
  subscription_status,
  COUNT(*) as count
FROM clients
GROUP BY current_tier, subscription_status
ORDER BY current_tier;

-- Check your specific company
SELECT 
  company_id,
  current_tier,
  subscription_status,
  whop_plan_id,
  trial_ends_at
FROM clients
WHERE company_id = 'biz_3GYHNPbGkZCEky';

