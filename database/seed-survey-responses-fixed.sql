/**
 * Survey Response Test Simulation for Real Estate Course (FIXED)
 * Simulates 62% of 250 students (155 students) completing the Course Feedback Form
 * 
 * Metrics:
 * - Average Rating: 4.2/5
 * - Recommendation Rate: 82%
 * - Participation Rate: 62%
 */

-- Add comprehensive survey responses to existing form submissions
-- Assumes you've already run seed-real-estate-simple.sql

-- Clear existing submissions for fresh data (optional)
DELETE FROM form_submissions WHERE form_id = 'd1e84000-e29b-41d4-a716-446655440001';

-- Generate 155 realistic survey responses (62% of 250 students)
WITH survey_respondents AS (
  SELECT 
    e.id as entity_id,
    ROW_NUMBER() OVER (ORDER BY random()) as response_num
  FROM entities e
  WHERE e.client_id = 'c1e84000-e29b-41d4-a716-446655440001'
  ORDER BY random()
  LIMIT 155
),
response_data AS (
  SELECT 
    sr.entity_id,
    sr.response_num,
    -- Rating: weighted towards positive (4-5 stars = 82%)
    CASE 
      WHEN random() < 0.42 THEN 5  -- 42% give 5 stars
      WHEN random() < 0.74 THEN 4  -- 32% give 4 stars (total 74% positive)
      WHEN random() < 0.92 THEN 3  -- 18% give 3 stars
      WHEN random() < 0.97 THEN 2  -- 5% give 2 stars
      ELSE 1                        -- 3% give 1 star
    END as rating,
    -- What they liked most (weighted distribution) - FIXED SYNTAX
    CASE 
      WHEN floor(random() * 10) IN (0, 1) THEN 'Learning how to find good deals'
      WHEN floor(random() * 10) IN (2, 3) THEN 'Deal structuring section'
      WHEN floor(random() * 10) = 4 THEN 'Renovation budgeting tips'
      WHEN floor(random() * 10) = 5 THEN 'Sales negotiation examples'
      WHEN floor(random() * 10) IN (6, 7) THEN 'Instructor clarity and flow'
      WHEN floor(random() * 10) IN (8, 9) THEN 'Step-by-step process breakdown'
      ELSE 'Deal structuring section'  -- default fallback
    END as liked_most,
    -- Recommendation level (82% positive recommendation rate)
    CASE 
      WHEN random() < 0.52 THEN 'Definitely'      -- 52%
      WHEN random() < 0.82 THEN 'Probably'        -- 30% (total 82% positive)
      WHEN random() < 0.94 THEN 'Not sure'        -- 12%
      WHEN random() < 0.98 THEN 'Probably not'    -- 4%
      ELSE 'Definitely not'                        -- 2%
    END as recommendation,
    -- Additional feedback (realistic real estate comments)
    CASE floor(random() * 20)
      WHEN 0 THEN 'The ARV calculation examples were incredibly helpful for my first deal'
      WHEN 1 THEN 'I wish there were more videos on contractor management'
      WHEN 2 THEN 'The 70% rule changed how I evaluate wholesale opportunities'
      WHEN 3 THEN 'More content on commercial real estate would be great'
      WHEN 4 THEN 'The renovation budget spreadsheets are pure gold'
      WHEN 5 THEN 'Would love to see more on creative financing strategies'
      WHEN 6 THEN 'The case studies were the most valuable part for me'
      WHEN 7 THEN 'Excellent course - already analyzing my first rental property'
      WHEN 8 THEN 'The negotiation tactics helped me get 15% below asking price'
      WHEN 9 THEN 'More examples from different markets would be helpful'
      WHEN 10 THEN 'The BRRRR method explanation was crystal clear'
      WHEN 11 THEN 'I applied the deal analysis framework immediately'
      WHEN 12 THEN 'The community forum is incredibly supportive'
      WHEN 13 THEN 'Would like more content on property management'
      WHEN 14 THEN 'The course exceeded my expectations completely'
      WHEN 15 THEN 'Market analysis section needs more depth'
      WHEN 16 THEN 'Great practical content, very actionable'
      WHEN 17 THEN 'The seller financing module opened new opportunities'
      WHEN 18 THEN 'More live Q&A sessions would be amazing'
      ELSE 'Solid course, helps me evaluate deals with confidence'
    END as additional_feedback,
    -- Confidence level (1-5, avg 4.1)
    CASE 
      WHEN random() < 0.38 THEN 5
      WHEN random() < 0.76 THEN 4
      WHEN random() < 0.92 THEN 3
      ELSE 2
    END as confidence_level,
    -- Timestamp within last 14 days
    NOW() - (random() * INTERVAL '14 days') as submitted_at
  FROM survey_respondents sr
)
INSERT INTO form_submissions (id, form_id, entity_id, client_id, responses, submitted_at)
SELECT 
  gen_random_uuid(),
  'd1e84000-e29b-41d4-a716-446655440001'::uuid,  -- Deal Structuring Feedback form
  rd.entity_id,
  'c1e84000-e29b-41d4-a716-446655440001'::uuid,
  jsonb_build_object(
    'confidence', rd.rating,
    'best_lesson', rd.liked_most,
    'improvement', rd.additional_feedback,
    'recommendation', rd.recommendation,
    'confidence_level', rd.confidence_level,
    'timestamp', rd.submitted_at
  ),
  rd.submitted_at
FROM response_data rd;

-- Also add form_submission events for each response
WITH survey_respondents AS (
  SELECT 
    fs.entity_id,
    fs.responses,
    fs.submitted_at
  FROM form_submissions fs
  WHERE fs.form_id = 'd1e84000-e29b-41d4-a716-446655440001'
    AND fs.client_id = 'c1e84000-e29b-41d4-a716-446655440001'
)
INSERT INTO events (id, client_id, entity_id, event_type, event_data, created_at)
SELECT 
  gen_random_uuid(),
  'c1e84000-e29b-41d4-a716-446655440001'::uuid,
  sr.entity_id,
  'form_submission',
  jsonb_build_object(
    'form_name', 'Course Feedback Survey',
    'form_id', 'd1e84000-e29b-41d4-a716-446655440001',
    'rating', (sr.responses->>'confidence')::int,
    'recommendation', sr.responses->>'recommendation',
    'sentiment', CASE 
      WHEN (sr.responses->>'confidence')::int >= 4 THEN 'positive'
      WHEN (sr.responses->>'confidence')::int = 3 THEN 'neutral'
      ELSE 'negative'
    END
  ),
  sr.submitted_at
FROM survey_respondents sr;

-- ==================== ANALYTICS SUMMARY ====================
-- Show the survey metrics
WITH survey_stats AS (
  SELECT 
    COUNT(*) as total_responses,
    ROUND(AVG((responses->>'confidence')::numeric), 2) as avg_rating,
    ROUND(
      COUNT(*) FILTER (WHERE responses->>'recommendation' IN ('Definitely', 'Probably'))::numeric / 
      COUNT(*)::numeric * 100, 
      1
    ) as recommendation_rate,
    COUNT(*) FILTER (WHERE (responses->>'confidence')::int >= 4) as positive_ratings,
    COUNT(*) FILTER (WHERE (responses->>'confidence')::int = 3) as neutral_ratings,
    COUNT(*) FILTER (WHERE (responses->>'confidence')::int <= 2) as negative_ratings
  FROM form_submissions
  WHERE form_id = 'd1e84000-e29b-41d4-a716-446655440001'
    AND client_id = 'c1e84000-e29b-41d4-a716-446655440001'
)
SELECT 
  '📊 Survey Response Simulation Complete!' as status,
  total_responses as responses,
  250 as total_students,
  ROUND((total_responses::numeric / 250) * 100, 1) || '%' as participation_rate,
  avg_rating || '/5' as average_rating,
  recommendation_rate || '%' as recommend_rate,
  positive_ratings || ' positive' as rating_breakdown_positive,
  neutral_ratings || ' neutral' as rating_breakdown_neutral,
  negative_ratings || ' negative' as rating_breakdown_negative
FROM survey_stats;

-- Show top "liked most" responses
SELECT 
  responses->>'best_lesson' as liked_most,
  COUNT(*) as count,
  ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM form_submissions WHERE form_id = 'd1e84000-e29b-41d4-a716-446655440001')::numeric * 100, 1) || '%' as percentage
FROM form_submissions
WHERE form_id = 'd1e84000-e29b-41d4-a716-446655440001'
  AND client_id = 'c1e84000-e29b-41d4-a716-446655440001'
GROUP BY responses->>'best_lesson'
ORDER BY count DESC;

-- Show recommendation distribution
SELECT 
  responses->>'recommendation' as recommendation,
  COUNT(*) as count,
  ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM form_submissions WHERE form_id = 'd1e84000-e29b-41d4-a716-446655440001')::numeric * 100, 1) || '%' as percentage
FROM form_submissions
WHERE form_id = 'd1e84000-e29b-41d4-a716-446655440001'
  AND client_id = 'c1e84000-e29b-41d4-a716-446655440001'
GROUP BY responses->>'recommendation'
ORDER BY 
  CASE responses->>'recommendation'
    WHEN 'Definitely' THEN 1
    WHEN 'Probably' THEN 2
    WHEN 'Not sure' THEN 3
    WHEN 'Probably not' THEN 4
    WHEN 'Definitely not' THEN 5
  END;


