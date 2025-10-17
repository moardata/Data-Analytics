-- Fix Database Schema: Standardize Tier System
-- This removes the old subscription_tier column and keeps only current_tier
-- Run this in your Supabase SQL Editor

-- Step 1: Check existing data
SELECT id, company_id, subscription_tier, current_tier 
FROM clients 
LIMIT 10;

-- Step 2: Copy data from subscription_tier to current_tier if current_tier is null
UPDATE clients 
SET current_tier = subscription_tier 
WHERE current_tier IS NULL;

-- Step 3: Drop the old subscription_tier constraint
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_subscription_tier_check;

-- Step 4: Remove the subscription_tier column (it's redundant)
ALTER TABLE clients DROP COLUMN IF EXISTS subscription_tier;

-- Step 5: Add proper constraint to current_tier
ALTER TABLE clients 
ADD CONSTRAINT clients_current_tier_check 
CHECK (current_tier IN ('free', 'pro', 'premium'));

-- Step 6: Set default value for current_tier
ALTER TABLE clients 
ALTER COLUMN current_tier SET DEFAULT 'free';

-- Step 7: Make current_tier NOT NULL (after ensuring all rows have a value)
ALTER TABLE clients 
ALTER COLUMN current_tier SET NOT NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'clients' AND column_name IN ('subscription_tier', 'current_tier');

-- Check current data
SELECT id, company_id, current_tier, subscription_status
FROM clients;

