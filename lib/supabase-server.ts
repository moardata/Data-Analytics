/**
 * Supabase Server Client Configuration
 * Uses SERVICE ROLE key for backend operations - bypasses RLS
 * ONLY use this in API routes, NEVER in client components
 */

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Use service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let _supabaseServer: SupabaseClient | null = null;

function getSupabaseServer(): SupabaseClient {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials for server client');
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server operations');
  }

  if (!_supabaseServer) {
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
 */
export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabaseServer();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

export default supabaseServer;

