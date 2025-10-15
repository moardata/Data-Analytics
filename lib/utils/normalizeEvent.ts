/**
 * Event Normalization Utilities
 * Converts Whop webhook events into our canonical database format
 */

import { Event } from '../supabase';

export interface WhopWebhookEvent {
  action: string;
  data: any;
  id?: string;
}

export interface NormalizedEvent {
  eventType: 'order' | 'subscription' | 'activity' | 'custom';
  eventData: Record<string, any>;
  whopEventId: string | null;
  userId: string | null;
}

/**
 * Normalizes a Whop webhook event into our standard format
 */
export function normalizeWhopEvent(webhookEvent: WhopWebhookEvent): NormalizedEvent {
  const { action, data, id } = webhookEvent;

  // Payment/Order events
  if (action === 'payment.succeeded' || action === 'payment.failed') {
    return {
      eventType: 'order',
      eventData: {
        action: action.split('.')[1], // 'succeeded' or 'failed'
        amount: data.final_amount || data.amount,
        amountAfterFees: data.amount_after_fees,
        currency: data.currency || 'USD',
        paymentId: data.id,
        productId: data.product_id,
        planId: data.plan_id,
        status: action === 'payment.succeeded' ? 'completed' : 'failed',
      },
      whopEventId: id || data.id || null,
      userId: data.user_id || data.customer_id || null,
    };
  }

  // Subscription events
  if (action.startsWith('membership.')) {
    const subAction = action.split('.')[1]; // 'created', 'cancelled', 'renewed', etc.
    return {
      eventType: 'subscription',
      eventData: {
        action: subAction,
        subscriptionId: data.id,
        planId: data.plan_id,
        productId: data.product_id,
        status: data.status,
        expiresAt: data.expires_at,
        renewalPeriod: data.renewal_period,
      },
      whopEventId: id || data.id || null,
      userId: data.user_id || null,
    };
  }

  // User activity events (if Whop adds these in the future)
  if (action.startsWith('user.') || action.startsWith('activity.')) {
    return {
      eventType: 'activity',
      eventData: {
        action: action,
        ...data,
      },
      whopEventId: id || data.id || null,
      userId: data.user_id || null,
    };
  }

  // Default: treat as custom event
  return {
    eventType: 'custom',
    eventData: {
      action,
      ...data,
    },
    whopEventId: id || null,
    userId: data.user_id || null,
  };
}

/**
 * Extracts subscription information from webhook data
 */
export function extractSubscriptionData(webhookEvent: WhopWebhookEvent) {
  const { action, data } = webhookEvent;

  if (!action.startsWith('membership.')) {
    return null;
  }

  return {
    whopSubscriptionId: data.id,
    planId: data.plan_id || 'unknown',
    status: mapWhopStatusToOurStatus(data.status),
    amount: data.amount || 0,
    currency: data.currency || 'USD',
    startedAt: data.valid_from || data.created_at || new Date().toISOString(),
    expiresAt: data.expires_at || null,
  };
}

/**
 * Maps Whop subscription statuses to our internal status values
 */
function mapWhopStatusToOurStatus(whopStatus: string): 'active' | 'cancelled' | 'expired' | 'trialing' {
  const statusMap: Record<string, 'active' | 'cancelled' | 'expired' | 'trialing'> = {
    active: 'active',
    completed: 'active',
    cancelled: 'cancelled',
    expired: 'expired',
    trialing: 'trialing',
    trial: 'trialing',
  };

  return statusMap[whopStatus?.toLowerCase()] || 'active';
}

/**
 * Validates that an event has the minimum required fields
 */
export function isValidWebhookEvent(event: any): boolean {
  if (!event || typeof event !== 'object') {
    return false;
  }

  // Must have an action
  if (!event.action || typeof event.action !== 'string') {
    return false;
  }

  // Must have data object
  if (!event.data || typeof event.data !== 'object') {
    return false;
  }

  return true;
}


