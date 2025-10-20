import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    
    // Get all headers
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    // Get URL info
    const url = new URL(request.url);
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      debug: {
        companyId,
        url: url.toString(),
        searchParams: Object.fromEntries(searchParams.entries()),
        headers: Object.keys(headers).reduce((acc, key) => {
          if (key.toLowerCase().includes('whop') || key.toLowerCase().includes('auth') || key.toLowerCase().includes('user')) {
            acc[key] = headers[key];
          }
          return acc;
        }, {} as Record<string, string>),
        allHeaders: Object.keys(headers),
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message
    }, { status: 500 });
  }
}
