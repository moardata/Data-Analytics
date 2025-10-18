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
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_KEY;

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Validate that required env vars are set
if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
}

if (!SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL not found in environment variables');
}

