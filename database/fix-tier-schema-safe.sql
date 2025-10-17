-- Safe Database Migration: Fix Tier Schema
-- This handles existing data that might have invalid tier values

-- Step 1: Check what data we have
SELECT id, company_id, subscription_tier, current_tier 
FROM clients 
LIMIT 10;

-- Step 2: See what tier values exist in the data
SELECT DISTINCT subscription_tier, current_tier, COUNT(*) 
FROM clients 
GROUP BY subscription_tier, current_tier;

-- Step 3: Update invalid tier values to valid ones
-- Map old tier names to new standardized ones
UPDATE clients 
SET current_tier = CASE 
  WHEN current_tier = 'atom' THEN 'free'
  WHEN current_tier = 'core' THEN 'pro'
  WHEN current_tier = 'pulse' THEN 'pro'
  WHEN current_tier = 'surge' THEN 'premium'
  WHEN current_tier = 'quantum' THEN 'premium'
  WHEN current_tier IS NULL THEN 'free'
  ELSE current_tier
END
WHERE current_tier NOT IN ('free', 'pro', 'premium') OR current_tier IS NULL;

-- Step 4: Also update subscription_tier for consistency
UPDATE clients 
SET subscription_tier = CASE 
  WHEN subscription_tier = 'atom' THEN 'free'
  WHEN subscription_tier = 'core' THEN 'pro'
  WHEN subscription_tier = 'pulse' THEN 'pro'
  WHEN subscription_tier = 'surge' THEN 'premium'
  WHEN subscription_tier = 'quantum' THEN 'premium'
  WHEN subscription_tier IS NULL THEN 'free'
  ELSE subscription_tier
END
WHERE subscription_tier NOT IN ('free', 'pro', 'premium') OR subscription_tier IS NULL;

-- Step 5: Copy data from subscription_tier to current_tier if current_tier is still null
UPDATE clients 
SET current_tier = subscription_tier 
WHERE current_tier IS NULL;

-- Step 6: Set default for any remaining nulls
UPDATE clients 
SET current_tier = 'free' 
WHERE current_tier IS NULL;

-- Step 7: Drop the old constraint first
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_subscription_tier_check;
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_current_tier_check;

-- Step 8: Remove the subscription_tier column (it's redundant)
ALTER TABLE clients DROP COLUMN IF EXISTS subscription_tier;

-- Step 9: Add proper constraint to current_tier
ALTER TABLE clients 
ADD CONSTRAINT clients_current_tier_check 
CHECK (current_tier IN ('free', 'pro', 'premium'));

-- Step 10: Set default value for current_tier
ALTER TABLE clients 
ALTER COLUMN current_tier SET DEFAULT 'free';

-- Step 11: Make current_tier NOT NULL
ALTER TABLE clients 
ALTER COLUMN current_tier SET NOT NULL;

-- Step 12: Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'clients' AND column_name IN ('subscription_tier', 'current_tier');

-- Step 13: Check current data
SELECT id, company_id, current_tier, subscription_status
FROM clients;
