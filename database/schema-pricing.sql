/**
 * Pricing & Usage Tracking Schema
 * Add tier tracking and Whop plan mapping to clients table
 */

-- Update clients table to track subscription tier
ALTER TABLE clients ADD COLUMN IF NOT EXISTS current_tier TEXT DEFAULT 'free';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS whop_plan_id TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- Create index for faster tier lookups
CREATE INDEX IF NOT EXISTS idx_clients_tier ON clients(current_tier);
CREATE INDEX IF NOT EXISTS idx_clients_whop_plan ON clients(whop_plan_id);

-- Usage tracking table (optional - for detailed analytics)
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'insight_generated', 'form_created', etc
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_client ON usage_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action ON usage_logs(action_type);

-- Function to auto-cleanup old insights based on tier
CREATE OR REPLACE FUNCTION cleanup_insights_by_tier()
RETURNS TRIGGER AS $$
DECLARE
  retention_days INTEGER;
  cutoff_date TIMESTAMPTZ;
BEGIN
  -- Get retention period based on tier
  CASE NEW.current_tier
    WHEN 'free' THEN retention_days := 7;
    WHEN 'starter' THEN retention_days := 30;
    WHEN 'growth' THEN retention_days := 90;
    WHEN 'pro' THEN retention_days := 180;
    WHEN 'enterprise' THEN retention_days := 365;
    ELSE retention_days := 7;
  END CASE;

  -- Calculate cutoff date
  cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;

  -- Delete old insights
  DELETE FROM insights
  WHERE client_id = NEW.id
    AND created_at < cutoff_date;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to cleanup insights when tier changes
DROP TRIGGER IF EXISTS trigger_cleanup_insights_on_tier_change ON clients;
CREATE TRIGGER trigger_cleanup_insights_on_tier_change
AFTER UPDATE OF current_tier ON clients
FOR EACH ROW
EXECUTE FUNCTION cleanup_insights_by_tier();

-- View for quick usage stats
CREATE OR REPLACE VIEW client_usage_stats AS
SELECT 
  c.id as client_id,
  c.current_tier,
  COUNT(DISTINCT e.id) as student_count,
  COUNT(DISTINCT ft.id) as form_count,
  COUNT(DISTINCT CASE 
    WHEN ar.created_at::date = CURRENT_DATE AND ar.status = 'completed' 
    THEN ar.id 
  END) as insights_today
FROM clients c
LEFT JOIN entities e ON e.client_id = c.id
LEFT JOIN form_templates ft ON ft.client_id = c.id
LEFT JOIN ai_runs ar ON ar.client_id = c.id
GROUP BY c.id, c.current_tier;

COMMENT ON VIEW client_usage_stats IS 'Real-time usage statistics for enforcing tier limits';

