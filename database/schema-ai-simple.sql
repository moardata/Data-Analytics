/**
 * AI Tables - Simplified (No Materialized Views)
 * Just the essential tables needed for AI insights to work
 */

-- AI Run Tracking
CREATE TABLE IF NOT EXISTS ai_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  run_type TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT DEFAULT 'queued',
  error TEXT,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_runs_client ON ai_runs(client_id);
CREATE INDEX IF NOT EXISTS idx_ai_runs_status ON ai_runs(status);

-- Text Pool for AI Analysis
CREATE TABLE IF NOT EXISTS ai_text_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES form_submissions(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  source TEXT,
  scraped BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_text_pool_client ON ai_text_pool(client_id);
CREATE INDEX IF NOT EXISTS idx_ai_text_pool_created ON ai_text_pool(created_at DESC);

-- Add columns to insights table (if they don't exist)
ALTER TABLE insights ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'info';
ALTER TABLE insights ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}'::jsonb;
ALTER TABLE insights ADD COLUMN IF NOT EXISTS dismissed BOOLEAN DEFAULT false;

-- Trigger to auto-populate text pool from form submissions
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
  WHERE length(value::text) > 10;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_populate_text_pool ON form_submissions;
CREATE TRIGGER trigger_populate_text_pool
AFTER INSERT ON form_submissions
FOR EACH ROW
EXECUTE FUNCTION populate_text_pool();



