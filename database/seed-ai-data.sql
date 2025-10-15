/**
 * AI System Seed Data
 * Sample feedback and responses for testing AI insights
 */

-- Add sample text to ai_text_pool
INSERT INTO ai_text_pool (client_id, text, source, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'The course is great but I wish there were more practice exercises', 'form_submission', now() - interval '1 day'),
('550e8400-e29b-41d4-a716-446655440000', 'Videos are high quality and easy to follow', 'form_submission', now() - interval '2 days'),
('550e8400-e29b-41d4-a716-446655440000', 'Sometimes the pacing feels too fast', 'form_submission', now() - interval '3 days'),
('550e8400-e29b-41d4-a716-446655440000', 'I love the community support in this course', 'form_submission', now() - interval '4 days'),
('550e8400-e29b-41d4-a716-446655440000', 'Could use more real-world examples', 'form_submission', now() - interval '5 days'),
('550e8400-e29b-41d4-a716-446655440000', 'The explanations are very clear', 'form_submission', now() - interval '6 days'),
('550e8400-e29b-41d4-a716-446655440000', 'I wish there were more quizzes to test my knowledge', 'form_submission', now() - interval '1 day'),
('550e8400-e29b-41d4-a716-446655440000', 'Amazing content, well structured', 'form_submission', now() - interval '2 days'),
('550e8400-e29b-41d4-a716-446655440000', 'Would be nice to have downloadable resources', 'form_submission', now() - interval '3 days'),
('550e8400-e29b-41d4-a716-446655440000', 'The instructor is very knowledgeable', 'form_submission', now() - interval '4 days'),
('550e8400-e29b-41d4-a716-446655440000', 'Some videos take a while to load', 'form_submission', now() - interval '2 days'),
('550e8400-e29b-41d4-a716-446655440000', 'Best course I have taken on this topic', 'form_submission', now() - interval '1 day'),
('550e8400-e29b-41d4-a716-446655440000', 'Need more advanced topics covered', 'form_submission', now() - interval '3 days'),
('550e8400-e29b-41d4-a716-446655440000', 'The community is very helpful', 'form_submission', now() - interval '5 days'),
('550e8400-e29b-41d4-a716-446655440000', 'Would love a mobile app version', 'form_submission', now() - interval '6 days');

-- Add more form submissions with responses
INSERT INTO form_submissions (form_template_id, entity_id, client_id, responses) VALUES
(
  (SELECT id FROM form_templates LIMIT 1),
  '650e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  '{"rating": "5", "feedback": "Excellent course structure", "suggestion": "Add more code challenges"}'::jsonb
),
(
  (SELECT id FROM form_templates LIMIT 1),
  '650e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440000',
  '{"rating": "4", "feedback": "Very informative", "suggestion": "Improve video loading speed"}'::jsonb
),
(
  (SELECT id FROM form_templates LIMIT 1),
  '650e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440000',
  '{"rating": "5", "feedback": "Best investment I made", "suggestion": "More live Q&A sessions"}'::jsonb
);

-- Create some AI runs for history
INSERT INTO ai_runs (client_id, run_type, status, finished_at, meta) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'insight_generation', 'completed', now() - interval '1 day', '{"range": "week", "insights_count": 3}'::jsonb),
('550e8400-e29b-41d4-a716-446655440000', 'anomaly_detection', 'completed', now() - interval '2 days', '{"anomalies_found": 0}'::jsonb),
('550e8400-e29b-41d4-a716-446655440000', 'insight_generation', 'completed', now() - interval '3 days', '{"range": "month", "insights_count": 5}'::jsonb);



