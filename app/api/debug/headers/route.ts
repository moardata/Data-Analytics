import { NextRequest, NextResponse } from 'next/server';

/**
 * Debug endpoint to see ALL headers Whop is sending
 * This will help us understand what authentication data is available
 */
export async function GET(request: NextRequest) {
  const headersList = request.headers;
  
  // Collect ALL headers
  const allHeaders: Record<string, string> = {};
  headersList.forEach((value, key) => {
    allHeaders[key] = value;
  });

  // Extract Whop-specific headers
  const whopHeaders: Record<string, string> = {};
  headersList.forEach((value, key) => {
    if (key.toLowerCase().includes('whop') || 
        key.toLowerCase().includes('user') ||
        key.toLowerCase().includes('auth') ||
        key.toLowerCase().includes('company')) {
      whopHeaders[key] = value;
    }
  });

  console.log('🔍 [Debug Headers] All headers:', allHeaders);
  console.log('🔍 [Debug Headers] Whop-specific:', whopHeaders);

  return NextResponse.json({
    message: 'Header debug information',
    allHeadersCount: Object.keys(allHeaders).length,
    whopHeadersCount: Object.keys(whopHeaders).length,
    allHeaders,
    whopHeaders,
    url: request.url,
    method: request.method,
  }, {
    headers: {
      'Content-Type': 'application/json',
    }
  });
}

