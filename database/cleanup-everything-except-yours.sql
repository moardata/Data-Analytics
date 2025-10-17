-- Clean up EVERYTHING except your actual company
-- This will remove all test data and only keep your real company

-- First, let's see what companies exist
SELECT company_id, current_tier, created_at FROM clients ORDER BY created_at;

-- Delete ALL data except for your actual company (biz_3GYHNPbGkZCEky)
DELETE FROM insights WHERE client_id NOT IN (
  SELECT id FROM clients WHERE company_id = 'biz_3GYHNPbGkZCEky'
);

DELETE FROM form_submissions WHERE client_id NOT IN (
  SELECT id FROM clients WHERE company_id = 'biz_3GYHNPbGkZCEky'
);

DELETE FROM form_templates WHERE client_id NOT IN (
  SELECT id FROM clients WHERE company_id = 'biz_3GYHNPbGkZCEky'
);

DELETE FROM events WHERE client_id NOT IN (
  SELECT id FROM clients WHERE company_id = 'biz_3GYHNPbGkZCEky'
);

DELETE FROM subscriptions WHERE client_id NOT IN (
  SELECT id FROM clients WHERE company_id = 'biz_3GYHNPbGkZCEky'
);

DELETE FROM entities WHERE client_id NOT IN (
  SELECT id FROM clients WHERE company_id = 'biz_3GYHNPbGkZCEky'
);

-- Delete all clients except yours
DELETE FROM clients WHERE company_id != 'biz_3GYHNPbGkZCEky';

-- Show what's left (should only be your company)
SELECT company_id, current_tier, created_at FROM clients;


