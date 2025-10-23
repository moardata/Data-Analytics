-- ============================================================================
-- ADVANCED DASHBOARD METRICS - DATABASE SCHEMA
-- ============================================================================
-- Run this in your Supabase SQL Editor after running 01-04 migration files
-- This creates the metrics caching system and extends event types
-- ============================================================================

-- Dashboard metrics cache table
CREATE TABLE IF NOT EXISTS cached_dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN (
    'engagement_consistency',
    'aha_moments',
    'content_pathways',
    'popular_content_daily',
    'feedback_themes',
    'commitment_scores'
  )),
  metric_data JSONB NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(client_id, metric_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cached_dashboard_metrics_client ON cached_dashboard_metrics(client_id);
CREATE INDEX IF NOT EXISTS idx_cached_dashboard_metrics_type ON cached_dashboard_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_cached_dashboard_metrics_expires ON cached_dashboard_metrics(expires_at);
CREATE INDEX IF NOT EXISTS idx_cached_dashboard_metrics_lookup ON cached_dashboard_metrics(client_id, metric_type, expires_at);

-- Update events table to support new event types
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_event_type_check;
ALTER TABLE events ADD CONSTRAINT events_event_type_check 
  CHECK (event_type IN (
    'order', 'subscription', 'activity', 'form_submission', 'custom',
    'course_enrollment', 'engagement', 'revenue', 'subscription_change',
    'payment_failed', 'payment_refunded', 'payment_disputed', 'payment_dispute_resolved'
  ));

-- Add comments
COMMENT ON TABLE cached_dashboard_metrics IS 'Cached pre-calculated dashboard metrics for fast retrieval';
COMMENT ON COLUMN cached_dashboard_metrics.metric_type IS 'Type of metric: engagement_consistency, aha_moments, content_pathways, popular_content_daily, feedback_themes, commitment_scores';
COMMENT ON COLUMN cached_dashboard_metrics.metric_data IS 'JSON blob containing the calculated metric data';
COMMENT ON COLUMN cached_dashboard_metrics.expires_at IS 'When this cached metric expires and needs recalculation';

-- Function to clean up expired metrics
CREATE OR REPLACE FUNCTION cleanup_expired_metrics()
RETURNS void AS $$
BEGIN
  DELETE FROM cached_dashboard_metrics WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_metrics IS 'Removes expired cached metrics - call periodically via cron';

