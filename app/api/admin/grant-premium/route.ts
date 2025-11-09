/**
 * Grant Premium Access API
 * ADMIN ONLY - Sets a company to top tier with unlimited access
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Admin endpoints are not available in production' },
      { status: 404 }
    );
  }
  
  try {
    const { companyId } = await request.json();

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }


    // Set trial end date far in the future (1 year)
    const trialEndsAt = new Date();
    trialEndsAt.setFullYear(trialEndsAt.getFullYear() + 1);

    // Update or create client with top tier
    const { data, error } = await supabase
      .from('clients')
      .upsert({
        company_id: companyId,
        whop_user_id: companyId,
        email: `${companyId}@dev.test`,
        name: 'Premium Dev Account',
        current_tier: 'scale', // Top tier (Scale - $599/mo equivalent)
        subscription_tier: 'premium', // For RLS compatibility
        subscription_status: 'active',
        trial_ends_at: trialEndsAt.toISOString(),
        whop_plan_id: 'prod_bm98P1RCFrFmF', // Scale plan ID
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'company_id',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      console.error('❌ Error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }


    return NextResponse.json({
      success: true,
      message: 'Premium access granted successfully',
      companyId,
      tier: 'scale',
      tierName: 'Scale',
      limits: {
        students: 'Unlimited',
        responses: 'Unlimited',
        aiInsights: '20/day',
        csvExport: true,
        pdfExport: true,
        apiAccess: true,
        allMetrics: true
      },
      trialEndsAt: trialEndsAt.toISOString()
    });

  } catch (error) {
    console.error('❌ Error granting premium:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

