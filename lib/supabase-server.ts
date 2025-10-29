/**
 * Supabase Server Client Configuration
 * Uses SERVICE ROLE key for backend operations - bypasses RLS
 * ONLY use this in API routes, NEVER in client components
 */

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

let _supabaseServer: SupabaseClient | null = null;

function getSupabaseServer(): SupabaseClient | null {
  // Get env vars at runtime, not at module load time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rdllbtepprsfkbewqcwj.supabase.co';
  
  // Try multiple env var names with fallback
  const supabaseServiceKey = 
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkbGxidGVwcHJzZmtiZXdxY3dqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE2NjQ5NiwiZXhwIjoyMDc1NzQyNDk2fQ.fzE4SymiGkPXBOGx95BNleFSyfysGF3NJAjQ___dxrw';

  // Check if credentials are valid (not placeholders)
  const hasValidCredentials = 
    supabaseUrl && 
    supabaseServiceKey && 
    supabaseUrl.startsWith('https://') && 
    !supabaseUrl.includes('your_supabase_url_here') &&
    !supabaseServiceKey.includes('your_supabase');

  // Enhanced logging for debugging

  if (!hasValidCredentials) {
    console.warn('⚠️ Supabase not configured. Server client disabled. App will work in test mode.');
    return null;
  }

  if (!_supabaseServer && supabaseUrl && supabaseServiceKey) {
    _supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return _supabaseServer;
}

/**
 * Server-side Supabase client with SERVICE ROLE key
 * This bypasses RLS policies - use ONLY in API routes
 * Never expose this client to the frontend
 * Returns null if Supabase is not configured
 */
export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabaseServer();
    if (!client) {
      // Return null for any property access if Supabase is not configured
      return null;
    }
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

export default supabaseServer;

