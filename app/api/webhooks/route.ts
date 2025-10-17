/**
 * Enhanced Webhook Handler for Creator Analytics
 * Processes Whop events (orders, subscriptions, activities) and stores them in the database
 */

import { waitUntil } from "@vercel/functions";
import { makeWebhookValidator } from "@whop/api";
import type { NextRequest } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase-server";
import { normalizeWhopEvent, extractSubscriptionData, isValidWebhookEvent } from "@/lib/utils/normalizeEvent";
import { getBundleInfo } from '@/lib/pricing/bundles';

const validateWebhook = makeWebhookValidator({
	webhookSecret: process.env.WHOP_WEBHOOK_SECRET ?? "fallback",
});

export async function POST(request: NextRequest): Promise<Response> {
	let webhookEventId: string | null = null;
	let webhookData: any = null;
	
	try {
		// Check if this is a test webhook (development/staging only)
		const isTestWebhook = request.headers.get('x-test-webhook') === 'true';
		const bypassValidation = process.env.BYPASS_WEBHOOK_VALIDATION === 'true';
		
		if (isTestWebhook || bypassValidation) {
			// For test webhooks, parse the body directly without validation
			const bodyText = await request.text();
			webhookData = JSON.parse(bodyText);
			console.log('🧪 Test webhook received (bypassing validation)', webhookData.action);
		} else {
			// Validate the webhook to ensure it's from Whop
			webhookData = await validateWebhook(request);
		}

		// Validate event structure
		if (!isValidWebhookEvent(webhookData)) {
			console.error('Invalid webhook event structure:', webhookData);
			return new Response("Invalid event structure", { status: 400 });
		}

		console.log(`Received webhook: ${webhookData.action}`, {
			action: webhookData.action,
			userId: (webhookData.data as any)?.user_id,
		});

		// Log webhook event to audit table
		const { data: webhookEvent } = await supabase
			.from('webhook_events')
			.insert({
				action: webhookData.action,
				payload: webhookData,
				status: 'received',
			})
			.select('id')
			.single();

		webhookEventId = webhookEvent?.id || null;

		// Process the webhook in the background to respond quickly
		waitUntil(processWebhookEvent(webhookData, webhookEventId));

		// Return 200 immediately to acknowledge receipt
		return new Response("OK", { status: 200 });
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		const errorStack = error instanceof Error ? error.stack : undefined;
		
		console.error('❌ Webhook processing error:', errorMessage);
		console.error('Error details:', {
			message: errorMessage,
			stack: errorStack,
			webhookData: webhookData ? { action: webhookData.action, dataKeys: Object.keys(webhookData.data || {}) } : 'No webhook data',
		});
		
		// Log error to webhook_events if we have an ID
		if (webhookEventId) {
			await supabase
				.from('webhook_events')
				.update({
					status: 'failed',
					error: errorMessage,
					processed_at: new Date().toISOString(),
				})
				.eq('id', webhookEventId);
		}
		
		// Return detailed error for debugging (still 200 to prevent retries)
		return new Response(JSON.stringify({ 
			error: errorMessage,
			details: webhookData ? { action: webhookData.action } : 'No webhook data',
			timestamp: new Date().toISOString()
		}), { 
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}

/**
 * Processes the webhook event and stores it in the database
 */
async function processWebhookEvent(webhookData: any, webhookEventId: string | null) {
	try {
		// Update status to processing
		if (webhookEventId) {
			await supabase
				.from('webhook_events')
				.update({ status: 'processing' })
				.eq('id', webhookEventId);
		}

		const normalized = normalizeWhopEvent(webhookData);
		const { userId } = normalized;

		if (!userId) {
			console.warn('No user ID in webhook event, skipping:', webhookData.action);
			
			// Mark as completed even if skipped
			if (webhookEventId) {
				await supabase
					.from('webhook_events')
					.update({
						status: 'completed',
						processed_at: new Date().toISOString(),
						metadata: { skipped: true, reason: 'No user ID' },
					})
					.eq('id', webhookEventId);
			}
			return;
		}

		// Get or create the entity (student/user)
		const entity = await getOrCreateEntity(userId, webhookData.data);
		if (!entity) {
			console.error('Failed to get or create entity for user:', userId);
			
			// Mark as failed
			if (webhookEventId) {
				await supabase
					.from('webhook_events')
					.update({
						status: 'failed',
						error: 'Failed to get or create entity',
						processed_at: new Date().toISOString(),
					})
					.eq('id', webhookEventId);
			}
			return;
		}

		const clientId = entity.client_id;

		// Store the event
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
			console.error('Error storing event:', eventError);
			
			// Mark as failed
			if (webhookEventId) {
				await supabase
					.from('webhook_events')
					.update({
						status: 'failed',
						error: `Failed to store event: ${eventError.message}`,
						processed_at: new Date().toISOString(),
					})
					.eq('id', webhookEventId);
			}
			return;
		}

		console.log(`Stored ${normalized.eventType} event for user ${userId}`);

		// Handle specific event types
		await handleSpecificEventType(webhookData, entity.id, clientId);

		// Mark as completed
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

	} catch (error) {
		console.error('Error in processWebhookEvent:', error);
		
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
	}
}

/**
 * Handles event-type-specific logic
 */
async function handleSpecificEventType(webhookData: any, entityId: string, clientId: string) {
	const { action, data } = webhookData;

	// Handle payment success
	if (action === 'payment.succeeded') {
		console.log(`Payment succeeded: $${data.final_amount} ${data.currency} from user ${data.user_id}`);
		// Could trigger email notifications, update user status, etc.
	}

	// Handle subscription events
	if (action.startsWith('membership.')) {
		const subscriptionData = extractSubscriptionData(webhookData);
		
		if (subscriptionData) {
			if (action === 'membership.created' || action === 'membership.renewed') {
				// Create or update subscription
				await upsertSubscription(clientId, entityId, subscriptionData);
			} else if (action === 'membership.cancelled') {
				// Update subscription status to cancelled
				await updateSubscriptionStatus(subscriptionData.whopSubscriptionId, 'cancelled');
			} else if (action === 'membership.expired') {
				// Update subscription status to expired
				await updateSubscriptionStatus(subscriptionData.whopSubscriptionId, 'expired');
			} else if (action === 'membership.experienced_claimed') {
				// Handle experience claim - create or update subscription
				console.log(`Experience claimed for user ${data.user_id}:`, data);
				await upsertSubscription(clientId, entityId, subscriptionData);
				
				// Also create an activity event for engagement tracking
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

	// Handle payment failures
	if (action === 'payment.failed') {
		console.warn(`Payment failed for user ${data.user_id}:`, data);
		// Store failed payment event
		await supabase.from('events').insert({
			client_id: clientId,
			entity_id: entityId,
			event_type: 'payment_failed',
			event_data: {
				amount: data.final_amount,
				currency: data.currency,
				reason: data.failure_reason,
			},
		});
	}

	// Handle refunds
	if (action === 'payment.refunded') {
		console.log(`Payment refunded: $${data.final_amount} ${data.currency} for user ${data.user_id}`);
		await supabase.from('events').insert({
			client_id: clientId,
			entity_id: entityId,
			event_type: 'payment_refunded',
			event_data: {
				amount: data.final_amount,
				currency: data.currency,
				refund_reason: data.refund_reason,
				original_payment_id: data.payment_id,
			},
		});
	}

	// Handle disputes
	if (action === 'payment.disputed') {
		console.warn(`Payment disputed: $${data.final_amount} ${data.currency} for user ${data.user_id}`);
		await supabase.from('events').insert({
			client_id: clientId,
			entity_id: entityId,
			event_type: 'payment_disputed',
			event_data: {
				amount: data.final_amount,
				currency: data.currency,
				dispute_reason: data.dispute_reason,
				payment_id: data.payment_id,
			},
		});
	}

	// Handle dispute resolutions
	if (action === 'payment.dispute_resolved') {
		console.log(`Dispute resolved for payment ${data.payment_id}: ${data.resolution}`);
		await supabase.from('events').insert({
			client_id: clientId,
			entity_id: entityId,
			event_type: 'payment_dispute_resolved',
			event_data: {
				payment_id: data.payment_id,
				resolution: data.resolution,
				amount: data.final_amount,
			},
		});
	}
}

/**
 * Gets an existing entity or creates a new one
 * Also ensures the client (company) exists
 */
async function getOrCreateEntity(whopUserId: string, eventData: any) {
	// First, try to find the entity
	const { data: existing } = await supabase
		.from('entities')
		.select('*')
		.eq('whop_user_id', whopUserId)
		.single();

	if (existing) {
		return existing;
	}

	// Get company_id from event data
	const companyId = eventData.company_id || eventData.owned_by;
	
	if (!companyId) {
		console.error('No company_id found in webhook event data:', eventData);
		return null;
	}

	// Get or create the client (company/creator)
	let clientId = await getOrCreateClient(companyId, eventData);
	
	if (!clientId) {
		console.error('Failed to get or create client');
		return null;
	}

	// Create new entity (student/member)
	const { data: newEntity, error } = await supabase
		.from('entities')
		.insert({
			client_id: clientId,
			whop_user_id: whopUserId,
			email: eventData.email || null,
			name: eventData.name || eventData.username || null,
			metadata: {},
		})
		.select()
		.single();

	if (error) {
		console.error('Error creating entity:', error);
		return null;
	}

	console.log(`Created new entity for user ${whopUserId}`);
	return newEntity;
}

/**
 * Gets or creates a client (company/creator) record
 */
async function getOrCreateClient(whopCompanyId: string, eventData: any): Promise<string | null> {
	// Determine tier and bundle from plan_id (if provided)
	const planId = eventData.plan_id || eventData.membership_plan_id;
	const { tier, bundle } = planId ? getBundleInfo(planId) : { tier: 'free' as const, bundle: 'atom' };

	// Try to find existing client
	const { data: existing } = await supabase
		.from('clients')
		.select('id')
		.eq('company_id', whopCompanyId)
		.single();

	if (existing) {
		// Update tier if they purchased a plan
		if (planId) {
			await supabase
				.from('clients')
				.update({
					current_tier: tier,
					whop_plan_id: planId,
					subscription_status: eventData.status || 'active',
				})
				.eq('id', existing.id);
			
			console.log(`Updated client ${whopCompanyId} to tier: ${tier} (bundle: ${bundle})`);
		}
		return existing.id;
	}

	// Create new client for this company
	const { data: newClient, error } = await supabase
		.from('clients')
		.insert({
			whop_user_id: whopCompanyId, // Company ID is the owner
			company_id: whopCompanyId,
			email: eventData.company_email || `company_${whopCompanyId}@whop.com`,
			name: eventData.company_name || `Company ${whopCompanyId}`,
			current_tier: tier, // Use standardized tier system
			whop_plan_id: planId,
			subscription_status: eventData.status || 'active',
		})
		.select('id')
		.single();

	if (error) {
		console.error('Error creating client:', error);
		return null;
	}

	console.log(`Created new client for company ${whopCompanyId} with tier: ${tier} (bundle: ${bundle})`);
	return newClient.id;
}

/**
 * Creates or updates a subscription
 */
async function upsertSubscription(clientId: string, entityId: string, subscriptionData: any) {
	const { error } = await supabase
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

	if (error) {
		console.error('Error upserting subscription:', error);
	} else {
		console.log(`Upserted subscription ${subscriptionData.whopSubscriptionId}`);
	}
}

/**
 * Updates subscription status
 */
async function updateSubscriptionStatus(whopSubscriptionId: string, status: string) {
	const { error } = await supabase
		.from('subscriptions')
		.update({ status })
		.eq('whop_subscription_id', whopSubscriptionId);

	if (error) {
		console.error('Error updating subscription status:', error);
	} else {
		console.log(`Updated subscription ${whopSubscriptionId} to ${status}`);
	}
}
