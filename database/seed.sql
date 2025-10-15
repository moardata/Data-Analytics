-- Seed Data for Creator Analytics MVP
-- This provides sample data for testing and development

-- Insert a sample client (creator)
INSERT INTO clients (id, whop_user_id, company_id, email, name, subscription_tier)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'user_sample123', 'comp_sample456', 'creator@example.com', 'John Creator', 'pro')
ON CONFLICT (whop_user_id) DO NOTHING;

-- Insert sample students/entities
INSERT INTO entities (id, client_id, whop_user_id, email, name, metadata)
VALUES 
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'student_001', 'student1@example.com', 'Alice Student', '{"course": "Web Development", "progress": 75}'::jsonb),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'student_002', 'student2@example.com', 'Bob Learner', '{"course": "Web Development", "progress": 45}'::jsonb),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'student_003', 'student3@example.com', 'Carol User', '{"course": "Marketing", "progress": 90}'::jsonb),
  ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'student_004', 'student4@example.com', 'David Member', '{"course": "Design", "progress": 30}'::jsonb)
ON CONFLICT (client_id, whop_user_id) DO NOTHING;

-- Insert sample subscriptions
INSERT INTO subscriptions (id, client_id, entity_id, whop_subscription_id, plan_id, status, amount, currency, started_at, expires_at)
VALUES 
  ('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440001', 'sub_001', 'plan_premium', 'active', 99.99, 'USD', NOW() - INTERVAL '30 days', NOW() + INTERVAL '335 days'),
  ('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440002', 'sub_002', 'plan_basic', 'active', 49.99, 'USD', NOW() - INTERVAL '15 days', NOW() + INTERVAL '350 days'),
  ('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440003', 'sub_003', 'plan_premium', 'active', 99.99, 'USD', NOW() - INTERVAL '60 days', NOW() + INTERVAL '305 days'),
  ('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440004', 'sub_004', 'plan_basic', 'cancelled', 49.99, 'USD', NOW() - INTERVAL '90 days', NOW() - INTERVAL '10 days')
ON CONFLICT (whop_subscription_id) DO NOTHING;

-- Insert sample events (orders, subscriptions, activities)
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

-- Insert sample form template
INSERT INTO form_templates (id, client_id, name, description, fields, is_active)
VALUES 
  ('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Course Feedback Form', 'Collect student feedback on courses', 
   '[
     {"id": "q1", "label": "How would you rate the course?", "type": "rating", "required": true},
     {"id": "q2", "label": "What did you like most?", "type": "textarea", "required": true, "placeholder": "Share your thoughts..."},
     {"id": "q3", "label": "Would you recommend this course?", "type": "multiple_choice", "required": true, "options": ["Definitely", "Probably", "Not sure", "Probably not", "Definitely not"]}
   ]'::jsonb, 
   true);

-- Insert sample form submissions
INSERT INTO form_submissions (form_id, entity_id, client_id, responses)
VALUES 
  ('850e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 
   '{"q1": 5, "q2": "The practical examples were excellent!", "q3": "Definitely"}'::jsonb),
  ('850e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 
   '{"q1": 4, "q2": "Good structure and pacing", "q3": "Probably"}'::jsonb);

-- Insert sample AI insights
INSERT INTO insights (client_id, insight_type, title, content, metadata)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'weekly_summary', 'Weekly Performance Summary', 
   'This week, you had 12 new students enroll, generating $1,249 in revenue. Student engagement is up 23% compared to last week. Your Premium plan has a 78% completion rate.', 
   '{"revenue": 1249, "new_students": 12, "engagement_increase": 23}'::jsonb),
  
  ('550e8400-e29b-41d4-a716-446655440000', 'recommendation', 'Improve Student Retention', 
   'Analysis shows that students who complete the first 3 modules are 4x more likely to finish the course. Consider adding a milestone badge or bonus content after Module 3 to increase motivation.', 
   '{"type": "retention", "confidence": 0.85}'::jsonb),
  
  ('550e8400-e29b-41d4-a716-446655440000', 'alert', 'Drop-off Alert', 
   'Notice: 15% of students are dropping off after Module 4. This is higher than your average. Consider reviewing the content difficulty or adding more support resources.', 
   '{"module": 4, "drop_off_rate": 0.15}'::jsonb),
  
  ('550e8400-e29b-41d4-a716-446655440000', 'trend', 'Growing Trend Detected', 
   'Your Design course enrollments have increased 45% over the past month. This is your fastest-growing offering. Consider creating advanced content or a follow-up course.', 
   '{"course": "Design", "growth_rate": 0.45}'::jsonb);


