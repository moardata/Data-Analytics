/**
 * Debug Headers Endpoint
 * Shows what headers Whop is sending to help diagnose authentication issues
 * 
 * PROTECTED: Only available in development mode
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoints are not available in production' },
      { status: 404 }
    );
  }
  // Get all headers that might be relevant from Whop
  const headers: Record<string, string> = {};
  
  // Common Whop headers to check
  const whopHeaders = [
    'x-whop-user-token',
    'x-whop-company-id',
    'x-whop-user-id',
    'authorization',
    'referer',
    'origin',
    'user-agent',
  ];
  
  for (const headerName of whopHeaders) {
    const value = request.headers.get(headerName);
    if (value) {
      // Truncate tokens for security
      if (headerName.includes('token') || headerName.includes('authorization')) {
        headers[headerName] = value.substring(0, 20) + '...';
      } else {
        headers[headerName] = value;
      }
    }
  }
  
  // Get URL info
  const url = new URL(request.url);
  
  return NextResponse.json({
    headers,
    url: {
      pathname: url.pathname,
      search: url.search,
      searchParams: Object.fromEntries(url.searchParams),
    },
    timestamp: new Date().toISOString(),
  });
}

