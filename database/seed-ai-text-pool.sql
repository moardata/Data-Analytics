/**
 * Seed AI Text Pool with Realistic Feedback
 * Run this in Supabase SQL Editor to populate text for AI analysis
 */

-- First, ensure we have a test client (skip if already exists)
INSERT INTO clients (id, whop_user_id, company_id, email, name, created_at) VALUES ('550e8400-e29b-41d4-a716-446655440000', 'user_test123', 'biz_test123', 'test@example.com', 'Real Estate Academy', now() - interval '30 days') ON CONFLICT (id) DO NOTHING;

-- Populate AI text pool with realistic student feedback
INSERT INTO ai_text_pool (client_id, text, source, created_at) VALUES

-- Positive feedback
('550e8400-e29b-41d4-a716-446655440000', 'This course completely changed my approach to finding investment properties. The Deal Analysis module alone paid for itself!', 'form_submission', now() - interval '2 days'),
('550e8400-e29b-41d4-a716-446655440000', 'Best real estate course I have taken. The instructor explains complex concepts in simple terms. I closed my first deal last month!', 'form_submission', now() - interval '3 days'),
('550e8400-e29b-41d4-a716-446655440000', 'The community support is incredible. Everyone is helpful and the weekly Q&A calls are gold. Worth every penny.', 'form_submission', now() - interval '4 days'),
('550e8400-e29b-41d4-a716-446655440000', 'I love how practical this course is. No fluff, just actionable strategies. Already found 3 potential deals using the techniques taught.', 'form_submission', now() - interval '5 days'),
('550e8400-e29b-41d4-a716-446655440000', 'The negotiation tactics module is brilliant. Used them to get $15k off my first property. This course paid for itself 10x over.', 'form_submission', now() - interval '6 days'),

-- Constructive feedback
('550e8400-e29b-41d4-a716-446655440000', 'Great content overall but the videos could be shorter. Some modules feel too long and I lose focus halfway through.', 'form_submission', now() - interval '3 days'),
('550e8400-e29b-41d4-a716-446655440000', 'Would love to see more case studies of actual deals from start to finish. The theory is great but more real examples would help.', 'form_submission', now() - interval '4 days'),
('550e8400-e29b-41d4-a716-446655440000', 'The course is good but the platform is a bit clunky. Sometimes videos buffer a lot and it breaks my concentration.', 'form_submission', now() - interval '5 days'),
('550e8400-e29b-41d4-a716-446655440000', 'I wish there were more practice exercises. I learn better by doing rather than just watching. Maybe add some quizzes or assignments?', 'form_submission', now() - interval '6 days'),
('550e8400-e29b-41d4-a716-446655440000', 'The pacing is a bit fast for me as a complete beginner. Would appreciate a slower introduction for people with zero real estate experience.', 'form_submission', now() - interval '7 days'),

-- Specific requests
('550e8400-e29b-41d4-a716-446655440000', 'Can you add a module on commercial real estate? I am more interested in that than residential properties.', 'form_submission', now() - interval '4 days'),
('550e8400-e29b-41d4-a716-446655440000', 'Would love to see content about international markets. I am based in Canada and some US-specific advice does not apply here.', 'form_submission', now() - interval '5 days'),
('550e8400-e29b-41d4-a716-446655440000', 'Please add more tax strategy content. The basics are covered but I need advanced tax planning for scaling to 10+ properties.', 'form_submission', now() - interval '6 days'),

-- Technical issues
('550e8400-e29b-41d4-a716-446655440000', 'Tried to download the Deal Analysis spreadsheet but the link is broken. Can someone fix this?', 'form_submission', now() - interval '2 days'),
('550e8400-e29b-41d4-a716-446655440000', 'The mobile app keeps crashing when I try to watch Module 5. Works fine on desktop though.', 'form_submission', now() - interval '3 days'),

-- Mixed feedback
('550e8400-e29b-41d4-a716-446655440000', 'Overall satisfied but I expected more focus on creative financing strategies. The conventional financing section is thorough but I want to learn about seller financing, lease options etc.', 'form_submission', now() - interval '5 days'),
('550e8400-e29b-41d4-a716-446655440000', 'The course is comprehensive but feels overwhelming. Maybe break it into beginner, intermediate, advanced tracks so I know what to focus on first.', 'form_submission', now() - interval '6 days'),

-- Engagement and community
('550e8400-e29b-41d4-a716-446655440000', 'The Facebook group is amazing! I have connected with 5 other investors in my area and we are pooling resources for our first syndication deal.', 'form_submission', now() - interval '3 days'),
('550e8400-e29b-41d4-a716-446655440000', 'Love the monthly masterminds. Hearing from people who are actually doing deals is way more valuable than theory.', 'form_submission', now() - interval '4 days'),
('550e8400-e29b-41d4-a716-446655440000', 'The community is helpful but the Facebook group gets too noisy. Consider creating a private forum or Discord server for better organization.', 'form_submission', now() - interval '5 days'),

-- Results and outcomes
('550e8400-e29b-41d4-a716-446655440000', 'Closed my first deal 3 months after joining! Made $25k on a fix-and-flip. This course gave me the confidence to finally take action.', 'form_submission', now() - interval '2 days'),
('550e8400-e29b-41d4-a716-446655440000', 'Went from complete beginner to owning 2 rental properties in 6 months. The systems and processes taught here are game-changing.', 'form_submission', now() - interval '4 days'),
('550e8400-e29b-41d4-a716-446655440000', 'Still looking for my first deal but the education is solid. I feel much more confident analyzing properties now.', 'form_submission', now() - interval '5 days'),

-- Specific module feedback
('550e8400-e29b-41d4-a716-446655440000', 'The Market Analysis module is gold. Helped me identify 3 emerging neighborhoods that are blowing up right now.', 'form_submission', now() - interval '3 days'),
('550e8400-e29b-41d4-a716-446655440000', 'Rehab budgeting section saved me from a costly mistake. Almost overbid on a property but the calculator showed I would lose money.', 'form_submission', now() - interval '4 days'),
('550e8400-e29b-41d4-a716-446655440000', 'Property management module is weak. Needs more depth on tenant screening, lease agreements, and handling difficult situations.', 'form_submission', now() - interval '6 days'),

-- More recent feedback
('550e8400-e29b-41d4-a716-446655440000', 'Just finished the course yesterday. Extremely impressed with the quality and depth. Starting to analyze deals this weekend!', 'form_submission', now() - interval '1 day'),
('550e8400-e29b-41d4-a716-446655440000', 'The bonus content on creative financing is exactly what I needed. Seller financing strategies are brilliant.', 'form_submission', now() - interval '1 day'),
('550e8400-e29b-41d4-a716-446655440000', 'Recommended this course to 3 friends already. One of them just joined. You should add an affiliate program!', 'form_submission', now() - interval '2 days');

-- Show summary
SELECT 
  COUNT(*) as total_texts,
  MIN(created_at) as oldest,
  MAX(created_at) as newest
FROM ai_text_pool
WHERE client_id = '550e8400-e29b-41d4-a716-446655440000';

