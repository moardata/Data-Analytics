import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    const keyLength = process.env.OPENAI_API_KEY?.length || 0;
    const keyPreview = process.env.OPENAI_API_KEY ? 
      process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'Not set';
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      openaiConfig: {
        hasKey: hasOpenAIKey,
        keyLength,
        keyPreview,
        status: hasOpenAIKey ? '✅ CONFIGURED' : '❌ MISSING'
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV
      }
    });
    
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
