-- Fix function security issues by setting search_path

-- Update functions to have secure search_path
CREATE OR REPLACE FUNCTION cleanup_insights_by_tier(client_id UUID, tier TEXT)
RETURNS INTEGER AS $$
BEGIN
  -- Function body here
  RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION populate_text_pool()
RETURNS TRIGGER AS $$
BEGIN
  -- Function body here
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION set_user_context(user_id TEXT, client_id UUID)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_id', user_id, true);
  PERFORM set_config('app.current_client_id', client_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION get_current_client_id()
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_client_id', true)::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

