/**
 * Direct Test Webhook Endpoint
 * Bypasses all Whop validation - for testing only
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { normalizeWhopEvent, extractSubscriptionData } from '@/lib/utils/normalizeEvent';
import { getBundleInfo } from '@/lib/pricing/bundles';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, companyId, userId } = body;

    if (!eventType || !companyId) {
      return NextResponse.json(
        { error: 'Missing eventType or companyId' },
        { status: 400 }
      );
    }

    console.log('🧪 Direct test webhook:', eventType, 'for company:', companyId);

    // Create mock webhook data
    const mockUserId = userId || `user_test_${Date.now()}`;
    const mockWebhookData = createMockWebhook(eventType, companyId, mockUserId);

    // Process directly
    const result = await processDirectWebhook(mockWebhookData, companyId);

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      eventType,
      companyId,
      userId: mockUserId,
      result,
    });

  } catch (error) {
    console.error('Direct test webhook error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process webhook',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

function createMockWebhook(eventType: string, companyId: string, userId: string) {
  const baseData = {
    id: `test_${Date.now()}`,
    user_id: userId,
    company_id: companyId,
    created_at: new Date().toISOString(),
  };

  switch (eventType) {
    case 'membership.experienced_claimed':
    case 'membership.created':
      return {
        action: eventType,
        data: {
          ...baseData,
          plan_id: 'plan_test_core',
          product_id: 'prod_test',
          status: 'active',
          experience_id: 'exp_test_123',
          valid_from: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          renewal_period: 'monthly',
        },
        id: baseData.id,
      };

    case 'payment.succeeded':
      return {
        action: 'payment.succeeded',
        data: {
          ...baseData,
          final_amount: 2900, // $29.00
          currency: 'USD',
          plan_id: 'plan_test_core',
          product_id: 'prod_test',
        },
        id: baseData.id,
      };

    case 'membership.cancelled':
      return {
        action: 'membership.cancelled',
        data: {
          ...baseData,
          plan_id: 'plan_test_core',
          status: 'cancelled',
        },
        id: baseData.id,
      };

    default:
      return {
        action: eventType,
        data: baseData,
        id: baseData.id,
      };
  }
}

async function processDirectWebhook(webhookData: any, companyId: string) {
  // 1. Log to webhook_events
  const { data: webhookEvent } = await supabase
    .from('webhook_events')
    .insert({
      action: webhookData.action,
      payload: webhookData,
      status: 'received',
    })
    .select('id')
    .single();

  const webhookEventId = webhookEvent?.id || null;

  try {
    // 2. Update status to processing
    if (webhookEventId) {
      await supabase
        .from('webhook_events')
        .update({ status: 'processing' })
        .eq('id', webhookEventId);
    }

    // 3. Normalize event
    const normalized = normalizeWhopEvent(webhookData);
    const { userId } = normalized;

    if (!userId) {
      throw new Error('No user ID in webhook event');
    }

    // 4. Get or create entity
    const entity = await getOrCreateEntity(userId, webhookData.data, companyId);
    if (!entity) {
      throw new Error('Failed to get or create entity');
    }

    const clientId = entity.client_id;

    // 5. Store the event
    const { error: eventError } = await supabase
      .from('events')
      .insert({
        client_id: clientId,
        entity_id: entity.id,
        event_type: normalized.eventType,
        event_data: normalized.eventData,
        whop_event_id: normalized.whopEventId,
      });

    if (eventError) {
      throw new Error(`Failed to store event: ${eventError.message}`);
    }

    // 6. Handle specific event types
    await handleSpecificEventType(webhookData, entity.id, clientId);

    // 7. Mark as completed
    if (webhookEventId) {
      await supabase
        .from('webhook_events')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
          metadata: {
            client_id: clientId,
            entity_id: entity.id,
            event_type: normalized.eventType,
          },
        })
        .eq('id', webhookEventId);
    }

    return {
      success: true,
      clientId,
      entityId: entity.id,
      eventType: normalized.eventType,
    };

  } catch (error) {
    // Mark as failed
    if (webhookEventId) {
      await supabase
        .from('webhook_events')
        .update({
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          processed_at: new Date().toISOString(),
        })
        .eq('id', webhookEventId);
    }
    throw error;
  }
}

async function getOrCreateEntity(whopUserId: string, eventData: any, companyId: string) {
  // Try to find existing entity
  const { data: existing } = await supabase
    .from('entities')
    .select('id, client_id')
    .eq('whop_user_id', whopUserId)
    .single();

  if (existing) {
    return existing;
  }

  // Get or create client first
  const clientId = await getOrCreateClient(companyId, eventData);
  if (!clientId) {
    return null;
  }

  // Create new entity
  const { data: newEntity, error } = await supabase
    .from('entities')
    .insert({
      client_id: clientId,
      whop_user_id: whopUserId,
      email: eventData.user_email || `user_${whopUserId}@test.com`,
      name: eventData.user_name || `User ${whopUserId}`,
      entity_type: 'student',
    })
    .select('id, client_id')
    .single();

  if (error) {
    console.error('Error creating entity:', error);
    return null;
  }

  return newEntity;
}

async function getOrCreateClient(whopCompanyId: string, eventData: any): Promise<string | null> {
  const planId = eventData.plan_id || eventData.membership_plan_id;
  const { tier, bundle } = planId ? getBundleInfo(planId) : { tier: 'free' as const, bundle: 'atom' };

  // Try to find existing client
  const { data: existing } = await supabase
    .from('clients')
    .select('id')
    .eq('company_id', whopCompanyId)
    .single();

  if (existing) {
    if (planId) {
      await supabase
        .from('clients')
        .update({
          current_tier: tier,
          whop_plan_id: planId,
          subscription_status: eventData.status || 'active',
        })
        .eq('id', existing.id);
    }
    return existing.id;
  }

  // Create new client
  const { data: newClient, error } = await supabase
    .from('clients')
    .insert({
      whop_user_id: whopCompanyId,
      company_id: whopCompanyId,
      email: eventData.company_email || `company_${whopCompanyId}@test.com`,
      name: eventData.company_name || `Company ${whopCompanyId}`,
      current_tier: tier,
      whop_plan_id: planId,
      subscription_status: eventData.status || 'active',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating client:', error);
    return null;
  }

  return newClient.id;
}

async function handleSpecificEventType(webhookData: any, entityId: string, clientId: string) {
  const { action, data } = webhookData;

  if (action.startsWith('membership.')) {
    const subscriptionData = extractSubscriptionData(webhookData);
    
    if (subscriptionData) {
      if (action === 'membership.created' || action === 'membership.renewed' || action === 'membership.experienced_claimed') {
        await supabase
          .from('subscriptions')
          .upsert({
            client_id: clientId,
            entity_id: entityId,
            whop_subscription_id: subscriptionData.whopSubscriptionId,
            plan_id: subscriptionData.planId,
            status: subscriptionData.status,
            amount: subscriptionData.amount,
            currency: subscriptionData.currency,
            started_at: subscriptionData.startedAt,
            expires_at: subscriptionData.expiresAt,
          }, {
            onConflict: 'whop_subscription_id',
          });

        if (action === 'membership.experienced_claimed') {
          await supabase.from('events').insert({
            client_id: clientId,
            entity_id: entityId,
            event_type: 'activity',
            event_data: {
              action: 'experience_claimed',
              experience_id: data.experience_id,
              subscription_id: data.id,
            },
          });
        }
      }
    }
  }
}

