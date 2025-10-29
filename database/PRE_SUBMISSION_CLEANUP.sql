-- ============================================
-- WHOP APP STORE PRE-SUBMISSION CLEANUP
-- ============================================
-- Created: October 29, 2025
-- Purpose: Remove ALL test data before app submission
-- WARNING: This is IRREVERSIBLE - backup database first!
-- ============================================

-- STEP 0: BACKUP VERIFICATION
-- Run this FIRST to see what will be deleted:
SELECT 
  'clients' as table_name, 
  COUNT(*) as test_records,
  array_agg(DISTINCT company_id) as test_company_ids
FROM clients 
WHERE company_id LIKE '%test%' 
   OR company_id LIKE '%demo%'
   OR company_id = 'biz_Jkhjc11f6HHRxh'
   OR test_data = true
UNION ALL
SELECT 
  'entities', 
  COUNT(*),
  array_agg(DISTINCT company_id)
FROM entities 
WHERE company_id LIKE '%test%' 
   OR company_id LIKE '%demo%'
   OR company_id = 'biz_Jkhjc11f6HHRxh'
UNION ALL
SELECT 
  'subscriptions', 
  COUNT(*),
  array_agg(DISTINCT company_id)
FROM subscriptions 
WHERE company_id LIKE '%test%' 
   OR company_id LIKE '%demo%'
   OR company_id = 'biz_Jkhjc11f6HHRxh';

-- ============================================
-- STEP 1: DELETE TEST CLIENTS
-- ============================================
DELETE FROM clients 
WHERE company_id LIKE '%test%' 
   OR company_id LIKE '%demo%'
   OR company_id = 'biz_Jkhjc11f6HHRxh'
   OR test_data = true;

-- ============================================
-- STEP 2: DELETE TEST ENTITIES (students, memberships)
-- ============================================
DELETE FROM entities 
WHERE company_id LIKE '%test%' 
   OR company_id LIKE '%demo%'
   OR company_id = 'biz_Jkhjc11f6HHRxh';

-- ============================================
-- STEP 3: DELETE TEST EVENTS
-- ============================================
DELETE FROM events 
WHERE company_id LIKE '%test%' 
   OR company_id LIKE '%demo%'
   OR company_id = 'biz_Jkhjc11f6HHRxh';

-- ============================================
-- STEP 4: DELETE TEST SUBSCRIPTIONS
-- ============================================
DELETE FROM subscriptions 
WHERE company_id LIKE '%test%' 
   OR company_id LIKE '%demo%'
   OR company_id = 'biz_Jkhjc11f6HHRxh';

-- ============================================
-- STEP 5: DELETE TEST FORM SUBMISSIONS
-- ============================================
DELETE FROM form_submissions 
WHERE company_id LIKE '%test%' 
   OR company_id LIKE '%demo%'
   OR company_id = 'biz_Jkhjc11f6HHRxh';

-- ============================================
-- STEP 6: DELETE TEST FORM TEMPLATES
-- ============================================
-- Keep global niche templates (is_template = true)
-- Only delete company-specific test forms
DELETE FROM form_templates 
WHERE (company_id LIKE '%test%' 
   OR company_id LIKE '%demo%'
   OR company_id = 'biz_Jkhjc11f6HHRxh')
   AND is_template = false;

-- ============================================
-- STEP 7: DELETE TEST INSIGHTS
-- ============================================
DELETE FROM insights 
WHERE company_id LIKE '%test%' 
   OR company_id LIKE '%demo%'
   OR company_id = 'biz_Jkhjc11f6HHRxh';

-- ============================================
-- STEP 8: DELETE TEST AI RUNS
-- ============================================
DELETE FROM ai_runs 
WHERE company_id LIKE '%test%' 
   OR company_id LIKE '%demo%'
   OR company_id = 'biz_Jkhjc11f6HHRxh';

-- ============================================
-- STEP 9: VERIFY CLEANUP COMPLETE
-- ============================================
-- All counts should be 0 for test data
SELECT 
  'Test Clients Remaining' as check_name, 
  COUNT(*) as count 
FROM clients
WHERE company_id LIKE '%test%' 
   OR company_id LIKE '%demo%'
   OR company_id = 'biz_Jkhjc11f6HHRxh'
UNION ALL
SELECT 'Test Entities', COUNT(*) FROM entities
WHERE company_id LIKE '%test%' 
   OR company_id LIKE '%demo%'
   OR company_id = 'biz_Jkhjc11f6HHRxh'
UNION ALL
SELECT 'Test Events', COUNT(*) FROM events
WHERE company_id LIKE '%test%' 
   OR company_id LIKE '%demo%'
   OR company_id = 'biz_Jkhjc11f6HHRxh'
UNION ALL
SELECT 'Test Subscriptions', COUNT(*) FROM subscriptions
WHERE company_id LIKE '%test%' 
   OR company_id LIKE '%demo%'
   OR company_id = 'biz_Jkhjc11f6HHRxh'
UNION ALL
SELECT 'Test Forms', COUNT(*) FROM form_templates 
WHERE (company_id LIKE '%test%' 
   OR company_id LIKE '%demo%'
   OR company_id = 'biz_Jkhjc11f6HHRxh')
   AND is_template = false
UNION ALL
SELECT 'Test Insights', COUNT(*) FROM insights
WHERE company_id LIKE '%test%' 
   OR company_id LIKE '%demo%'
   OR company_id = 'biz_Jkhjc11f6HHRxh';

-- ============================================
-- STEP 10: PRODUCTION DATA SUMMARY
-- ============================================
-- Verify legitimate production data still exists
SELECT 
  'Production Clients' as data_type,
  COUNT(*) as count
FROM clients
WHERE company_id NOT LIKE '%test%' 
  AND company_id NOT LIKE '%demo%'
  AND company_id != 'biz_Jkhjc11f6HHRxh'
UNION ALL
SELECT 'Production Entities', COUNT(*) FROM entities
WHERE company_id NOT LIKE '%test%' 
  AND company_id NOT LIKE '%demo%'
  AND company_id != 'biz_Jkhjc11f6HHRxh'
UNION ALL
SELECT 'Niche Templates (Keep)', COUNT(*) FROM form_templates 
WHERE is_template = true;

-- ============================================
-- INSTRUCTIONS:
-- ============================================
-- 1. BACKUP DATABASE FIRST (Supabase Dashboard → Database → Backup)
-- 2. Run STEP 0 (verification) to see what will be deleted
-- 3. If counts look correct, run STEPS 1-8 in order
-- 4. Run STEP 9 to verify all test data removed
-- 5. Run STEP 10 to ensure production data intact
-- 6. Test app still loads without errors
-- ============================================

