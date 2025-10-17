-- COMPLETE WORKING SCHEMA FOR WHOP CREATOR ANALYTICS
-- This schema includes ALL tables that the code actually references
-- Run this ENTIRE file in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- MAIN TABLES (from original schema.sql)
-- ============================================================================

-- Clients table: Stores Whop creators using the analytics app
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  whop_user_id TEXT NOT NULL UNIQUE,
  company_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  current_tier TEXT DEFAULT 'atom', -- Added for usage tracker
  subscription_status TEXT DEFAULT 'active', -- Added for usage tracker
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

-- Insights table: Stores AI-generated insights and recommendations
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('weekly_summary', 'recommendation', 'alert', 'trend')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  severity TEXT DEFAULT 'info', -- Added for AI system
  dismissed BOOLEAN DEFAULT false, -- Added for insights system
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
-- AI SYSTEM TABLES (referenced in aiInsights.ts and usage-tracker.ts)
-- ============================================================================

-- AI Runs table: Tracks AI processing jobs for insights generation
CREATE TABLE IF NOT EXISTS ai_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  run_type TEXT NOT NULL, -- 'insight_generation', 'anomaly_detection', etc.
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  error TEXT,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Text Pool table: Stores text data for AI analysis (feedback, responses, etc.)
CREATE TABLE IF NOT EXISTS ai_text_pool (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES form_submissions(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  source TEXT, -- 'form_submission', 'feedback', 'support_ticket', etc.
  scraped BOOLEAN DEFAULT false, -- PII removed?
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Main table indexes
CREATE INDEX IF NOT EXISTS idx_entities_client_id ON entities(client_id);
CREATE INDEX IF NOT EXISTS idx_entities_whop_user_id ON entities(whop_user_id);
CREATE INDEX IF NOT EXISTS idx_events_client_id ON events(client_id);
CREATE INDEX IF NOT EXISTS idx_events_entity_id ON events(entity_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscriptions_client_id ON subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_entity_id ON subscriptions(entity_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_insights_client_id ON insights(client_id);
CREATE INDEX IF NOT EXISTS idx_insights_created_at ON insights(created_at);
CREATE INDEX IF NOT EXISTS idx_form_submissions_client_id ON form_submissions(client_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON form_submissions(form_id);

-- AI system indexes
CREATE INDEX IF NOT EXISTS idx_ai_runs_client ON ai_runs(client_id);
CREATE INDEX IF NOT EXISTS idx_ai_runs_status ON ai_runs(status);
CREATE INDEX IF NOT EXISTS idx_ai_text_pool_client ON ai_text_pool(client_id);
CREATE INDEX IF NOT EXISTS idx_ai_text_pool_created ON ai_text_pool(created_at DESC);

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

-- Apply update triggers to tables with updated_at (drop first if exists)
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

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_text_pool ENABLE ROW LEVEL SECURITY;

-- Policy: Clients can only see their own data (drop first if exists)
DROP POLICY IF EXISTS clients_own_data ON clients;
CREATE POLICY clients_own_data ON clients
  FOR ALL USING (whop_user_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS entities_own_data ON entities;
CREATE POLICY entities_own_data ON entities
  FOR ALL USING (client_id IN (SELECT id FROM clients WHERE whop_user_id = current_setting('app.current_user_id', true)));

DROP POLICY IF EXISTS events_own_data ON events;
CREATE POLICY events_own_data ON events
  FOR ALL USING (client_id IN (SELECT id FROM clients WHERE whop_user_id = current_setting('app.current_user_id', true)));

DROP POLICY IF EXISTS subscriptions_own_data ON subscriptions;
CREATE POLICY subscriptions_own_data ON subscriptions
  FOR ALL USING (client_id IN (SELECT id FROM clients WHERE whop_user_id = current_setting('app.current_user_id', true)));

DROP POLICY IF EXISTS insights_own_data ON insights;
CREATE POLICY insights_own_data ON insights
  FOR ALL USING (client_id IN (SELECT id FROM clients WHERE whop_user_id = current_setting('app.current_user_id', true)));

DROP POLICY IF EXISTS form_templates_own_data ON form_templates;
CREATE POLICY form_templates_own_data ON form_templates
  FOR ALL USING (client_id IN (SELECT id FROM clients WHERE whop_user_id = current_setting('app.current_user_id', true)));

DROP POLICY IF EXISTS form_submissions_own_data ON form_submissions;
CREATE POLICY form_submissions_own_data ON form_submissions
  FOR ALL USING (client_id IN (SELECT id FROM clients WHERE whop_user_id = current_setting('app.current_user_id', true)));

DROP POLICY IF EXISTS ai_runs_own_data ON ai_runs;
CREATE POLICY ai_runs_own_data ON ai_runs
  FOR ALL USING (client_id IN (SELECT id FROM clients WHERE whop_user_id = current_setting('app.current_user_id', true)));

DROP POLICY IF EXISTS ai_text_pool_own_data ON ai_text_pool;
CREATE POLICY ai_text_pool_own_data ON ai_text_pool
  FOR ALL USING (client_id IN (SELECT id FROM clients WHERE whop_user_id = current_setting('app.current_user_id', true)));

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE clients IS 'Stores Whop creators using the analytics app';
COMMENT ON TABLE entities IS 'Stores students/community members for each client';
COMMENT ON TABLE events IS 'Stores all incoming webhook events and custom events';
COMMENT ON TABLE subscriptions IS 'Tracks student subscriptions';
COMMENT ON TABLE insights IS 'Stores AI-generated insights and recommendations';
COMMENT ON TABLE form_templates IS 'Stores customizable form definitions';
COMMENT ON TABLE form_submissions IS 'Stores responses to custom forms';
COMMENT ON TABLE ai_runs IS 'Tracks AI processing jobs for insights generation';
COMMENT ON TABLE ai_text_pool IS 'Stores text data for AI analysis (feedback, responses, etc.)';

-- ============================================================================
-- VERIFICATION QUERIES (run these to confirm everything works)
-- ============================================================================

-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check indexes exist
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY indexname;
