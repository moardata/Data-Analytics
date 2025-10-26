/**
 * Update tier names to new bundle names
 * Maps old tier names (atom, core, pulse, surge, quantum) to new names (starter, growth, pro, scale)
 */

-- Update current_tier values in clients table
UPDATE clients
SET current_tier = CASE current_tier
  WHEN 'atom' THEN 'starter'
  WHEN 'core' THEN 'growth'
  WHEN 'pulse' THEN 'pro'
  WHEN 'surge' THEN 'scale'
  WHEN 'quantum' THEN 'scale'
  ELSE 'starter'
END
WHERE current_tier IN ('atom', 'core', 'pulse', 'surge', 'quantum');

-- Verify the update
SELECT current_tier, COUNT(*) as count
FROM clients
GROUP BY current_tier
ORDER BY current_tier;

