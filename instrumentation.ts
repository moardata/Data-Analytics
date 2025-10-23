/**
 * Instrumentation file - runs before Next.js initializes
 * Used to ensure correct environment settings in production
 */

export function register() {
  // Force production environment in Vercel deployments
  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ NODE_ENV was set to development in production, forcing to production');
      process.env.NODE_ENV = 'production';
    }
  }
  
  console.log('🔧 Instrumentation: NODE_ENV =', process.env.NODE_ENV);
  console.log('🔧 Instrumentation: VERCEL_ENV =', process.env.VERCEL_ENV);
  console.log('🔧 Instrumentation: OPENAI_API_KEY exists =', !!process.env.OPENAI_API_KEY);
  console.log('🔧 Instrumentation: OPENAI_API_KEY ending =', 
    process.env.OPENAI_API_KEY ? 
    '...' + process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 10) : 
    'NO KEY'
  );
}

