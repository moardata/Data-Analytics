-- ============================================================================
-- ADD MISSING COLUMNS TO CLIENTS TABLE
-- Run this in Supabase SQL Editor to fix webhook sync issues
-- ============================================================================

-- Add trial_ends_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'trial_ends_at'
    ) THEN
        ALTER TABLE clients ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE '✅ Added trial_ends_at column';
    ELSE
        RAISE NOTICE '⚠️  trial_ends_at column already exists';
    END IF;
END $$;

-- Add whop_plan_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'whop_plan_id'
    ) THEN
        ALTER TABLE clients ADD COLUMN whop_plan_id TEXT;
        RAISE NOTICE '✅ Added whop_plan_id column';
    ELSE
        RAISE NOTICE '⚠️  whop_plan_id column already exists';
    END IF;
END $$;

-- Verify the columns were added
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'clients'
AND column_name IN ('trial_ends_at', 'whop_plan_id', 'current_tier', 'subscription_status')
ORDER BY column_name;

-- Show current clients
SELECT 
    company_id,
    current_tier,
    subscription_status,
    trial_ends_at,
    whop_plan_id,
    updated_at
FROM clients
ORDER BY updated_at DESC
LIMIT 10;

-- ============================================================================
-- WHAT THIS DOES:
-- - Adds trial_ends_at column (stores when trial expires)
-- - Adds whop_plan_id column (stores the Whop plan ID)
-- - These are required for webhook sync to work properly
-- 
-- After running this, webhooks will be able to sync subscription data!
-- ============================================================================

