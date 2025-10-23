// Test OpenAI key when accessed through Whop platform
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const key = process.env.OPENAI_API_KEY;
    
    console.log('🔍 [Whop Test] OPENAI_API_KEY exists:', !!key);
    console.log('🔍 [Whop Test] OPENAI_API_KEY length:', key?.length || 0);
    console.log('🔍 [Whop Test] OPENAI_API_KEY ending:', key ? '...' + key.substring(key.length - 10) : 'NO KEY');
    console.log('🔍 [Whop Test] NODE_ENV:', process.env.NODE_ENV);
    console.log('🔍 [Whop Test] VERCEL_ENV:', process.env.VERCEL_ENV);
    console.log('🔍 [Whop Test] VERCEL:', process.env.VERCEL);
    
    if (!key) {
      return Response.json({ error: 'No API key found' }, { status: 500 });
    }
    
    // Test the actual API call
    const openai = new OpenAI({ apiKey: key });
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say "Whop platform API key is working" and nothing else.' }],
      max_tokens: 10,
    });
    
    const result = completion.choices[0].message.content;
    
    return Response.json({
      success: true,
      message: result,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL: process.env.VERCEL,
      },
      keyInfo: {
        exists: !!key,
        length: key.length,
        prefix: key.substring(0, 10),
        suffix: '...' + key.substring(key.length - 10),
        isCorrectKey: key.endsWith('O1oHb2bKkA'),
        isOldKey: key.endsWith('uJ8A'),
      }
    });
    
  } catch (error: any) {
    console.error('❌ [Whop Test] Error:', error);
    
    return Response.json({
      error: 'OpenAI API call failed',
      details: {
        message: error.message,
        status: error.status,
        code: error.code,
        type: error.type,
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL: process.env.VERCEL,
      },
      keyInfo: {
        exists: !!process.env.OPENAI_API_KEY,
        length: process.env.OPENAI_API_KEY?.length || 0,
        prefix: process.env.OPENAI_API_KEY?.substring(0, 10) || 'NO KEY',
        suffix: process.env.OPENAI_API_KEY ? '...' + process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 10) : 'NO KEY',
        isCorrectKey: process.env.OPENAI_API_KEY?.endsWith('O1oHb2bKkA') || false,
        isOldKey: process.env.OPENAI_API_KEY?.endsWith('uJ8A') || false,
      }
    }, { status: 500 });
  }
}
