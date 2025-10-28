-- ============================================================================
-- CHECK DATABASE AND GRANT PREMIUM
-- ============================================================================
-- This checks what exists and grants premium
-- ============================================================================

-- STEP 1: Check if clients table exists and what columns it has
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;

-- STEP 2: Check if your account exists
SELECT * FROM clients WHERE company_id = 'biz_3GYHNPbGkZCEky';

-- STEP 3: If account exists, update it:
UPDATE clients 
SET 
  current_tier = 'surge',
  subscription_tier = 'premium',
  subscription_status = 'active',
  trial_ends_at = NOW() + INTERVAL '1 year',
  whop_plan_id = 'prod_bm98P1RCFrFmF',
  updated_at = NOW()
WHERE company_id = 'biz_3GYHNPbGkZCEky';

-- STEP 4: If account doesn't exist, create it:
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
SELECT 
  'biz_3GYHNPbGkZCEky',
  'biz_3GYHNPbGkZCEky',
  'dev@premium.test',
  'Premium Dev Account',
  'surge',
  'premium',
  'active',
  NOW() + INTERVAL '1 year',
  'prod_bm98P1RCFrFmF'
WHERE NOT EXISTS (
  SELECT 1 FROM clients WHERE company_id = 'biz_3GYHNPbGkZCEky'
);

-- STEP 5: Verify it worked
SELECT 
  '✅ RESULT:' as status,
  company_id,
  current_tier,
  subscription_tier,
  subscription_status,
  trial_ends_at
FROM clients 
WHERE company_id = 'biz_3GYHNPbGkZCEky';

