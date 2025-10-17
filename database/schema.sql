-- Creator Analytics Database Schema for Supabase/PostgreSQL
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients table: Stores Whop creators using the analytics app
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  whop_user_id TEXT NOT NULL UNIQUE,
  company_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
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

-- Create indexes for better query performance
CREATE INDEX idx_entities_client_id ON entities(client_id);
CREATE INDEX idx_entities_whop_user_id ON entities(whop_user_id);
CREATE INDEX idx_events_client_id ON events(client_id);
CREATE INDEX idx_events_entity_id ON events(entity_id);
CREATE INDEX idx_events_created_at ON events(created_at);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_subscriptions_client_id ON subscriptions(client_id);
CREATE INDEX idx_subscriptions_entity_id ON subscriptions(entity_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_insights_client_id ON insights(client_id);
CREATE INDEX idx_insights_created_at ON insights(created_at);
CREATE INDEX idx_form_submissions_client_id ON form_submissions(client_id);
CREATE INDEX idx_form_submissions_form_id ON form_submissions(form_id);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to tables with updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON entities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_templates_updated_at BEFORE UPDATE ON form_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Clients can only see their own data
CREATE POLICY clients_own_data ON clients
  FOR ALL USING (whop_user_id = current_setting('app.current_user_id', true));

CREATE POLICY entities_own_data ON entities
  FOR ALL USING (client_id IN (SELECT id FROM clients WHERE whop_user_id = current_setting('app.current_user_id', true)));

CREATE POLICY events_own_data ON events
  FOR ALL USING (client_id IN (SELECT id FROM clients WHERE whop_user_id = current_setting('app.current_user_id', true)));

CREATE POLICY subscriptions_own_data ON subscriptions
  FOR ALL USING (client_id IN (SELECT id FROM clients WHERE whop_user_id = current_setting('app.current_user_id', true)));

CREATE POLICY insights_own_data ON insights
  FOR ALL USING (client_id IN (SELECT id FROM clients WHERE whop_user_id = current_setting('app.current_user_id', true)));

CREATE POLICY form_templates_own_data ON form_templates
  FOR ALL USING (client_id IN (SELECT id FROM clients WHERE whop_user_id = current_setting('app.current_user_id', true)));

CREATE POLICY form_submissions_own_data ON form_submissions
  FOR ALL USING (client_id IN (SELECT id FROM clients WHERE whop_user_id = current_setting('app.current_user_id', true)));


