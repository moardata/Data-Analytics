/**
 * Student Data Enrichment API
 * Fetches real names and data from Whop API for students
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { simpleAuth } from '@/lib/auth/simple-auth';
import whopClient from '@/lib/whop-client';

export async function POST(request: NextRequest) {
  try {
    const auth = await simpleAuth(request);
    const companyId = auth.companyId;

    // Get client
    const { data: clientData } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', companyId)
      .single();

    if (!clientData) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const clientId = clientData.id;

    // Get all entities (students) for this client
    const { data: entities } = await supabase
      .from('entities')
      .select('*')
      .eq('client_id', clientId);

    if (!entities || entities.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No students to enrich',
        enriched: 0 
      });
    }

    let enrichedCount = 0;
    const errors: string[] = [];

    // Enrich each entity by fetching from Whop
    for (const entity of entities) {
      try {
        // Skip if already has name
        if (entity.name && entity.name !== 'Unknown' && !entity.name.startsWith('Student ')) {
          continue;
        }

        // Try to fetch user details from Whop
        const whopUserId = entity.whop_user_id;
        
        if (!whopUserId || whopUserId.startsWith('user_biz_')) {
          // Skip mock/test users
          continue;
        }

        // Fetch user info from Whop API
        try {
          const userResponse = await fetch(`https://api.whop.com/api/v5/users/${whopUserId}`, {
            headers: {
              'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
              'Content-Type': 'application/json',
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            
            // Update entity with real data
            const updates: any = {};
            if (userData.username) updates.name = userData.username;
            if (userData.email) updates.email = userData.email;
            if (userData.profile_picture_url || userData.avatar) {
              updates.metadata = {
                ...entity.metadata,
                avatar_url: userData.profile_picture_url || userData.avatar
              };
            }

            if (Object.keys(updates).length > 0) {
              await supabase
                .from('entities')
                .update(updates)
                .eq('id', entity.id);
              
              enrichedCount++;
              console.log(`✅ Enriched student ${whopUserId} with real data`);
            }
          }
        } catch (userError) {
          console.log(`⚠️ Could not fetch user ${whopUserId} from Whop:`, userError);
        }

      } catch (error: any) {
        errors.push(`${entity.whop_user_id}: ${error.message}`);
        console.error(`Error enriching entity ${entity.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Enriched ${enrichedCount} students out of ${entities.length}`,
      enriched: enrichedCount,
      total: entities.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('Error enriching students:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to enrich students' },
      { status: 500 }
    );
  }
}

