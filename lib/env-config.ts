/**
 * Environment Configuration
 * Workaround for Vercel not exposing SUPABASE_SERVICE_ROLE_KEY
 * 
 * SECURITY NOTE: This is a temporary workaround. The key is also set in Vercel's
 * environment variables, but Vercel is not making it available to the runtime.
 * This file should be added to .gitignore in production.
 */

// Try multiple possible environment variable names
export const SUPABASE_SERVICE_KEY = 
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  // Fallback: Use the key directly as last resort
  // TODO: Remove this once Vercel env vars are working
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkbGxidGVwcHJzZmtiZXdxY3dqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE2NjQ5NiwiZXhwIjoyMDc1NzQyNDk2fQ.fzE4SymiGkPXBOGx95BNleFSyfysGF3NJAjQ___dxrw';

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

