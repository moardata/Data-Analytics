-- Quick fix for missing dismissed column in insights table
-- Run this in your Supabase SQL Editor

-- Add missing columns to insights table
ALTER TABLE insights
ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'info',
ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS action_url TEXT,
ADD COLUMN IF NOT EXISTS dismissed BOOLEAN DEFAULT false;

-- Create index for dismissed column for better query performance
CREATE INDEX IF NOT EXISTS idx_insights_dismissed ON insights(dismissed);

-- Add some sample insights if table is empty
INSERT INTO insights (client_id, insight_type, title, content, severity, dismissed)
SELECT 
  c.id,
  'recommendation',
  'Welcome to AI Insights!',
  'Your analytics dashboard is now powered by AI. We''ll analyze your student data and provide personalized recommendations to help you grow your community.',
  'info',
  false
FROM clients c
WHERE NOT EXISTS (SELECT 1 FROM insights WHERE client_id = c.id)
LIMIT 1;

-- Add another sample insight
INSERT INTO insights (client_id, insight_type, title, content, severity, dismissed)
SELECT 
  c.id,
  'alert',
  'Get Started with Data Collection',
  'To generate meaningful insights, make sure you have student activity data coming in through webhooks or form submissions.',
  'warning',
  false
FROM clients c
WHERE NOT EXISTS (SELECT 1 FROM insights WHERE insight_type = 'alert' AND client_id = c.id)
LIMIT 1;

