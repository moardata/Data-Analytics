-- Cleanup Seed Data for Multi-Tenancy
-- This removes test data that interferes with proper multi-tenancy

-- Delete seed data for the test company ID
DELETE FROM insights WHERE client_id IN (
  SELECT id FROM clients WHERE company_id = 'comp_sample456'
);

DELETE FROM form_submissions WHERE client_id IN (
  SELECT id FROM clients WHERE company_id = 'comp_sample456'
);

DELETE FROM form_templates WHERE client_id IN (
  SELECT id FROM clients WHERE company_id = 'comp_sample456'
);

DELETE FROM events WHERE client_id IN (
  SELECT id FROM clients WHERE company_id = 'comp_sample456'
);

DELETE FROM subscriptions WHERE client_id IN (
  SELECT id FROM clients WHERE company_id = 'comp_sample456'
);

DELETE FROM entities WHERE client_id IN (
  SELECT id FROM clients WHERE company_id = 'comp_sample456'
);

DELETE FROM clients WHERE company_id = 'comp_sample456';

-- Also clean up any other test data
DELETE FROM insights WHERE client_id IN (
  SELECT id FROM clients WHERE company_id LIKE 'biz_test%'
);

DELETE FROM form_submissions WHERE client_id IN (
  SELECT id FROM clients WHERE company_id LIKE 'biz_test%'
);

DELETE FROM form_templates WHERE client_id IN (
  SELECT id FROM clients WHERE company_id LIKE 'biz_test%'
);

DELETE FROM events WHERE client_id IN (
  SELECT id FROM clients WHERE company_id LIKE 'biz_test%'
);

DELETE FROM subscriptions WHERE client_id IN (
  SELECT id FROM clients WHERE company_id LIKE 'biz_test%'
);

DELETE FROM entities WHERE client_id IN (
  SELECT id FROM clients WHERE company_id LIKE 'biz_test%'
);

DELETE FROM clients WHERE company_id LIKE 'biz_test%';

-- Show remaining clients to verify cleanup
SELECT company_id, current_tier, created_at FROM clients ORDER BY created_at;


