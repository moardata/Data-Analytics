import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { whopSdk } from '@/lib/whop-sdk';
import { headers } from 'next/headers';

/**
 * Sync existing students from Whop to the app
 * This imports students that existed before the app was installed
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId parameter required' },
        { status: 400 }
      );
    }

    console.log('🔄 Syncing students for company:', companyId);

    // Get or create client record
    let { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', companyId)
      .single();

    if (!client) {
      // Create client if doesn't exist
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          company_id: companyId,
          whop_user_id: `whop_${companyId}`,
          current_tier: 'free',
          subscription_status: 'active',
        })
        .select()
        .single();

      if (clientError) {
        throw new Error(`Failed to create client: ${clientError.message}`);
      }
      
      client = newClient;
    }

    // Use Whop SDK to get company members
    try {
      const companySdk = whopSdk.withCompany({ companyId });
      
      // Get all memberships for this company
      const memberships = await companySdk.memberships.list({
        page: 1,
        per_page: 100, // Adjust as needed
      });

      let studentsCreated = 0;
      let studentsUpdated = 0;

      for (const membership of memberships.data || []) {
        const whopUserId = membership.user_id;
        const email = membership.email || `user_${whopUserId}@whop.com`;

        // Check if student already exists
        const { data: existingStudent } = await supabase
          .from('entities')
          .select('id')
          .eq('client_id', client.id)
          .eq('whop_user_id', whopUserId)
          .single();

        if (!existingStudent) {
          // Create new student
          const { error: studentError } = await supabase
            .from('entities')
            .insert({
              client_id: client.id,
              whop_user_id: whopUserId,
              email: email,
              metadata: {
                plan_id: membership.plan_id,
                status: membership.status,
                synced_at: new Date().toISOString(),
                valid: membership.valid,
              },
            });

          if (!studentError) {
            studentsCreated++;
          }
        } else {
          // Update existing student
          const { error: updateError } = await supabase
            .from('entities')
            .update({
              metadata: {
                plan_id: membership.plan_id,
                status: membership.status,
                synced_at: new Date().toISOString(),
                valid: membership.valid,
              },
            })
            .eq('id', existingStudent.id);

          if (!updateError) {
            studentsUpdated++;
          }
        }
      }

      return NextResponse.json({
        success: true,
        companyId,
        studentsCreated,
        studentsUpdated,
        totalMemberships: memberships.data?.length || 0,
        message: `Synced ${studentsCreated} new students and updated ${studentsUpdated} existing students`,
      });

    } catch (whopError: any) {
      console.error('Whop API error:', whopError);
      return NextResponse.json({
        error: 'Failed to fetch members from Whop',
        details: whopError.message,
        hint: 'Make sure your WHOP_API_KEY has the correct permissions',
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error syncing students:', error);
    return NextResponse.json({
      error: error.message || 'Failed to sync students',
    }, { status: 500 });
  }
}

