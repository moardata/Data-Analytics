/**
 * Create Trial From Membership ID
 * Takes a Whop membership ID, fetches the user/company info, creates trial
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { whopSdk } from '@/lib/whop-sdk';

export async function POST(request: NextRequest) {
  try {
    const { membershipId } = await request.json();
    
    if (!membershipId || !membershipId.startsWith('mem_')) {
      return NextResponse.json(
        { error: 'Invalid membership ID. Should start with mem_' },
        { status: 400 }
      );
    }
    
    console.log(`🔍 Fetching membership info for: ${membershipId}`);
    
    // Get membership details from Whop
    const membership = await whopSdk.client.memberships.retrieve(membershipId);
    
    if (!membership) {
      return NextResponse.json(
        { error: 'Membership not found in Whop' },
        { status: 404 }
      );
    }
    
    const companyId = (membership as any).company_id || (membership as any).company;
    const userId = (membership as any).user_id || (membership as any).user;
    const planId = (membership as any).plan_id || (membership as any).plan;
    
    console.log(`✅ Found membership: Company ${companyId}, User ${userId}, Plan ${planId}`);
    
    // Check if client already exists
    const { data: existing } = await supabase
      .from('clients')
      .select('id, subscription_status, trial_ends_at')
      .eq('company_id', companyId)
      .maybeSingle();
    
    if (existing) {
      // Update existing with trial
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);
      
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          subscription_status: 'trialing',
          trial_ends_at: trialEndsAt.toISOString(),
          current_tier: 'atom',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
      
      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update trial', details: updateError.message },
          { status: 500 }
        );
      }
      
      console.log(`✅ Updated existing client ${companyId} with 7-day trial`);
      
      return NextResponse.json({
        success: true,
        message: '🎉 7-day trial activated for existing user!',
        companyId,
        userId,
        trialEndsAt: trialEndsAt.toISOString(),
        action: 'updated'
      });
    }
    
    // Create new client with trial
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);
    
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert({
        whop_user_id: companyId,
        company_id: companyId,
        email: `${companyId}@whop.com`,
        name: `Company ${companyId}`,
        current_tier: 'atom',
        subscription_status: 'trialing',
        trial_ends_at: trialEndsAt.toISOString(),
        whop_plan_id: planId,
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
    
    console.log(`✅ Created new client ${companyId} with 7-day trial`);
    
    return NextResponse.json({
      success: true,
      message: '🎉 7-day trial created!',
      companyId,
      userId,
      trialEndsAt: trialEndsAt.toISOString(),
      clientId: newClient.id,
      action: 'created'
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
  const membershipId = searchParams.get('membershipId') || searchParams.get('mem');
  
  if (!membershipId) {
    return NextResponse.json(
      { error: 'Add ?membershipId=mem_xxx to URL' },
      { status: 400 }
    );
  }
  
  return POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ membershipId }),
    headers: request.headers,
  }));
}

