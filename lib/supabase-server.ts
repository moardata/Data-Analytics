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
  console.log('🔍 Debug - Environment check:');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
  console.log('All env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials for server client');
    console.error('supabaseUrl:', supabaseUrl ? 'Present' : 'Missing');
    console.error('supabaseServiceKey:', supabaseServiceKey ? 'Present' : 'Missing');
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

