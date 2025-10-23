// Simple OpenAI test endpoint
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const key = process.env.OPENAI_API_KEY;
    
    console.log('🔍 [Simple Test] OPENAI_API_KEY exists:', !!key);
    console.log('🔍 [Simple Test] OPENAI_API_KEY length:', key?.length || 0);
    console.log('🔍 [Simple Test] OPENAI_API_KEY prefix:', key ? key.substring(0, 10) : 'NO KEY');
    console.log('🔍 [Simple Test] OPENAI_API_KEY suffix:', key ? '...' + key.substring(key.length - 10) : 'NO KEY');
    
    if (!key) {
      return Response.json({ error: 'No API key found' }, { status: 500 });
    }
    
    if (!key.startsWith('sk-')) {
      return Response.json({ error: 'Invalid API key format' }, { status: 500 });
    }
    
    // Test the actual API call
    const openai = new OpenAI({ apiKey: key });
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say "API key is working" and nothing else.' }],
      max_tokens: 10,
    });
    
    const result = completion.choices[0].message.content;
    
    return Response.json({
      success: true,
      message: result,
      keyInfo: {
        exists: !!key,
        length: key.length,
        prefix: key.substring(0, 10),
        suffix: '...' + key.substring(key.length - 10),
        startsWithSk: key.startsWith('sk-'),
      }
    });
    
  } catch (error: any) {
    console.error('❌ [Simple Test] Error:', error);
    
    return Response.json({
      error: 'OpenAI API call failed',
      details: {
        message: error.message,
        status: error.status,
        code: error.code,
        type: error.type,
      },
      keyInfo: {
        exists: !!process.env.OPENAI_API_KEY,
        length: process.env.OPENAI_API_KEY?.length || 0,
        prefix: process.env.OPENAI_API_KEY?.substring(0, 10) || 'NO KEY',
        suffix: process.env.OPENAI_API_KEY ? '...' + process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 10) : 'NO KEY',
      }
    }, { status: 500 });
  }
}
