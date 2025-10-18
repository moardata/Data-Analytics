import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET() {
  try {
    const hasKey = !!process.env.OPENAI_API_KEY;
    
    if (!hasKey) {
      return NextResponse.json({
        error: 'No OpenAI API key found',
        hasKey: false
      });
    }
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Make a simple test call
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: 'Say "OpenAI API is working" and nothing else.'
        }
      ],
      max_tokens: 10,
    });
    
    return NextResponse.json({
      success: true,
      response: response.choices[0]?.message?.content,
      usage: response.usage,
      model: response.model
    });
    
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
      hasKey: !!process.env.OPENAI_API_KEY
    }, { status: 500 });
  }
}
