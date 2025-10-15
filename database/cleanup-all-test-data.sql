-- Comprehensive Cleanup of ALL Test Data
-- This removes all test/seed data to ensure proper multi-tenancy

-- Delete all test data for various test company IDs
DELETE FROM insights WHERE client_id IN (
  SELECT id FROM clients WHERE company_id IN (
    'comp_sample456',
    'comp_real_estate_001', 
    'biz_test123',
    'biz_test456',
    'test_company_001',
    'test_company_002'
  )
);

DELETE FROM form_submissions WHERE client_id IN (
  SELECT id FROM clients WHERE company_id IN (
    'comp_sample456',
    'comp_real_estate_001', 
    'biz_test123',
    'biz_test456',
    'test_company_001',
    'test_company_002'
  )
);

DELETE FROM form_templates WHERE client_id IN (
  SELECT id FROM clients WHERE company_id IN (
    'comp_sample456',
    'comp_real_estate_001', 
    'biz_test123',
    'biz_test456',
    'test_company_001',
    'test_company_002'
  )
);

DELETE FROM events WHERE client_id IN (
  SELECT id FROM clients WHERE company_id IN (
    'comp_sample456',
    'comp_real_estate_001', 
    'biz_test123',
    'biz_test456',
    'test_company_001',
    'test_company_002'
  )
);

DELETE FROM subscriptions WHERE client_id IN (
  SELECT id FROM clients WHERE company_id IN (
    'comp_sample456',
    'comp_real_estate_001', 
    'biz_test123',
    'biz_test456',
    'test_company_001',
    'test_company_002'
  )
);

DELETE FROM entities WHERE client_id IN (
  SELECT id FROM clients WHERE company_id IN (
    'comp_sample456',
    'comp_real_estate_001', 
    'biz_test123',
    'biz_test456',
    'test_company_001',
    'test_company_002'
  )
);

-- Delete all test clients
DELETE FROM clients WHERE company_id IN (
  'comp_sample456',
  'comp_real_estate_001', 
  'biz_test123',
  'biz_test456',
  'test_company_001',
  'test_company_002'
);

-- Also clean up any clients with test-like names
DELETE FROM clients WHERE company_id LIKE 'comp_%' 
  AND company_id != 'biz_3GYHNPbGkZCEky';

DELETE FROM clients WHERE company_id LIKE 'biz_test%';

-- Show remaining clients to verify cleanup
SELECT 
  company_id, 
  current_tier, 
  created_at,
  CASE 
    WHEN company_id = 'biz_3GYHNPbGkZCEky' THEN 'YOUR_ACTUAL_COMPANY'
    ELSE 'OTHER_COMPANY'
  END as company_type
FROM clients 
ORDER BY created_at;
