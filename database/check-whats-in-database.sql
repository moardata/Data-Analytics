-- Check what's actually in your database
-- Run this to see what companies and data exist

-- 1. Show all companies
SELECT 'ALL COMPANIES IN DATABASE:' as info;
SELECT company_id, current_tier, created_at FROM clients ORDER BY created_at;

-- 2. Show data counts per company
SELECT 'DATA COUNTS PER COMPANY:' as info;
SELECT 
  c.company_id,
  c.current_tier,
  c.created_at,
  COUNT(DISTINCT e.id) as students,
  COUNT(DISTINCT i.id) as insights,
  COUNT(DISTINCT ev.id) as events,
  COUNT(DISTINCT fs.id) as form_responses
FROM clients c
LEFT JOIN entities e ON e.client_id = c.id
LEFT JOIN insights i ON i.client_id = c.id
LEFT JOIN events ev ON ev.client_id = c.id
LEFT JOIN form_submissions fs ON fs.client_id = c.id
GROUP BY c.company_id, c.current_tier, c.created_at
ORDER BY c.created_at;

-- 3. Show recent insights (to see what's showing up)
SELECT 'RECENT INSIGHTS:' as info;
SELECT 
  c.company_id,
  i.title,
  i.created_at
FROM insights i
JOIN clients c ON c.id = i.client_id
ORDER BY i.created_at DESC
LIMIT 10;

-- 4. Show recent entities (students)
SELECT 'RECENT STUDENTS:' as info;
SELECT 
  c.company_id,
  e.name,
  e.email,
  e.created_at
FROM entities e
JOIN clients c ON c.id = e.client_id
ORDER BY e.created_at DESC
LIMIT 10;
