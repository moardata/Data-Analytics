/**
 * Webhook Events Audit Table
 * Tracks all incoming webhook events for debugging and monitoring
 */

-- Create webhook_events table for audit logging
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  action TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'processing', 'completed', 'failed')),
  error TEXT,
  processed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index on created_at for performance
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at DESC);

-- Create index on action for filtering
CREATE INDEX IF NOT EXISTS idx_webhook_events_action ON webhook_events(action);

-- Create index on status for monitoring
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);

-- Add comment to table
COMMENT ON TABLE webhook_events IS 'Audit log of all Whop webhook events received by the application';
COMMENT ON COLUMN webhook_events.action IS 'The webhook action type (e.g., payment.succeeded, membership.created)';
COMMENT ON COLUMN webhook_events.payload IS 'Full webhook payload from Whop';
COMMENT ON COLUMN webhook_events.status IS 'Processing status of the webhook';
COMMENT ON COLUMN webhook_events.error IS 'Error message if processing failed';
COMMENT ON COLUMN webhook_events.processed_at IS 'Timestamp when webhook processing completed';

