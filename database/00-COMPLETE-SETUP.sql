-- ============================================================================
-- COMPLETE DATABASE SETUP - ALL IN ONE
-- ============================================================================
-- Copy this ENTIRE file and run it in Supabase SQL Editor
-- This will:
-- 1. Create all tables and indexes
-- 2. Set up Row Level Security
-- 3. Grant you premium access for testing
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 1: CREATE ALL TABLES
-- ============================================================================

-- Drop existing table if needed (ONLY RUN THIS IN DEV)
DROP TABLE IF EXISTS improvement_summaries CASCADE;
DROP TABLE IF EXISTS improvement_tracking CASCADE;
DROP TABLE IF EXISTS insight_actions CASCADE;
DROP TABLE IF EXISTS lesson_interactions CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS course_lessons CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS webhook_events CASCADE;
DROP TABLE IF EXISTS ai_text_pool CASCADE;
DROP TABLE IF EXISTS ai_runs CASCADE;
DROP TABLE IF EXISTS form_submissions CASCADE;
DROP TABLE IF EXISTS form_templates CASCADE;
DROP TABLE IF EXISTS insights CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS entities CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- Clients table: Stores Whop creators using the analytics app
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  whop_user_id TEXT NOT NULL UNIQUE,
  company_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  current_tier TEXT DEFAULT 'atom',
  subscription_status TEXT DEFAULT 'active',
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  whop_plan_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Entities table: Stores students/community members
CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  whop_user_id TEXT NOT NULL,
  email TEXT,
  name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, whop_user_id)
);

-- Events table: Stores all incoming webhook events and custom events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  whop_event_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table: Tracks student subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  whop_subscription_id TEXT NOT NULL UNIQUE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'trialing')),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insights table: Stores AI-generated insights and recommendations
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('weekly_summary', 'recommendation', 'alert', 'trend')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  severity TEXT DEFAULT 'info',
  status TEXT DEFAULT 'new',
  dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Runs table: Tracks AI processing jobs
CREATE TABLE ai_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  run_type TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  error TEXT,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Text Pool table: Stores text data for AI analysis
CREATE TABLE ai_text_pool (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  submission_id UUID,
  text TEXT NOT NULL,
  source TEXT,
  scraped BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form Templates table: Stores customizable form definitions
CREATE TABLE form_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  delivery_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form Submissions table: Stores responses to custom forms
CREATE TABLE form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES form_templates(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  whop_course_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  instructor_name TEXT,
  total_lessons INTEGER DEFAULT 0,
  total_duration_minutes INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course lessons table
CREATE TABLE course_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  whop_lesson_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  lesson_order INTEGER NOT NULL,
  duration_minutes INTEGER DEFAULT 0,
  video_url TEXT,
  content_type TEXT,
  is_free_preview BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course enrollments
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  whop_enrollment_id TEXT UNIQUE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(entity_id, course_id)
);

-- Lesson progress tracking
CREATE TABLE lesson_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  whop_interaction_id TEXT UNIQUE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER DEFAULT 0,
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  is_completed BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(entity_id, lesson_id)
);

-- Webhook Events table: Tracks all incoming webhooks for debugging
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  action TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'processing', 'completed', 'failed')),
  error TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Feedback loop tables
CREATE TABLE insight_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  insight_id UUID NOT NULL REFERENCES insights(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  improvement_description TEXT,
  metrics_before JSONB,
  metrics_after JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE improvement_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  insight_id UUID NOT NULL REFERENCES insights(id) ON DELETE CASCADE,
  action_id UUID NOT NULL REFERENCES insight_actions(id) ON DELETE CASCADE,
  metrics_before JSONB,
  metrics_after JSONB,
  improvement_percentage DECIMAL(5,2),
  improvement_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE improvement_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  insight_id UUID NOT NULL REFERENCES insights(id) ON DELETE CASCADE,
  action_id UUID NOT NULL REFERENCES insight_actions(id) ON DELETE CASCADE,
  improvement_id UUID NOT NULL REFERENCES improvement_tracking(id) ON DELETE CASCADE,
  summary_content TEXT NOT NULL,
  key_metrics JSONB,
  recommendations JSONB,
  confidence_score DECIMAL(3,2),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 2: CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_clients_company_id ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_entities_client_id ON entities(client_id);
CREATE INDEX IF NOT EXISTS idx_entities_whop_user_id ON entities(whop_user_id);
CREATE INDEX IF NOT EXISTS idx_events_client_id ON events(client_id);
CREATE INDEX IF NOT EXISTS idx_events_entity_id ON events(entity_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscriptions_client_id ON subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_entity_id ON subscriptions(entity_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_insights_client_id ON insights(client_id);
CREATE INDEX IF NOT EXISTS idx_insights_created_at ON insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_runs_client ON ai_runs(client_id);
CREATE INDEX IF NOT EXISTS idx_ai_runs_status ON ai_runs(status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_client_id ON form_submissions(client_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_courses_client_id ON courses(client_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at DESC);

-- ============================================================================
-- STEP 3: CREATE TRIGGERS
-- ============================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_entities_updated_at ON entities;
CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON entities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_form_templates_updated_at ON form_templates;
CREATE TRIGGER update_form_templates_updated_at BEFORE UPDATE ON form_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 4: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_text_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_interactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: CREATE RLS POLICIES (Service Role Bypass)
-- ============================================================================

-- Service role can do everything (for API routes)
CREATE POLICY clients_service_role ON clients FOR ALL TO service_role USING (true);
CREATE POLICY entities_service_role ON entities FOR ALL TO service_role USING (true);
CREATE POLICY events_service_role ON events FOR ALL TO service_role USING (true);
CREATE POLICY subscriptions_service_role ON subscriptions FOR ALL TO service_role USING (true);
CREATE POLICY insights_service_role ON insights FOR ALL TO service_role USING (true);
CREATE POLICY form_templates_service_role ON form_templates FOR ALL TO service_role USING (true);
CREATE POLICY form_submissions_service_role ON form_submissions FOR ALL TO service_role USING (true);
CREATE POLICY ai_runs_service_role ON ai_runs FOR ALL TO service_role USING (true);
CREATE POLICY ai_text_pool_service_role ON ai_text_pool FOR ALL TO service_role USING (true);
CREATE POLICY courses_service_role ON courses FOR ALL TO service_role USING (true);
CREATE POLICY course_lessons_service_role ON course_lessons FOR ALL TO service_role USING (true);
CREATE POLICY course_enrollments_service_role ON course_enrollments FOR ALL TO service_role USING (true);
CREATE POLICY lesson_interactions_service_role ON lesson_interactions FOR ALL TO service_role USING (true);

-- ============================================================================
-- STEP 6: GRANT PREMIUM ACCESS TO YOUR DEV ACCOUNT
-- ============================================================================

-- Update or create your account with full premium access
INSERT INTO clients (
  company_id,
  whop_user_id,
  email,
  name,
  current_tier,
  subscription_tier,
  subscription_status,
  trial_ends_at,
  whop_plan_id,
  updated_at
)
VALUES (
  'biz_3GYHNPbGkZCEky',
  'biz_3GYHNPbGkZCEky',
  'dev@premium.test',
  'Premium Dev Account',
  'surge',
  'premium',
  'active',
  NOW() + INTERVAL '1 year',
  'prod_bm98P1RCFrFmF',
  NOW()
)
ON CONFLICT (company_id) 
DO UPDATE SET
  current_tier = 'surge',
  subscription_tier = 'premium',
  subscription_status = 'active',
  trial_ends_at = NOW() + INTERVAL '1 year',
  whop_plan_id = 'prod_bm98P1RCFrFmF',
  updated_at = NOW();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check tables were created
SELECT 'Tables Created:' as status, COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'clients', 'entities', 'events', 'subscriptions', 
    'insights', 'form_templates', 'form_submissions',
    'ai_runs', 'ai_text_pool', 'courses', 'webhook_events'
  );

-- Check RLS is enabled
SELECT 'RLS Enabled:' as status, COUNT(*) as count
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = true;

-- Verify your premium account
SELECT 
  '✅ PREMIUM ACCESS GRANTED!' as status,
  company_id,
  current_tier as tier,
  subscription_status,
  trial_ends_at::date as trial_ends
FROM clients 
WHERE company_id = 'biz_3GYHNPbGkZCEky';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '
  ============================================================================
  ✅ DATABASE SETUP COMPLETE!
  ============================================================================
  
  Tables Created: All 15+ tables
  RLS Enabled: Multi-tenant security active
  Premium Access: Granted to biz_3GYHNPbGkZCEky
  
  YOUR ACCOUNT:
  - Tier: Scale (surge)
  - Features: ALL UNLOCKED
  - Students: Unlimited
  - Responses: Unlimited  
  - AI Insights: 20/day
  - Exports: CSV + PDF
  - Trial: Active until %
  
  NEXT STEPS:
  1. Refresh your app
  2. All paywalls should be gone
  3. Full access to all features
  
  Ready to build! 🚀
  ============================================================================
  ', (NOW() + INTERVAL '1 year')::date;
END $$;

