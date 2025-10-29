/**
 * Import Members from Whop
 * Fetches all current members and creates entity records
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { checkLimit, getClientUsage } from '@/lib/pricing/usage-tracker';
import { type TierName } from '@/lib/pricing/tiers';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }


    // Get or create client record
    const { data: clientData, error: clientError} = await supabase
      .from('clients')
      .select('id, name, email, current_tier')
      .eq('company_id', companyId)
      .single();

    if (clientError || !clientData) {
      console.error('❌ [Import Members] Client not found');
      return NextResponse.json(
        { error: 'Client not found for this company' },
        { status: 404 }
      );
    }

    const clientId = clientData.id;
    const tier = (clientData.current_tier || 'atom') as TierName;

    // Check current student count
    const currentUsage = await getClientUsage(companyId);

    // Fetch members from Whop API
    const whopApiKey = process.env.WHOP_API_KEY;
    if (!whopApiKey) {
      console.error('❌ [Import Members] Whop API key not configured');
      return NextResponse.json(
        { error: 'Whop API key not configured' },
        { status: 500 }
      );
    }


    // Use members endpoint instead of memberships (works with member:basic:read scope)
    const membershipsResponse = await fetch(
      `https://api.whop.com/api/v5/members?company_id=${companyId}&per=100`,
      {
        headers: {
          'Authorization': `Bearer ${whopApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let memberships = [];
    
    if (!membershipsResponse.ok) {
      const errorText = await membershipsResponse.text();
      console.error('❌ [Import Members] Whop API error:', {
        status: membershipsResponse.status,
        statusText: membershipsResponse.statusText,
        responseBody: errorText,
        apiKey: whopApiKey ? `${whopApiKey.substring(0, 10)}...` : 'NOT SET',
        companyId: companyId,
        url: `https://api.whop.com/api/v5/members?company_id=${companyId}&per=100`
      });
      
      // If 404, it might mean no memberships exist yet
      if (membershipsResponse.status === 404) {
        return NextResponse.json({
          success: true,
          imported: 0,
          updated: 0,
          enriched: 0,
          total: 0,
          message: 'No members found in your Whop company yet. Members will be added automatically as they join via webhooks.'
        });
      }
      
      // Return detailed error for debugging
      return NextResponse.json(
        { 
          error: `Whop API error (${membershipsResponse.status}). ${errorText || 'No error details from Whop.'}`,
          debug: {
            status: membershipsResponse.status,
            companyId: companyId,
            apiKeyPrefix: whopApiKey ? whopApiKey.substring(0, 10) : 'NOT SET'
          }
        },
        { status: 500 }
      );
    }

    const membershipsData = await membershipsResponse.json();
    memberships = membershipsData.data || [];

    
    if (memberships.length === 0) {
      return NextResponse.json({
        success: true,
        imported: 0,
        updated: 0,
        enriched: 0,
        total: 0,
        message: 'No members found. New members will be added automatically via webhooks when they join.'
      });
    }

    let imported = 0;
    let updated = 0;
    let enriched = 0;
    const errors: string[] = [];

    // Process each membership
    for (const membership of memberships) {
      try {
        const whopUserId = membership.user || membership.user_id || membership.id;
        
        if (!whopUserId) {
          continue;
        }

        // Check if entity already exists
        const { data: existingEntity } = await supabase
          .from('entities')
          .select('id, name, email, metadata')
          .eq('client_id', clientId)
          .eq('whop_user_id', whopUserId)
          .single();

        if (existingEntity) {
          // Entity exists - check if we should enrich it
          if (!existingEntity.name || existingEntity.name.startsWith('Student ')) {
            // Fetch user details from Whop
            try {
              const userResponse = await fetch(
                `https://api.whop.com/api/v5/users/${whopUserId}`,
                {
                  headers: {
                    'Authorization': `Bearer ${whopApiKey}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              if (userResponse.ok) {
                const userData = await userResponse.json();
                
                const updates: any = {};
                if (userData.username) updates.name = userData.username;
                if (userData.email) updates.email = userData.email;
                
                if (userData.profile_picture_url || userData.avatar || userData.profile_pic_url) {
                  updates.metadata = {
                    ...existingEntity.metadata,
                    avatar_url: userData.profile_picture_url || userData.avatar || userData.profile_pic_url
                  };
                }

                if (Object.keys(updates).length > 0) {
                  await supabase
                    .from('entities')
                    .update(updates)
                    .eq('id', existingEntity.id);
                  
                  enriched++;
                }
              }
            } catch (userError) {
            }
          }
          updated++;
          continue;
        }

        // Entity doesn't exist - check if we can add more students
        const limitCheck = await checkLimit(companyId, tier, 'addStudent');
        
        if (!limitCheck.allowed) {
          console.warn('⚠️ [Import Members] Student limit reached:', limitCheck.reason);
          errors.push(`Limit reached: ${limitCheck.reason}`);
          break; // Stop importing more students
        }

        // Create it with Whop data
        let userName = `Student ${whopUserId}`;
        let userEmail = membership.user?.email || null;
        let metadata: any = { source: 'whop_import' };

        // Try to fetch detailed user info
        try {
          const userResponse = await fetch(
            `https://api.whop.com/api/v5/users/${whopUserId}`,
            {
              headers: {
                'Authorization': `Bearer ${whopApiKey}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (userResponse.ok) {
            const userData = await userResponse.json();
            
            if (userData.username) userName = userData.username;
            if (userData.email) userEmail = userData.email;
            
            if (userData.profile_picture_url || userData.avatar || userData.profile_pic_url) {
              metadata.avatar_url = userData.profile_picture_url || userData.avatar || userData.profile_pic_url;
            }
            
            enriched++;
          }
        } catch (userError) {
        }

        // Create new entity
        const { error: insertError } = await supabase
          .from('entities')
          .insert({
            client_id: clientId,
            whop_user_id: whopUserId,
            name: userName,
            email: userEmail,
            metadata
          });

        if (insertError) {
          console.error('❌ [Import Members] Error creating entity:', insertError);
          errors.push(`${whopUserId}: ${insertError.message}`);
        } else {
          imported++;
        }

      } catch (error: any) {
        console.error('❌ [Import Members] Error processing membership:', error);
        errors.push(`Error: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      updated,
      enriched,
      total: memberships.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Imported ${imported} new members, updated ${updated} existing, enriched ${enriched} profiles`
    });

  } catch (error: any) {
    console.error('❌ [Import Members] Fatal error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to import members',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

