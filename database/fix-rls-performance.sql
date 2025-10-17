-- Fix RLS Performance Issues
-- Replace current_setting() calls with subqueries for better performance

-- Drop existing policies
DROP POLICY IF EXISTS clients_own_data ON clients;
DROP POLICY IF EXISTS entities_own_data ON entities;
DROP POLICY IF EXISTS events_own_data ON events;
DROP POLICY IF EXISTS subscriptions_own_data ON subscriptions;
DROP POLICY IF EXISTS insights_own_data ON insights;
DROP POLICY IF EXISTS form_templates_own_data ON form_templates;
DROP POLICY IF EXISTS form_submissions_own_data ON form_submissions;
DROP POLICY IF EXISTS ai_runs_own_data ON ai_runs;
DROP POLICY IF EXISTS ai_text_pool_own_data ON ai_text_pool;

-- Create optimized policies using subqueries
CREATE POLICY clients_own_data ON clients
  FOR ALL USING (
    whop_user_id = (SELECT current_setting('app.current_user_id', true)) OR
    id = (SELECT get_current_client_id())
  );

CREATE POLICY entities_own_data ON entities
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE whop_user_id = (SELECT current_setting('app.current_user_id', true)) 
      OR id = (SELECT get_current_client_id())
    )
  );

CREATE POLICY events_own_data ON events
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE whop_user_id = (SELECT current_setting('app.current_user_id', true)) 
      OR id = (SELECT get_current_client_id())
    )
  );

CREATE POLICY subscriptions_own_data ON subscriptions
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE whop_user_id = (SELECT current_setting('app.current_user_id', true)) 
      OR id = (SELECT get_current_client_id())
    )
  );

CREATE POLICY insights_own_data ON insights
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE whop_user_id = (SELECT current_setting('app.current_user_id', true)) 
      OR id = (SELECT get_current_client_id())
    )
  );

CREATE POLICY form_templates_own_data ON form_templates
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE whop_user_id = (SELECT current_setting('app.current_user_id', true)) 
      OR id = (SELECT get_current_client_id())
    )
  );

CREATE POLICY form_submissions_own_data ON form_submissions
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE whop_user_id = (SELECT current_setting('app.current_user_id', true)) 
      OR id = (SELECT get_current_client_id())
    )
  );

CREATE POLICY ai_runs_own_data ON ai_runs
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE whop_user_id = (SELECT current_setting('app.current_user_id', true)) 
      OR id = (SELECT get_current_client_id())
    )
  );

CREATE POLICY ai_text_pool_own_data ON ai_text_pool
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE whop_user_id = (SELECT current_setting('app.current_user_id', true)) 
      OR id = (SELECT get_current_client_id())
    )
  );

