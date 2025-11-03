/**
 * Debug Headers Endpoint
 * Shows what headers Whop is sending to help diagnose authentication issues
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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

