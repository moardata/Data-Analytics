/**
 * AI Insights System - Database Schema Extension
 * Add these tables to your existing Supabase database
 */

-- AI Run Tracking
CREATE TABLE IF NOT EXISTS ai_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  run_type TEXT NOT NULL, -- 'insight_generation', 'anomaly_detection', etc.
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT DEFAULT 'queued', -- 'queued', 'running', 'completed', 'failed'
  error TEXT,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_runs_client ON ai_runs(client_id);
CREATE INDEX idx_ai_runs_status ON ai_runs(status);

-- Text Pool for AI Analysis
CREATE TABLE IF NOT EXISTS ai_text_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES form_submissions(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  source TEXT, -- 'form_submission', 'feedback', 'support_ticket', etc.
  scraped BOOLEAN DEFAULT false, -- PII removed?
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_text_pool_client ON ai_text_pool(client_id);
CREATE INDEX idx_ai_text_pool_created ON ai_text_pool(created_at DESC);

-- Enhance insights table
ALTER TABLE insights
ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'info', -- 'info', 'warning', 'alert', 'critical'
ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS action_url TEXT, -- Link to relevant page
ADD COLUMN IF NOT EXISTS dismissed BOOLEAN DEFAULT false;

-- Materialized Views for Performance
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_revenue_7d AS
SELECT 
  client_id,
  date_trunc('day', created_at) as date,
  SUM((event_data->>'amount')::numeric) as revenue
FROM events
WHERE event_type = 'order'
  AND created_at >= now() - interval '7 days'
GROUP BY client_id, date_trunc('day', created_at);

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_engagement_7d AS
SELECT 
  client_id,
  date_trunc('day', created_at) as date,
  COUNT(*) as activity_count
FROM events
WHERE event_type IN ('activity', 'form_submission', 'lesson_complete')
  AND created_at >= now() - interval '7 days'
GROUP BY client_id, date_trunc('day', created_at);

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_kpis_current AS
SELECT 
  c.id as client_id,
  COUNT(DISTINCT e.id) as total_students,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'active') as active_subscriptions,
  COALESCE(SUM((ev.event_data->>'amount')::numeric), 0) as total_revenue,
  COUNT(DISTINCT ev.id) FILTER (WHERE ev.event_type = 'activity') as total_activities
FROM clients c
LEFT JOIN entities e ON e.client_id = c.id
LEFT JOIN subscriptions s ON s.client_id = c.id
LEFT JOIN events ev ON ev.client_id = c.id
GROUP BY c.id;

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_ai_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_revenue_7d;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_engagement_7d;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpis_current;
END;
$$ LANGUAGE plpgsql;

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

CREATE TRIGGER trigger_populate_text_pool
AFTER INSERT ON form_submissions
FOR EACH ROW
EXECUTE FUNCTION populate_text_pool();

COMMENT ON TABLE ai_runs IS 'Tracks AI processing jobs for insights generation';
COMMENT ON TABLE ai_text_pool IS 'Stores text data for AI analysis (feedback, responses, etc.)';



