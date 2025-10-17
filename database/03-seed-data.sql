-- ============================================================================
-- SAMPLE SEED DATA FOR TESTING
-- ============================================================================
-- Run this THIRD (optional) after 01-schema.sql and 02-rls-policies.sql
-- This provides sample data for testing and development
-- DO NOT run this in production!
-- ============================================================================

-- ============================================================================
-- SAMPLE CLIENT (Creator)
-- ============================================================================

INSERT INTO clients (id, whop_user_id, company_id, email, name, subscription_tier)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'user_sample123', 'comp_sample456', 'creator@example.com', 'John Creator', 'pro')
ON CONFLICT (whop_user_id) DO NOTHING;

-- ============================================================================
-- SAMPLE STUDENTS/ENTITIES
-- ============================================================================

INSERT INTO entities (id, client_id, whop_user_id, email, name, metadata)
VALUES 
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'student_001', 'student1@example.com', 'Alice Student', '{"course": "Web Development", "progress": 75}'::jsonb),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'student_002', 'student2@example.com', 'Bob Learner', '{"course": "Web Development", "progress": 45}'::jsonb),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'student_003', 'student3@example.com', 'Carol User', '{"course": "Marketing", "progress": 90}'::jsonb),
  ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'student_004', 'student4@example.com', 'David Member', '{"course": "Design", "progress": 30}'::jsonb)
ON CONFLICT (client_id, whop_user_id) DO NOTHING;

-- ============================================================================
-- SAMPLE SUBSCRIPTIONS
-- ============================================================================

INSERT INTO subscriptions (id, client_id, entity_id, whop_subscription_id, plan_id, status, amount, currency, started_at, expires_at)
VALUES 
  ('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440001', 'sub_001', 'plan_premium', 'active', 99.99, 'USD', NOW() - INTERVAL '30 days', NOW() + INTERVAL '335 days'),
  ('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440002', 'sub_002', 'plan_basic', 'active', 49.99, 'USD', NOW() - INTERVAL '15 days', NOW() + INTERVAL '350 days'),
  ('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440003', 'sub_003', 'plan_premium', 'active', 99.99, 'USD', NOW() - INTERVAL '60 days', NOW() + INTERVAL '305 days'),
  ('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440004', 'sub_004', 'plan_basic', 'cancelled', 49.99, 'USD', NOW() - INTERVAL '90 days', NOW() - INTERVAL '10 days')
ON CONFLICT (whop_subscription_id) DO NOTHING;

-- ============================================================================
-- SAMPLE EVENTS
-- ============================================================================

INSERT INTO events (client_id, entity_id, event_type, event_data, whop_event_id)
VALUES 
  -- Orders
  ('550e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440001', 'order', '{"amount": 99.99, "product": "Premium Course", "status": "completed"}'::jsonb, 'evt_order_001'),
  ('550e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440002', 'order', '{"amount": 49.99, "product": "Basic Course", "status": "completed"}'::jsonb, 'evt_order_002'),
  
  -- Subscription events
  ('550e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440001', 'subscription', '{"action": "started", "plan": "Premium"}'::jsonb, 'evt_sub_001'),
  ('550e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440004', 'subscription', '{"action": "cancelled", "plan": "Basic"}'::jsonb, 'evt_sub_002'),
  
  -- Activity events
  ('550e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440001', 'activity', '{"action": "course_completed", "course": "Module 5", "duration": 3600}'::jsonb, NULL),
  ('550e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440002', 'activity', '{"action": "lesson_viewed", "lesson": "Introduction", "duration": 1200}'::jsonb, NULL),
  ('550e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440003', 'activity', '{"action": "course_completed", "course": "Module 10", "duration": 4200}'::jsonb, NULL);

-- ============================================================================
-- SAMPLE FORMS
-- ============================================================================

INSERT INTO form_templates (id, client_id, name, description, fields, is_active)
VALUES 
  ('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Course Feedback Form', 'Collect student feedback on courses', 
   '[
     {"id": "q1", "label": "How would you rate the course?", "type": "rating", "required": true},
     {"id": "q2", "label": "What did you like most?", "type": "textarea", "required": true, "placeholder": "Share your thoughts..."},
     {"id": "q3", "label": "Would you recommend this course?", "type": "multiple_choice", "required": true, "options": ["Definitely", "Probably", "Not sure", "Probably not", "Definitely not"]}
   ]'::jsonb, 
   true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO form_submissions (form_id, entity_id, client_id, responses)
VALUES 
  ('850e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 
   '{"q1": 5, "q2": "The practical examples were excellent!", "q3": "Definitely"}'::jsonb),
  ('850e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 
   '{"q1": 4, "q2": "Good structure and pacing", "q3": "Probably"}'::jsonb),
  ('850e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 
   '{"q1": 5, "q2": "Best investment I made this year", "q3": "Definitely"}'::jsonb);

-- ============================================================================
-- SAMPLE AI INSIGHTS
-- ============================================================================

INSERT INTO insights (client_id, insight_type, title, content, metadata, severity)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'weekly_summary', 'Weekly Performance Summary', 
   'This week, you had 12 new students enroll, generating $1,249 in revenue. Student engagement is up 23% compared to last week. Your Premium plan has a 78% completion rate.', 
   '{"revenue": 1249, "new_students": 12, "engagement_increase": 23}'::jsonb, 'info'),
  
  ('550e8400-e29b-41d4-a716-446655440000', 'recommendation', 'Improve Student Retention', 
   'Analysis shows that students who complete the first 3 modules are 4x more likely to finish the course. Consider adding a milestone badge or bonus content after Module 3 to increase motivation.', 
   '{"type": "retention", "confidence": 0.85}'::jsonb, 'info'),
  
  ('550e8400-e29b-41d4-a716-446655440000', 'alert', 'Drop-off Alert', 
   'Notice: 15% of students are dropping off after Module 4. This is higher than your average. Consider reviewing the content difficulty or adding more support resources.', 
   '{"module": 4, "drop_off_rate": 0.15}'::jsonb, 'warning'),
  
  ('550e8400-e29b-41d4-a716-446655440000', 'trend', 'Growing Trend Detected', 
   'Your Design course enrollments have increased 45% over the past month. This is your fastest-growing offering. Consider creating advanced content or a follow-up course.', 
   '{"course": "Design", "growth_rate": 0.45}'::jsonb, 'info');

-- ============================================================================
-- SAMPLE AI TEXT POOL (for AI analysis)
-- ============================================================================

INSERT INTO ai_text_pool (client_id, text, source, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'The course is great but I wish there were more practice exercises', 'form_submission', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440000', 'Videos are high quality and easy to follow', 'form_submission', NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440000', 'Sometimes the pacing feels too fast', 'form_submission', NOW() - INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440000', 'I love the community support in this course', 'form_submission', NOW() - INTERVAL '4 days'),
('550e8400-e29b-41d4-a716-446655440000', 'Could use more real-world examples', 'form_submission', NOW() - INTERVAL '5 days'),
('550e8400-e29b-41d4-a716-446655440000', 'The explanations are very clear', 'form_submission', NOW() - INTERVAL '6 days'),
('550e8400-e29b-41d4-a716-446655440000', 'I wish there were more quizzes to test my knowledge', 'form_submission', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440000', 'Amazing content, well structured', 'form_submission', NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440000', 'Would be nice to have downloadable resources', 'form_submission', NOW() - INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440000', 'The instructor is very knowledgeable', 'form_submission', NOW() - INTERVAL '4 days'),
('550e8400-e29b-41d4-a716-446655440000', 'Some videos take a while to load', 'form_submission', NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440000', 'Best course I have taken on this topic', 'form_submission', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440000', 'Need more advanced topics covered', 'form_submission', NOW() - INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440000', 'The community is very helpful', 'form_submission', NOW() - INTERVAL '5 days'),
('550e8400-e29b-41d4-a716-446655440000', 'Would love a mobile app version', 'form_submission', NOW() - INTERVAL '6 days');

-- ============================================================================
-- SAMPLE AI RUNS (for tracking)
-- ============================================================================

INSERT INTO ai_runs (client_id, run_type, status, finished_at, meta) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'insight_generation', 'completed', NOW() - INTERVAL '1 day', '{"range": "week", "insights_count": 3}'::jsonb),
('550e8400-e29b-41d4-a716-446655440000', 'anomaly_detection', 'completed', NOW() - INTERVAL '2 days', '{"anomalies_found": 0}'::jsonb),
('550e8400-e29b-41d4-a716-446655440000', 'insight_generation', 'completed', NOW() - INTERVAL '3 days', '{"range": "month", "insights_count": 5}'::jsonb);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Count records in each table
SELECT 'clients' as table_name, COUNT(*) as count FROM clients
UNION ALL
SELECT 'entities', COUNT(*) FROM entities
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM subscriptions
UNION ALL
SELECT 'events', COUNT(*) FROM events
UNION ALL
SELECT 'form_templates', COUNT(*) FROM form_templates
UNION ALL
SELECT 'form_submissions', COUNT(*) FROM form_submissions
UNION ALL
SELECT 'insights', COUNT(*) FROM insights
UNION ALL
SELECT 'ai_text_pool', COUNT(*) FROM ai_text_pool
UNION ALL
SELECT 'ai_runs', COUNT(*) FROM ai_runs
ORDER BY table_name;

