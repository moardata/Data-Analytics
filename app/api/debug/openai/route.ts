import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'biz_test_demo';
    
    // Check OpenAI configuration
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    const keyLength = process.env.OPENAI_API_KEY?.length || 0;
    const keyPreview = process.env.OPENAI_API_KEY ? 
      process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'Not set';
    
    let openaiClient = null;
    let clientError = null;
    
    if (hasOpenAIKey) {
      try {
        openaiClient = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
      } catch (error: any) {
        clientError = error.message;
      }
    }
    
    // Test a simple API call
    let apiTestResult = null;
    let apiError = null;
    
    if (openaiClient) {
      try {
        const response = await openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: 'Say "OpenAI API is working" and nothing else.'
            }
          ],
          max_tokens: 10,
        });
        
        apiTestResult = {
          success: true,
          response: response.choices[0]?.message?.content || 'No response',
          usage: response.usage
        };
      } catch (error: any) {
        apiError = {
          message: error.message,
          status: error.status,
          code: error.code,
          type: error.type
        };
      }
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      companyId,
      openaiConfig: {
        hasKey: hasOpenAIKey,
        keyLength,
        keyPreview,
        clientCreated: !!openaiClient,
        clientError
      },
      apiTest: {
        attempted: !!openaiClient,
        result: apiTestResult,
        error: apiError
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
