-- ============================================================================
-- SIMPLE DATABASE SETUP - COPY AND PASTE THIS ENTIRE FILE
-- ============================================================================
-- Run in Supabase SQL Editor
-- ============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CREATE CLIENTS TABLE (Main table first)
-- ============================================================================

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  whop_user_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  subscription_tier TEXT DEFAULT 'free',
  current_tier TEXT DEFAULT 'atom',
  subscription_status TEXT DEFAULT 'active',
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  whop_plan_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraints
ALTER TABLE clients ADD CONSTRAINT clients_whop_user_id_key UNIQUE (whop_user_id);
ALTER TABLE clients ADD CONSTRAINT clients_company_id_key UNIQUE (company_id);

-- Index for performance
CREATE INDEX idx_clients_company_id ON clients(company_id);

-- Disable RLS for now (we use service role key)
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- GRANT YOUR ACCOUNT PREMIUM ACCESS
-- ============================================================================

INSERT INTO clients (
  company_id,
  whop_user_id,
  email,
  name,
  current_tier,
  subscription_tier,
  subscription_status,
  trial_ends_at,
  whop_plan_id
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
  'prod_bm98P1RCFrFmF'
);

-- ============================================================================
-- CREATE OTHER CORE TABLES
-- ============================================================================

CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  whop_user_id TEXT NOT NULL,
  email TEXT,
  name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE entities ADD CONSTRAINT entities_client_whop_user_unique UNIQUE (client_id, whop_user_id);
CREATE INDEX idx_entities_client_id ON entities(client_id);
ALTER TABLE entities DISABLE ROW LEVEL SECURITY;

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  whop_event_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_events_client_id ON events(client_id);
CREATE INDEX idx_events_created_at ON events(created_at DESC);
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  whop_subscription_id TEXT UNIQUE,
  plan_id TEXT,
  status TEXT DEFAULT 'active',
  amount DECIMAL(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_client_id ON subscriptions(client_id);
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;

CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  insight_type TEXT DEFAULT 'recommendation',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  severity TEXT DEFAULT 'info',
  status TEXT DEFAULT 'new',
  dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_insights_client_id ON insights(client_id);
CREATE INDEX idx_insights_created_at ON insights(created_at DESC);
ALTER TABLE insights DISABLE ROW LEVEL SECURITY;

CREATE TABLE form_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  fields JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  delivery_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_form_templates_client_id ON form_templates(client_id);
ALTER TABLE form_templates DISABLE ROW LEVEL SECURITY;

CREATE TABLE form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES form_templates(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  responses JSONB DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_form_submissions_client_id ON form_submissions(client_id);
CREATE INDEX idx_form_submissions_form_id ON form_submissions(form_id);
ALTER TABLE form_submissions DISABLE ROW LEVEL SECURITY;

CREATE TABLE ai_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  run_type TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'queued',
  error TEXT,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_runs_client ON ai_runs(client_id);
ALTER TABLE ai_runs DISABLE ROW LEVEL SECURITY;

CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'received',
  error TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at DESC);

-- ============================================================================
-- VERIFY YOUR PREMIUM ACCOUNT
-- ============================================================================

SELECT 
  '✅ SUCCESS! Premium access granted!' as message,
  company_id,
  current_tier,
  subscription_status,
  trial_ends_at::date
FROM clients 
WHERE company_id = 'biz_3GYHNPbGkZCEky';

