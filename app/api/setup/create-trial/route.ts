/**
 * Emergency Trial Creator
 * Creates a 7-day trial for users who signed up but don't have a DB record
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    
    // Get company ID from request
    const body = await request.json();
    let companyId = body.companyId;
    
    // If not provided, try to detect from headers/URL
    if (!companyId) {
      const { searchParams } = new URL(request.url);
      companyId = searchParams.get('companyId');
    }
    
    if (!companyId) {
      // Try to get from Whop token
      try {
        const { whopSdk } = await import('@/lib/whop-sdk');
        const tokenResult = await whopSdk.verifyUserToken(headersList);
        
        // Try to get company from headers
        companyId = headersList.get('x-whop-company-id') || 
                   headersList.get('whop-company-id') ||
                   headersList.get('company-id');
      } catch (e) {
        // ignore
      }
    }
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'No company ID found. Add ?companyId=biz_xxx to URL' },
        { status: 400 }
      );
    }
    
    console.log(`🚀 Creating 7-day trial for company: ${companyId}`);
    
    // Check if already exists
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', companyId)
      .maybeSingle();
    
    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Client already exists',
        clientId: existing.id,
      });
    }
    
    // Create trial - 7 days from now
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);
    
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert({
        whop_user_id: companyId,
        company_id: companyId,
        email: `${companyId}@whop.com`,
        name: `Company ${companyId}`,
        current_tier: 'starter',  // Starter tier
        subscription_status: 'trialing',
        trial_ends_at: trialEndsAt.toISOString(),
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating trial:', error);
      return NextResponse.json(
        { error: 'Failed to create trial', details: error.message },
        { status: 500 }
      );
    }
    
    console.log(`✅ Created 7-day trial for ${companyId} - expires ${trialEndsAt.toISOString()}`);
    
    return NextResponse.json({
      success: true,
      message: '🎉 7-day trial activated!',
      companyId,
      trialEndsAt: trialEndsAt.toISOString(),
      clientId: newClient.id,
      instructions: 'Refresh the page - paywall should be gone!'
    });
    
  } catch (error: any) {
    console.error('Create trial error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create trial' },
      { status: 500 }
    );
  }
}

// Also allow GET for easy testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  
  if (!companyId) {
    return NextResponse.json(
      { error: 'Add ?companyId=biz_xxx to URL' },
      { status: 400 }
    );
  }
  
  // Call POST handler
  return POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ companyId }),
    headers: request.headers,
  }));
}

