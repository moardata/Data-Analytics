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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  // Try multiple env var names
  const supabaseServiceKey = 
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_KEY;

  // Check if credentials are valid (not placeholders)
  const hasValidCredentials = 
    supabaseUrl && 
    supabaseServiceKey && 
    supabaseUrl.startsWith('https://') && 
    !supabaseUrl.includes('your_supabase_url_here') &&
    !supabaseServiceKey.includes('your_supabase');

  // Enhanced logging for debugging
  console.log('🔍 Supabase Server Init Check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseServiceKey,
    hasValidCredentials,
    urlLength: supabaseUrl?.length || 0,
    keyLength: supabaseServiceKey?.length || 0,
    urlPreview: supabaseUrl && supabaseUrl.startsWith('https://') ? `${supabaseUrl.substring(0, 30)}...` : 'invalid/missing',
    keyPreview: supabaseServiceKey && !supabaseServiceKey.includes('your_') ? `${supabaseServiceKey.substring(0, 15)}...` : 'invalid/missing',
    envVars: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_SECRET_KEY: !!process.env.SUPABASE_SECRET_KEY,
      SUPABASE_KEY: !!process.env.SUPABASE_KEY,
    }
  });

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
    console.log('✅ Supabase server client initialized successfully');
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

