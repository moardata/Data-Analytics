-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Run this SECOND after 01-schema.sql
-- This enables RLS and creates policies for multi-tenant security
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Function to set user context for RLS
CREATE OR REPLACE FUNCTION set_user_context(user_id TEXT, client_id UUID)
RETURNS void AS $$
BEGIN
  -- Set the current user ID and client ID for RLS policies
  PERFORM set_config('app.current_user_id', user_id, true);
  PERFORM set_config('app.current_client_id', client_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current client ID
CREATE OR REPLACE FUNCTION get_current_client_id()
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_client_id', true)::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION set_user_context(TEXT, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_current_client_id() TO authenticated, anon;

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
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
-- Note: webhook_events has no RLS (service role only)

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS clients_own_data ON clients;
DROP POLICY IF EXISTS entities_own_data ON entities;
DROP POLICY IF EXISTS events_own_data ON events;
DROP POLICY IF EXISTS subscriptions_own_data ON subscriptions;
DROP POLICY IF EXISTS insights_own_data ON insights;
DROP POLICY IF EXISTS form_templates_own_data ON form_templates;
DROP POLICY IF EXISTS form_submissions_own_data ON form_submissions;
DROP POLICY IF EXISTS ai_runs_own_data ON ai_runs;
DROP POLICY IF EXISTS ai_text_pool_own_data ON ai_text_pool;
DROP POLICY IF EXISTS courses_own_data ON courses;
DROP POLICY IF EXISTS course_lessons_own_data ON course_lessons;
DROP POLICY IF EXISTS course_enrollments_own_data ON course_enrollments;
DROP POLICY IF EXISTS lesson_interactions_own_data ON lesson_interactions;

-- Clients table policy
CREATE POLICY clients_own_data ON clients
  FOR ALL 
  USING (
    whop_user_id = current_setting('app.current_user_id', true) OR
    id = get_current_client_id()
  );

-- Entities table policy
CREATE POLICY entities_own_data ON entities
  FOR ALL 
  USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE whop_user_id = current_setting('app.current_user_id', true) 
      OR id = get_current_client_id()
    )
  );

-- Events table policy
CREATE POLICY events_own_data ON events
  FOR ALL 
  USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE whop_user_id = current_setting('app.current_user_id', true) 
      OR id = get_current_client_id()
    )
  );

-- Subscriptions table policy
CREATE POLICY subscriptions_own_data ON subscriptions
  FOR ALL 
  USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE whop_user_id = current_setting('app.current_user_id', true) 
      OR id = get_current_client_id()
    )
  );

-- Insights table policy
CREATE POLICY insights_own_data ON insights
  FOR ALL 
  USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE whop_user_id = current_setting('app.current_user_id', true) 
      OR id = get_current_client_id()
    )
  );

-- Form templates table policy
CREATE POLICY form_templates_own_data ON form_templates
  FOR ALL 
  USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE whop_user_id = current_setting('app.current_user_id', true) 
      OR id = get_current_client_id()
    )
  );

-- Form submissions table policy
CREATE POLICY form_submissions_own_data ON form_submissions
  FOR ALL 
  USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE whop_user_id = current_setting('app.current_user_id', true) 
      OR id = get_current_client_id()
    )
  );

-- AI runs table policy
CREATE POLICY ai_runs_own_data ON ai_runs
  FOR ALL 
  USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE whop_user_id = current_setting('app.current_user_id', true) 
      OR id = get_current_client_id()
    )
  );

-- AI text pool table policy
CREATE POLICY ai_text_pool_own_data ON ai_text_pool
  FOR ALL 
  USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE whop_user_id = current_setting('app.current_user_id', true) 
      OR id = get_current_client_id()
    )
  );

-- Courses table policy
CREATE POLICY courses_own_data ON courses
  FOR ALL 
  USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE whop_user_id = current_setting('app.current_user_id', true) 
      OR id = get_current_client_id()
    )
  );

-- Course lessons table policy
CREATE POLICY course_lessons_own_data ON course_lessons
  FOR ALL 
  USING (
    course_id IN (
      SELECT id FROM courses WHERE client_id IN (
        SELECT id FROM clients 
        WHERE whop_user_id = current_setting('app.current_user_id', true) 
        OR id = get_current_client_id()
      )
    )
  );

-- Course enrollments table policy
CREATE POLICY course_enrollments_own_data ON course_enrollments
  FOR ALL 
  USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE whop_user_id = current_setting('app.current_user_id', true) 
      OR id = get_current_client_id()
    )
  );

-- Lesson interactions table policy
CREATE POLICY lesson_interactions_own_data ON lesson_interactions
  FOR ALL 
  USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE whop_user_id = current_setting('app.current_user_id', true) 
      OR id = get_current_client_id()
    )
  );

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check that RLS is enabled on all tables
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'clients', 'entities', 'events', 'subscriptions', 
    'insights', 'form_templates', 'form_submissions',
    'ai_runs', 'ai_text_pool', 'courses', 'course_lessons',
    'course_enrollments', 'lesson_interactions'
  )
ORDER BY tablename;

-- Check that policies exist
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

