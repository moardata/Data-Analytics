/**
 * Enhanced Webhook Handler for Creator Analytics
 * Processes Whop events (orders, subscriptions, activities) and stores them in the database
 */

import { waitUntil } from "@vercel/functions";
import type { NextRequest } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase-server";
import { normalizeWhopEvent, extractSubscriptionData, isValidWebhookEvent } from "@/lib/utils/normalizeEvent";
import { getBundleInfo } from '@/lib/pricing/bundles';
import { checkLimit } from '@/lib/pricing/usage-tracker';
import { type TierName } from '@/lib/pricing/tiers';
import { makeWebhookValidator } from "@whop/api";

// Production webhook validation enabled
const validateWebhook = makeWebhookValidator({ 
  webhookSecret: process.env.WHOP_WEBHOOK_SECRET! 
});

export async function POST(request: NextRequest): Promise<Response> {
	let webhookEventId: string | null = null;
	let webhookData: any = null;
	
	try {
		console.log('🔔 [Webhook] Received webhook request');
		
		// Validate webhook signature and parse data
		webhookData = await validateWebhook(request);
		
		console.log('✅ [Webhook] Signature validated');
		console.log('📦 [Webhook] Action:', webhookData?.action);
		console.log('📦 [Webhook] Data keys:', Object.keys(webhookData?.data || {}));

		// Validate event structure
		if (!isValidWebhookEvent(webhookData)) {
			console.error('Invalid webhook event structure:', webhookData);
			return new Response(JSON.stringify({ 
				error: "Invalid webhook event structure",
				receivedData: webhookData,
				expectedFormat: "action, data, id"
			}), { 
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

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
		return new Response(JSON.stringify({
			status: 'received',
			action: webhookData.action,
			version: 'v1.0-production',
			timestamp: new Date().toISOString()
		}), { 
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
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
		
		// Return error (still 200 to prevent retries)
		return new Response(JSON.stringify({ 
			error: errorMessage,
			details: webhookData ? { action: webhookData.action } : 'No webhook data',
			timestamp: new Date().toISOString(),
			version: 'v1.0-production'
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
		const entity = await getOrCreateEntity(userId, webhookData.data, webhookData.action);
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


	// Handle specific event types
	await handleSpecificEventType(webhookData, entity.id, clientId);

	// Enhanced data collection for AI insights
	await collectEventDataForAI(webhookData, entity.id, clientId);

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
		// Could trigger email notifications, update user status, etc.
	}

	// Handle subscription events
	if (action.startsWith('membership.')) {
		const subscriptionData = extractSubscriptionData(webhookData);
		
		if (subscriptionData) {
			if (action === 'membership.created' || action === 'membership.renewed') {
				// Create or update subscription
				await upsertSubscription(clientId, entityId, subscriptionData);
				
				// Track member activity
				await supabase.from('events').insert({
					client_id: clientId,
					entity_id: entityId,
					event_type: 'activity',
					event_data: {
						action: action === 'membership.created' ? 'member_joined' : 'membership_renewed',
						membership_id: data.id,
						plan_id: data.plan_id,
					},
				});
			} else if (action === 'membership.cancelled') {
				// Update subscription status to cancelled
				await updateSubscriptionStatus(subscriptionData.whopSubscriptionId, 'cancelled');
				
				// Track cancellation
				await supabase.from('events').insert({
					client_id: clientId,
					entity_id: entityId,
					event_type: 'activity',
					event_data: {
						action: 'membership_cancelled',
						membership_id: data.id,
					},
				});
			} else if (action === 'membership.expired') {
				// Update subscription status to expired
				await updateSubscriptionStatus(subscriptionData.whopSubscriptionId, 'expired');
				
				// Track expiration
				await supabase.from('events').insert({
					client_id: clientId,
					entity_id: entityId,
					event_type: 'activity',
					event_data: {
						action: 'membership_expired',
						membership_id: data.id,
					},
				});
			} else if (action === 'membership.experienced_claimed') {
				// Handle experience claim - create or update subscription
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
	
	// Handle member-specific events (if Whop sends them)
	if (action === 'member.created' || action === 'member.joined' || action === 'member.updated') {
		// Ensure entity exists and is up-to-date
		const whopUserId = data.user_id || data.user?.id || data.id;
		if (whopUserId && entityId) {
			// Update entity with latest member data
			const updateData: any = {};
			if (data.name || data.username) updateData.name = data.name || data.username;
			if (data.email) updateData.email = data.email;
			if (data.avatar || data.avatar_url || data.profile_picture_url) {
				updateData.metadata = {
					avatar_url: data.avatar || data.avatar_url || data.profile_picture_url,
				};
			}
			
			if (Object.keys(updateData).length > 0) {
				await supabase
					.from('entities')
					.update(updateData)
					.eq('id', entityId);
			}
			
			// Track member activity
			await supabase.from('events').insert({
				client_id: clientId,
				entity_id: entityId,
				event_type: 'activity',
				event_data: {
					action: action.replace('member.', 'member_'),
					member_id: whopUserId,
				},
			});
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
async function getOrCreateEntity(whopUserId: string, eventData: any, webhookAction?: string) {
	// First, try to find the entity
	const { data: existing } = await supabase
		.from('entities')
		.select('*')
		.eq('whop_user_id', whopUserId)
		.single();

	if (existing) {
		// Update entity with any new data from webhook
		const userName = eventData.name || 
		                 eventData.username || 
		                 eventData.user_name ||
		                 eventData.display_name ||
		                 eventData.full_name;
		
		const userEmail = eventData.email || 
		                  eventData.user_email;
		
		// Only update if we got new data
		const updates: any = {};
		if (userName && !existing.name) updates.name = userName;
		if (userEmail && !existing.email) updates.email = userEmail;
		
		// Merge new metadata
		if (eventData.avatar || eventData.avatar_url || eventData.discord_id || eventData.telegram_id) {
			const newMetadata = {
				...existing.metadata,
				...(eventData.avatar && { avatar: eventData.avatar }),
				...(eventData.avatar_url && { avatar_url: eventData.avatar_url }),
				...(eventData.discord_id && { discord_id: eventData.discord_id }),
				...(eventData.telegram_id && { telegram_id: eventData.telegram_id }),
				...(eventData.country && { country: eventData.country }),
			};
			updates.metadata = newMetadata;
		}
		
		// Update if we have new data
		if (Object.keys(updates).length > 0) {
			await supabase
				.from('entities')
				.update(updates)
				.eq('id', existing.id);
			
		}
		
		return existing;
	}

	// Get company_id from event data
	const companyId = eventData.company_id || eventData.owned_by;
	
	if (!companyId) {
		console.error('No company_id found in webhook event data:', eventData);
		return null;
	}

	// Get or create the client (company/creator)
	// Pass the webhook action so we can better extract plan_id for membership events
	let clientId = await getOrCreateClient(companyId, eventData, webhookAction);
	
	if (!clientId) {
		console.error('Failed to get or create client');
		return null;
	}

	// Extract user data from webhook (Whop sends different fields in different events)
	const userName = eventData.name || 
	                 eventData.username || 
	                 eventData.user_name ||
	                 eventData.display_name ||
	                 eventData.full_name ||
	                 null;
	
	const userEmail = eventData.email || 
	                  eventData.user_email ||
	                  null;
	
	// Create metadata with any additional user info
	const metadata: any = {};
	if (eventData.avatar) metadata.avatar = eventData.avatar;
	if (eventData.avatar_url) metadata.avatar_url = eventData.avatar_url;
	if (eventData.discord_id) metadata.discord_id = eventData.discord_id;
	if (eventData.telegram_id) metadata.telegram_id = eventData.telegram_id;
        if (eventData.country) metadata.country = eventData.country;
        if (eventData.social) metadata.social = eventData.social;

        // CHECK STUDENT LIMIT BEFORE CREATING NEW ENTITY
	const { data: clientCheck } = await supabase
		.from('clients')
		.select('current_tier')
		.eq('id', clientId)
		.single();
	
	if (clientCheck) {
		const tier = (clientCheck.current_tier || 'starter') as TierName;
		const limitCheck = await checkLimit(companyId, tier, 'addStudent');
		
		if (!limitCheck.allowed) {
			console.warn(`⚠️ [Webhook] Student limit reached for company ${companyId}:`, limitCheck.reason);
			// Don't create the entity - they've hit their limit
			// In a real scenario, you might want to notify the creator
			return null;
		}
	}

	// Create new entity (student/member)
	const { data: newEntity, error } = await supabase
		.from('entities')
		.insert({
			client_id: clientId,
			whop_user_id: whopUserId,
			email: userEmail,
			name: userName,
			metadata,
		})
		.select()
		.single();

	if (error) {
		console.error('Error creating entity:', error);
		return null;
	}

	return newEntity;
}

/**
 * Gets or creates a client (company/creator) record
 */
async function getOrCreateClient(whopCompanyId: string, eventData: any, webhookAction?: string): Promise<string | null> {
	// Determine tier and bundle from plan_id (if provided)
	// Check multiple possible locations for plan_id in webhook data
	let planId = eventData.plan_id || 
	             eventData.membership_plan_id || 
	             eventData.plan?.id ||  // Nested plan object
	             eventData.membership?.plan?.id ||  // Nested membership.plan
	             (typeof eventData.plan === 'string' ? eventData.plan : null);  // Plan as string ID
	
	// Track whether planId came from webhook (reliable) or API fallback (less reliable)
	let planIdFromWebhook = !!planId;
	
	console.log(`📦 [Webhook] Processing client: ${whopCompanyId}`);
	console.log(`📦 [Webhook] Event data keys:`, Object.keys(eventData));
	console.log(`📦 [Webhook] Plan ID from webhook: ${planId || 'MISSING'}`);
	console.log(`📦 [Webhook] Webhook action: ${webhookAction || 'unknown'}`);
	
	// For membership events, try to get plan_id from the membership object if available
	if (!planId && webhookAction?.startsWith('membership.')) {
		// If this is a membership event, the plan_id should be in the membership data
		// Check if we have a membership ID to fetch the specific membership
		const membershipId = eventData.id || eventData.membership_id;
		if (membershipId) {
			console.log(`🔍 [Webhook] Membership event detected, trying to fetch specific membership ${membershipId}...`);
			try {
				const { whopSdk } = await import('@/lib/whop-sdk');
				// Try to get the specific membership from the webhook
				try {
					const membership = await whopSdk.client.memberships.retrieve(membershipId);
					if (membership) {
						planId = (membership as any).plan?.id || (membership as any).plan_id;
						// This is reliable because we matched by membership ID from the webhook
						planIdFromWebhook = true;
						console.log(`✅ [Webhook] Fetched plan_id from specific membership: ${planId}`);
					}
				} catch (retrieveError: any) {
					console.log(`⚠️  [Webhook] Could not retrieve specific membership, will try list API: ${retrieveError.message}`);
				}
			} catch (apiError: any) {
				console.error(`❌ [Webhook] Failed to fetch membership:`, apiError.message);
			}
		}
	}
	
	// If still no plan_id, try to fetch from Whop API directly (last resort)
	// This should be avoided when possible as it may return a different plan
	if (!planId) {
		console.log(`⚠️  [Webhook] No plan_id in webhook data, fetching from Whop API (this may return a different plan)...`);
		try {
			const { whopSdk } = await import('@/lib/whop-sdk');
			const membershipsResult = await whopSdk.client.memberships.list({
				company_id: whopCompanyId,
			});
			
			if (membershipsResult.data && membershipsResult.data.length > 0) {
				// For membership events, try to match by membership ID first
				const membershipId = eventData.id || eventData.membership_id;
				let matchedMembership = null;
				
				if (membershipId) {
					matchedMembership = (membershipsResult.data as any[]).find((m: any) => 
						m.id === membershipId || m.membership_id === membershipId
					);
					if (matchedMembership) {
						console.log(`✅ [Webhook] Found matching membership by ID in API results`);
						// This is reliable because we matched by membership ID from the webhook
						planIdFromWebhook = true;
					}
				}
				
				// If no match, get the first valid membership's plan_id (active OR trialing)
				if (!matchedMembership) {
					const memberships = membershipsResult.data as any[];
					matchedMembership = memberships.find((m: any) => 
						m.status === 'active' || 
						m.status === 'trialing' || 
						m.status === 'trial' ||
						m.valid === true
					) || memberships[0];
					// This is NOT reliable - it's a fallback and may not match the current webhook
					planIdFromWebhook = false;
					console.log(`⚠️  [Webhook] Using first valid membership (may not match current webhook event) - NOT updating whop_plan_id`);
				}
				
				// FIXED: Plan ID is nested under plan.id
				planId = matchedMembership?.plan?.id || matchedMembership?.plan_id;
				console.log(`✅ [Webhook] Fetched plan_id from Whop API: ${planId} (from webhook: ${planIdFromWebhook})`);
			} else {
				console.log(`⚠️  [Webhook] No valid memberships found in Whop API`);
			}
		} catch (apiError: any) {
			console.error(`❌ [Webhook] Failed to fetch from Whop API:`, apiError.message);
		}
	}
	
	const { tier, bundle } = planId ? getBundleInfo(planId) : { tier: null as any, bundle: 'starter' };
	
	console.log(`📊 [Webhook] Determined tier: ${tier || 'none'}, bundle: ${bundle}, plan: ${planId || 'none'}`);

	// Try to find existing client
	const { data: existing } = await supabase
		.from('clients')
		.select('id, current_tier, whop_plan_id')
		.eq('company_id', whopCompanyId)
		.single();

	if (existing) {
		console.log(`📌 [Webhook] Found existing client:`, {
			id: existing.id,
			current_tier: existing.current_tier,
			whop_plan_id: existing.whop_plan_id
		});
		
		// Update tier if they purchased a plan
		// Only update whop_plan_id if we got it reliably from the webhook (not from API fallback)
		if (planId) {
			const trialEndsAt = eventData.trial_end_date || eventData.trial_ends_at || eventData.valid_until || null;
			const isTrialing = eventData.status === 'trialing' || (trialEndsAt && new Date(trialEndsAt) > new Date());
			
			const updateData: any = {
				current_tier: tier,
				subscription_status: isTrialing ? 'trialing' : (eventData.status || 'active'),
				trial_ends_at: trialEndsAt,
				updated_at: new Date().toISOString(),
			};
			
			// Only update whop_plan_id if we got it from the webhook or matched membership
			// This prevents overwriting with a different plan from API fallback
			if (planIdFromWebhook) {
				updateData.whop_plan_id = planId;
				console.log(`✅ [Webhook] Updating whop_plan_id to ${planId} (from webhook)`);
			} else {
				console.log(`⚠️  [Webhook] NOT updating whop_plan_id - planId came from API fallback and may not match current webhook`);
			}
			
			console.log(`🔄 [Webhook] Updating client with:`, updateData);
			
			const { error: updateError } = await supabase
				.from('clients')
				.update(updateData)
				.eq('id', existing.id);
			
			if (updateError) {
				console.error(`❌ [Webhook] Failed to update client:`, updateError);
			} else {
				console.log(`✅ [Webhook] Updated client ${whopCompanyId}: ${existing.current_tier || 'none'} → ${tier || 'none'}, Trial: ${isTrialing}`);
			}
		} else {
			console.log(`⚠️  [Webhook] Skipping tier update - no plan_id available`);
		}
		return existing.id;
	}

	// Create new client for this company
	// Extract trial info from Whop webhook
	const trialEndsAt = eventData.trial_end_date || eventData.trial_ends_at || eventData.valid_until || null;
	const isTrialing = eventData.status === 'trialing' || (trialEndsAt && new Date(trialEndsAt) > new Date());
	
	console.log(`🆕 [Webhook] Creating client - Trial: ${isTrialing}, Ends: ${trialEndsAt}`);
	if (planId && !planIdFromWebhook) {
		console.log(`⚠️  [Webhook] Creating new client with planId from API fallback - may not match webhook event`);
	}
	
	const { data: newClient, error } = await supabase
		.from('clients')
		.insert({
			whop_user_id: whopCompanyId, // Company ID is the owner
			company_id: whopCompanyId,
			email: eventData.company_email || `company_${whopCompanyId}@whop.com`,
			name: eventData.company_name || `Company ${whopCompanyId}`,
			current_tier: tier, // Use standardized tier system
			whop_plan_id: planId, // For new clients, we use planId even if from fallback
			subscription_status: isTrialing ? 'trialing' : (eventData.status || 'active'),
			trial_ends_at: trialEndsAt,  // ✅ NOW SAVES TRIAL DATE!
		})
		.select('id')
		.single();

	if (error) {
		console.error('❌ [Webhook] Error creating client:', error);
		return null;
	}

	console.log(`✅ [Webhook] Created new client ${whopCompanyId} with tier: ${tier || 'none'} (bundle: ${bundle})`);
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
	}
}

/**
 * Enhanced data collection for AI insights
 * Collects and processes event data specifically for AI analysis
 */
async function collectEventDataForAI(webhookData: any, entityId: string, clientId: string) {
	try {
		const { action, data } = webhookData;
		
		// Track course completion events
		if (action === 'membership.experienced_claimed' || action === 'membership.created') {
			await supabase.from('events').insert({
				client_id: clientId,
				entity_id: entityId,
				event_type: 'course_enrollment',
				event_data: {
					action: 'enrolled',
					experience_id: data.experience_id,
					plan_id: data.plan_id,
					enrollment_date: new Date().toISOString()
				}
			});
		}

		// Track activity events for engagement analysis
		if (action === 'membership.experienced_claimed') {
			await supabase.from('events').insert({
				client_id: clientId,
				entity_id: entityId,
				event_type: 'engagement',
				event_data: {
					action: 'course_access',
					experience_id: data.experience_id,
					engagement_type: 'initial_access',
					timestamp: new Date().toISOString()
				}
			});
		}

		// Track payment events for revenue analysis
		if (action === 'payment.succeeded') {
			await supabase.from('events').insert({
				client_id: clientId,
				entity_id: entityId,
				event_type: 'revenue',
				event_data: {
					action: 'payment_received',
					amount: data.final_amount,
					currency: data.currency,
					payment_method: data.payment_method,
					revenue_date: new Date().toISOString()
				}
			});
		}

		// Track subscription changes for retention analysis
		if (action.startsWith('membership.')) {
			await supabase.from('events').insert({
				client_id: clientId,
				entity_id: entityId,
				event_type: 'subscription_change',
				event_data: {
					action: action,
					plan_id: data.plan_id,
					status: data.status,
					change_date: new Date().toISOString()
				}
			});
		}

		
	} catch (error) {
		console.error('Error in enhanced data collection:', error);
		// Don't throw - this is supplementary data collection
	}
}
