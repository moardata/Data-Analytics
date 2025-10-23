/**
 * Instrumentation file - runs before Next.js initializes
 * Used to ensure correct environment settings in production
 */

export function register() {
  // Log environment information for debugging
  console.log('🔧 Instrumentation: NODE_ENV =', process.env.NODE_ENV);
  console.log('🔧 Instrumentation: VERCEL =', !!process.env.VERCEL);
  console.log('🔧 Instrumentation: VERCEL_ENV =', process.env.VERCEL_ENV);
  console.log('🔧 Instrumentation: OPENAI_API_KEY exists =', !!process.env.OPENAI_API_KEY);
  
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    console.log('🔧 Instrumentation: OPENAI_API_KEY length =', apiKey.length);
    console.log('🔧 Instrumentation: OPENAI_API_KEY ending =', '...' + apiKey.substring(apiKey.length - 10));
  } else {
    console.warn('⚠️ Instrumentation: OPENAI_API_KEY is NOT SET');
  }
  
  // Warn if NODE_ENV is incorrectly set
  if (process.env.NODE_ENV === 'development' && (process.env.VERCEL || process.env.VERCEL_ENV === 'production')) {
    console.warn('⚠️ WARNING: NODE_ENV is "development" but running in Vercel production!');
  }
}

