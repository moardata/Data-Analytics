-- Cleanup Test Data
-- This removes all test data from the database while preserving real Whop group data

-- First, let's see what we're deleting
SELECT 'Test Clients to be deleted:' as info;
SELECT company_id, id, created_at 
FROM clients 
WHERE company_id LIKE '%_test' 
   OR company_id = 'biz_test_demo';

-- Delete all related data for test clients
-- (This will cascade delete entities, events, insights, etc. due to foreign key constraints)

-- Delete insights for test clients
DELETE FROM insights 
WHERE client_id IN (
  SELECT id FROM clients 
  WHERE company_id LIKE '%_test' 
     OR company_id = 'biz_test_demo'
);

-- Delete form submissions for test clients
DELETE FROM form_submissions 
WHERE client_id IN (
  SELECT id FROM clients 
  WHERE company_id LIKE '%_test' 
     OR company_id = 'biz_test_demo'
);

-- Delete form templates for test clients
DELETE FROM form_templates 
WHERE client_id IN (
  SELECT id FROM clients 
  WHERE company_id LIKE '%_test' 
     OR company_id = 'biz_test_demo'
);

-- Delete subscriptions for test clients
DELETE FROM subscriptions 
WHERE client_id IN (
  SELECT id FROM clients 
  WHERE company_id LIKE '%_test' 
     OR company_id = 'biz_test_demo'
);

-- Delete events for test clients
DELETE FROM events 
WHERE client_id IN (
  SELECT id FROM clients 
  WHERE company_id LIKE '%_test' 
     OR company_id = 'biz_test_demo'
);

-- Delete entities (students) for test clients
DELETE FROM entities 
WHERE client_id IN (
  SELECT id FROM clients 
  WHERE company_id LIKE '%_test' 
     OR company_id = 'biz_test_demo'
);

-- Finally, delete the test clients themselves
DELETE FROM clients 
WHERE company_id LIKE '%_test' 
   OR company_id = 'biz_test_demo';

-- Verify cleanup
SELECT 'Remaining clients:' as info;
SELECT company_id, id, current_tier, created_at 
FROM clients 
ORDER BY created_at DESC;

SELECT 'Cleanup complete!' as status;
