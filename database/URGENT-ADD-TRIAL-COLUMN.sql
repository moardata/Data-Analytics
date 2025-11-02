-- ============================================================================
-- URGENT: Add missing trial_ends_at column
-- ============================================================================
-- Run this in your Supabase SQL Editor IMMEDIATELY
-- This fixes the 500 errors caused by missing column
-- ============================================================================

-- Add trial_ends_at column if it doesn't exist
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND column_name = 'trial_ends_at';

-- Check your company record
SELECT 
  company_id,
  current_tier,
  subscription_status,
  whop_plan_id,
  trial_ends_at,
  created_at,
  updated_at
FROM clients
WHERE company_id = 'biz_3GYHNPbGkZCEky';

