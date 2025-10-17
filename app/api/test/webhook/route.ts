/**
 * Test Webhook Endpoint
 * Allows manual testing of webhook processing with mock data
 * Only available in development mode
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { normalizeWhopEvent, extractSubscriptionData } from '@/lib/utils/normalizeEvent';
import { getBundleInfo } from '@/lib/pricing/bundles';

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Test endpoint only available in development' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { eventType, companyId } = body;

    if (!eventType || !companyId) {
      return NextResponse.json(
        { error: 'Missing eventType or companyId' },
        { status: 400 }
      );
    }

    // Create mock webhook data based on event type
    const mockWebhookData = createMockWebhookData(eventType, companyId);
    
    // Process the webhook (simulate the webhook handler)
    const result = await processTestWebhook(mockWebhookData, companyId);

    return NextResponse.json({
      success: true,
      eventType,
      companyId,
      mockData: mockWebhookData,
      result,
    });

  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process test webhook' },
      { status: 500 }
    );
  }
}

function createMockWebhookData(eventType: string, companyId: string) {
  const baseData = {
    user_id: `test_user_${Date.now()}`,
    company_id: companyId,
    email: `test${Date.now()}@example.com`,
    name: `Test User ${Date.now()}`,
  };

  switch (eventType) {
    case 'payment.succeeded':
      return {
        action: 'payment.succeeded',
        data: {
          ...baseData,
          final_amount: 29.99,
          currency: 'USD',
          product_id: 'test_product',
          plan_id: 'plan_hnYnLn6egXRis', // Core plan
          id: `payment_${Date.now()}`,
        },
        id: `webhook_${Date.now()}`,
      };

    case 'membership.created':
      return {
        action: 'membership.created',
        data: {
          ...baseData,
          id: `membership_${Date.now()}`,
          plan_id: 'plan_hnYnLn6egXRis', // Core plan
          status: 'active',
          amount: 20.00,
          currency: 'USD',
          valid_from: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        },
        id: `webhook_${Date.now()}`,
      };

    case 'membership.cancelled':
      return {
        action: 'membership.cancelled',
        data: {
          ...baseData,
          id: `membership_${Date.now()}`,
          plan_id: 'plan_hnYnLn6egXRis',
          status: 'cancelled',
        },
        id: `webhook_${Date.now()}`,
      };

    case 'payment.refunded':
      return {
        action: 'payment.refunded',
        data: {
          ...baseData,
          final_amount: 29.99,
          currency: 'USD',
          payment_id: `payment_${Date.now()}`,
          refund_reason: 'Customer request',
        },
        id: `webhook_${Date.now()}`,
      };

    default:
      throw new Error(`Unknown event type: ${eventType}`);
  }
}

async function processTestWebhook(webhookData: any, companyId: string) {
  const normalized = normalizeWhopEvent(webhookData);
  const { userId } = normalized;

  // Get or create client
  const { data: clientData } = await supabase
    .from('clients')
    .select('id')
    .eq('company_id', companyId)
    .single();

  if (!clientData) {
    // Create test client
    const { data: newClient } = await supabase
      .from('clients')
      .insert({
        whop_user_id: companyId,
        company_id: companyId,
        email: `company_${companyId}@test.com`,
        name: `Test Company ${companyId}`,
        current_tier: 'free',
        subscription_status: 'active',
      })
      .select('id')
      .single();

    if (!newClient) {
      throw new Error('Failed to create test client');
    }
    clientData = newClient;
  }

  const clientId = clientData.id;

  // Get or create entity
  let { data: entity } = await supabase
    .from('entities')
    .select('*')
    .eq('whop_user_id', userId)
    .eq('client_id', clientId)
    .single();

  if (!entity) {
    const { data: newEntity } = await supabase
      .from('entities')
      .insert({
        client_id: clientId,
        whop_user_id: userId,
        email: webhookData.data.email,
        name: webhookData.data.name,
        metadata: {},
      })
      .select()
      .single();

    if (!newEntity) {
      throw new Error('Failed to create test entity');
    }
    entity = newEntity;
  }

  // Store the event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert({
      client_id: clientId,
      entity_id: entity.id,
      event_type: normalized.eventType,
      event_data: normalized.eventData,
      whop_event_id: normalized.whopEventId,
    })
    .select()
    .single();

  if (eventError) {
    throw new Error(`Failed to store event: ${eventError.message}`);
  }

  // Handle subscription events
  if (webhookData.action.startsWith('membership.')) {
    const subscriptionData = extractSubscriptionData(webhookData);
    if (subscriptionData) {
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
          client_id: clientId,
          entity_id: entity.id,
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

      if (subError) {
        console.warn('Failed to upsert subscription:', subError);
      }
    }
  }

  return {
    clientId,
    entityId: entity.id,
    eventId: event.id,
    eventType: normalized.eventType,
    eventData: normalized.eventData,
  };
}
