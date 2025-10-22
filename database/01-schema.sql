-- ============================================================================
-- WHOP CREATOR ANALYTICS - DATABASE SCHEMA
-- ============================================================================
-- Run this FIRST in your Supabase SQL Editor
-- This creates all tables, indexes, triggers, and functions
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Clients table: Stores Whop creators using the analytics app
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  whop_user_id TEXT NOT NULL UNIQUE,
  company_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  current_tier TEXT DEFAULT 'atom',
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Entities table: Stores students/community members
CREATE TABLE IF NOT EXISTS entities (
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
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('order', 'subscription', 'activity', 'form_submission', 'custom')),
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  whop_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table: Tracks student subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- AI & INSIGHTS TABLES
-- ============================================================================

-- Insights table: Stores AI-generated insights and recommendations
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('weekly_summary', 'recommendation', 'alert', 'trend')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  severity TEXT DEFAULT 'info',
  dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Runs table: Tracks AI processing jobs
CREATE TABLE IF NOT EXISTS ai_runs (
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
CREATE TABLE IF NOT EXISTS ai_text_pool (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES form_submissions(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  source TEXT,
  scraped BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- FORMS TABLES
-- ============================================================================

-- Form Templates table: Stores customizable form definitions
CREATE TABLE IF NOT EXISTS form_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form Submissions table: Stores responses to custom forms
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES form_templates(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- COURSE TABLES (Whop Courses Integration)
-- ============================================================================

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
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
CREATE TABLE IF NOT EXISTS course_lessons (
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
CREATE TABLE IF NOT EXISTS course_enrollments (
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
CREATE TABLE IF NOT EXISTS lesson_interactions (
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

-- ============================================================================
-- WEBHOOK AUDIT TABLE
-- ============================================================================

-- Webhook Events table: Tracks all incoming webhooks for debugging
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  action TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'processing', 'completed', 'failed')),
  error TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Core table indexes
CREATE INDEX IF NOT EXISTS idx_entities_client_id ON entities(client_id);
CREATE INDEX IF NOT EXISTS idx_entities_whop_user_id ON entities(whop_user_id);
CREATE INDEX IF NOT EXISTS idx_events_client_id ON events(client_id);
CREATE INDEX IF NOT EXISTS idx_events_entity_id ON events(entity_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscriptions_client_id ON subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_entity_id ON subscriptions(entity_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Insights & AI indexes
CREATE INDEX IF NOT EXISTS idx_insights_client_id ON insights(client_id);
CREATE INDEX IF NOT EXISTS idx_insights_created_at ON insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_runs_client ON ai_runs(client_id);
CREATE INDEX IF NOT EXISTS idx_ai_runs_status ON ai_runs(status);
CREATE INDEX IF NOT EXISTS idx_ai_text_pool_client ON ai_text_pool(client_id);
CREATE INDEX IF NOT EXISTS idx_ai_text_pool_created ON ai_text_pool(created_at DESC);

-- Forms indexes
CREATE INDEX IF NOT EXISTS idx_form_submissions_client_id ON form_submissions(client_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON form_submissions(form_id);

-- Course indexes
CREATE INDEX IF NOT EXISTS idx_courses_client_id ON courses(client_id);
CREATE INDEX IF NOT EXISTS idx_courses_whop_id ON courses(whop_course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON course_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_whop_id ON course_lessons(whop_lesson_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_client_id ON course_enrollments(client_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_entity_id ON course_enrollments(entity_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_interactions_client_id ON lesson_interactions(client_id);
CREATE INDEX IF NOT EXISTS idx_lesson_interactions_entity_id ON lesson_interactions(entity_id);
CREATE INDEX IF NOT EXISTS idx_lesson_interactions_lesson_id ON lesson_interactions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_interactions_enrollment_id ON lesson_interactions(enrollment_id);

-- Webhook indexes
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_action ON webhook_events(action);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to tables with updated_at
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

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_lessons_updated_at ON course_lessons;
CREATE TRIGGER update_course_lessons_updated_at BEFORE UPDATE ON course_lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to populate ai_text_pool when form is submitted
CREATE OR REPLACE FUNCTION populate_text_pool()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ai_text_pool (client_id, submission_id, text, source)
  SELECT 
    NEW.client_id,
    NEW.id,
    value::text,
    'form_submission'
  FROM jsonb_each_text(NEW.responses)
  WHERE length(value::text) > 10; -- Only meaningful text
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_populate_text_pool ON form_submissions;
CREATE TRIGGER trigger_populate_text_pool
AFTER INSERT ON form_submissions
FOR EACH ROW
EXECUTE FUNCTION populate_text_pool();

-- Function to update course enrollment progress
CREATE OR REPLACE FUNCTION update_enrollment_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update enrollment progress when lesson interaction changes
  UPDATE course_enrollments
  SET 
    progress_percentage = (
      SELECT COALESCE(AVG(CASE WHEN is_completed THEN 100 ELSE progress_percentage END), 0)
      FROM lesson_interactions
      WHERE enrollment_id = NEW.enrollment_id
    ),
    last_accessed_at = NOW(),
    completed_at = CASE 
      WHEN (
        SELECT COUNT(*) 
        FROM lesson_interactions 
        WHERE enrollment_id = NEW.enrollment_id AND is_completed = true
      ) = (
        SELECT COUNT(*) 
        FROM course_lessons 
        WHERE course_id = (SELECT course_id FROM course_enrollments WHERE id = NEW.enrollment_id)
      ) 
      THEN NOW()
      ELSE NULL
    END
  WHERE id = NEW.enrollment_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_enrollment_progress ON lesson_interactions;
CREATE TRIGGER trigger_update_enrollment_progress
AFTER INSERT OR UPDATE ON lesson_interactions
FOR EACH ROW
EXECUTE FUNCTION update_enrollment_progress();

-- ============================================================================
-- TABLE COMMENTS
-- ============================================================================

COMMENT ON TABLE clients IS 'Stores Whop creators using the analytics app';
COMMENT ON TABLE entities IS 'Stores students/community members for each client';
COMMENT ON TABLE events IS 'Stores all incoming webhook events and custom events';
COMMENT ON TABLE subscriptions IS 'Tracks student subscriptions';
COMMENT ON TABLE insights IS 'Stores AI-generated insights and recommendations';
COMMENT ON TABLE form_templates IS 'Stores customizable form definitions';
COMMENT ON TABLE form_submissions IS 'Stores responses to custom forms';
COMMENT ON TABLE ai_runs IS 'Tracks AI processing jobs for insights generation';
COMMENT ON TABLE ai_text_pool IS 'Stores text data for AI analysis';
COMMENT ON TABLE courses IS 'Stores course information from Whop';
COMMENT ON TABLE course_lessons IS 'Stores individual lessons within courses';
COMMENT ON TABLE course_enrollments IS 'Tracks which members are enrolled in which courses';
COMMENT ON TABLE lesson_interactions IS 'Tracks member progress and interactions with lessons';
COMMENT ON TABLE webhook_events IS 'Audit log of all Whop webhook events received by the application';

-- ============================================================================
-- FEEDBACK LOOP TABLES
-- ============================================================================

-- Insight Actions table: Tracks actions taken on insights
CREATE TABLE IF NOT EXISTS insight_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  insight_id UUID NOT NULL REFERENCES insights(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  improvement_description TEXT,
  metrics_before JSONB,
  metrics_after JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Improvement Tracking table: Tracks improvement results
CREATE TABLE IF NOT EXISTS improvement_tracking (
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

-- Improvement Summaries table: AI-generated improvement summaries
CREATE TABLE IF NOT EXISTS improvement_summaries (
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

-- Add comments for feedback loop tables
COMMENT ON TABLE insight_actions IS 'Tracks actions taken by creators based on insights';
COMMENT ON TABLE improvement_tracking IS 'Tracks improvement results after actions are taken';
COMMENT ON TABLE improvement_summaries IS 'AI-generated summaries of improvement results';

