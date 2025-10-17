-- NUCLEAR CLEANUP - Remove ALL test data
-- This will delete everything except your actual company (biz_3GYHNPbGkZCEky)

-- First, let's see what companies exist
SELECT 'BEFORE CLEANUP - Companies in database:' as status;
SELECT company_id, current_tier, created_at FROM clients ORDER BY created_at;

-- Delete ALL data except for your actual company
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

-- Also clean up any AI-related test data
DELETE FROM ai_text_pool WHERE client_id NOT IN (
  SELECT id FROM clients WHERE company_id = 'biz_3GYHNPbGkZCEky'
);

DELETE FROM ai_runs WHERE client_id NOT IN (
  SELECT id FROM clients WHERE company_id = 'biz_3GYHNPbGkZCEky'
);

-- Show what's left (should only be your company)
SELECT 'AFTER CLEANUP - Remaining companies:' as status;
SELECT company_id, current_tier, created_at FROM clients ORDER BY created_at;

-- Show data counts for your company
SELECT 'YOUR COMPANY DATA:' as status;
SELECT 
  (SELECT COUNT(*) FROM entities WHERE client_id IN (SELECT id FROM clients WHERE company_id = 'biz_3GYHNPbGkZCEky')) as students,
  (SELECT COUNT(*) FROM insights WHERE client_id IN (SELECT id FROM clients WHERE company_id = 'biz_3GYHNPbGkZCEky')) as insights,
  (SELECT COUNT(*) FROM events WHERE client_id IN (SELECT id FROM clients WHERE company_id = 'biz_3GYHNPbGkZCEky')) as events,
  (SELECT COUNT(*) FROM form_submissions WHERE client_id IN (SELECT id FROM clients WHERE company_id = 'biz_3GYHNPbGkZCEky')) as form_responses;


