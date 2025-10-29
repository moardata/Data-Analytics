/**
 * Instrumentation file - runs before Next.js initializes
 * Used to ensure correct environment settings in production
 */

export function register() {
  // Log environment information for debugging
  
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
  } else {
    console.warn('⚠️ Instrumentation: OPENAI_API_KEY is NOT SET');
  }
  
  // Warn if NODE_ENV is incorrectly set
  if (process.env.NODE_ENV === 'development' && (process.env.VERCEL || process.env.VERCEL_ENV === 'production')) {
    console.warn('⚠️ WARNING: NODE_ENV is "development" but running in Vercel production!');
  }
}

