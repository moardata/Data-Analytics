-- Enable RLS on usage_logs table
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for usage_logs
CREATE POLICY usage_logs_own_data ON usage_logs
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE whop_user_id = (SELECT current_setting('app.current_user_id', true)) 
      OR id = (SELECT get_current_client_id())
    )
  );

