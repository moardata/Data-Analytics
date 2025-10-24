/**
 * Backend Tracking Guide
 * Shows where webhook triggers and simulations are tracked in the backend
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function showBackendTracking() {
  console.log('🔍 Backend Tracking Guide for Webhook Triggers & Simulations\n');

  console.log('📊 1. WEBHOOK EVENT TRACKING');
  console.log('   Location: /app/api/webhooks/route.ts');
  console.log('   What it tracks:');
  console.log('   - All incoming webhook events');
  console.log('   - Event processing status (received → processing → completed/failed)');
  console.log('   - Error handling and retry logic');
  console.log('   - Event normalization and storage');
  console.log('');

  // Check webhook events table
  try {
    const { data: webhookEvents, error } = await supabase
      .from('webhook_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.log('   ⚠️  webhook_events table not found or error:', error.message);
    } else {
      console.log(`   📈 Recent webhook events: ${webhookEvents.length}`);
      if (webhookEvents.length > 0) {
        console.log('   📋 Latest webhook events:');
        webhookEvents.forEach((event, i) => {
          console.log(`     ${i + 1}. ${event.action} - ${event.status} (${new Date(event.created_at).toLocaleString()})`);
        });
      }
    }
  } catch (err) {
    console.log('   ❌ Error checking webhook events:', err.message);
  }

  console.log('\n📊 2. EVENT PROCESSING TRACKING');
  console.log('   Location: /app/api/webhooks/route.ts → processWebhookEvent()');
  console.log('   What it tracks:');
  console.log('   - Entity creation/updates');
  console.log('   - Event storage in events table');
  console.log('   - Specific event type handling (membership, payment, etc.)');
  console.log('   - AI data collection for insights');
  console.log('');

  // Check events table
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('event_type, created_at, client_id')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.log('   ❌ Error checking events:', error.message);
    } else {
      console.log(`   📈 Recent events: ${events.length}`);
      if (events.length > 0) {
        console.log('   📋 Latest events:');
        events.forEach((event, i) => {
          console.log(`     ${i + 1}. ${event.event_type} - Client: ${event.client_id.slice(0, 8)}... (${new Date(event.created_at).toLocaleString()})`);
        });
      }
    }
  } catch (err) {
    console.log('   ❌ Error checking events:', err.message);
  }

  console.log('\n📊 3. CRON JOB TRACKING');
  console.log('   Locations:');
  console.log('   - /app/api/cron/metrics-light/route.ts (Every 15 minutes)');
  console.log('   - /app/api/cron/metrics-medium/route.ts (Every hour)');
  console.log('   - /app/api/cron/metrics-heavy/route.ts (Every 6 hours)');
  console.log('   What they track:');
  console.log('   - Metric calculation status');
  console.log('   - Cache storage and expiration');
  console.log('   - Processing errors and retries');
  console.log('   - Client processing counts');
  console.log('');

  // Check cached metrics
  try {
    const { data: cachedMetrics, error } = await supabase
      .from('cached_dashboard_metrics')
      .select('*')
      .order('calculated_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.log('   ❌ Error checking cached metrics:', error.message);
    } else {
      console.log(`   📈 Cached metrics: ${cachedMetrics.length}`);
      if (cachedMetrics.length > 0) {
        console.log('   📋 Latest cached metrics:');
        cachedMetrics.forEach((metric, i) => {
          const isExpired = new Date(metric.expires_at) < new Date();
          console.log(`     ${i + 1}. ${metric.metric_type} - ${isExpired ? '❌ Expired' : '✅ Fresh'} (${new Date(metric.calculated_at).toLocaleString()})`);
        });
      } else {
        console.log('   📊 No cached metrics yet (cron jobs haven\'t run)');
      }
    }
  } catch (err) {
    console.log('   ❌ Error checking cached metrics:', err.message);
  }

  console.log('\n📊 4. DASHBOARD METRICS TRACKING');
  console.log('   Location: /app/api/dashboard/metrics/route.ts');
  console.log('   What it tracks:');
  console.log('   - Cache hit/miss rates');
  console.log('   - Metric calculation triggers');
  console.log('   - API response times');
  console.log('   - Error handling for missing data');
  console.log('');

  console.log('\n📊 5. SIMULATION DATA TRACKING');
  console.log('   Your simulation created:');
  console.log('   - 44 students for biz_Jkhjc11f6HHRxh');
  console.log('   - 40 students for biz_3GYHNPbGkZCEky');
  console.log('   - 2,000+ events across both companies');
  console.log('   - 44 form submissions for feedback analysis');
  console.log('   - Realistic engagement patterns and aha moments');
  console.log('');

  console.log('\n📊 6. WHERE TO MONITOR:');
  console.log('   🔍 Supabase Dashboard:');
  console.log('   - Table Editor → webhook_events (webhook processing)');
  console.log('   - Table Editor → events (all activity)');
  console.log('   - Table Editor → cached_dashboard_metrics (calculated metrics)');
  console.log('   - Table Editor → entities (students/users)');
  console.log('   - Table Editor → form_submissions (feedback data)');
  console.log('');
  
  console.log('   🔍 Vercel Dashboard:');
  console.log('   - Functions → View logs for cron job execution');
  console.log('   - Functions → /api/cron/metrics-light (15min)');
  console.log('   - Functions → /api/cron/metrics-medium (1hr)');
  console.log('   - Functions → /api/cron/metrics-heavy (6hr)');
  console.log('');
  
  console.log('   🔍 Application Logs:');
  console.log('   - Console logs in webhook processing');
  console.log('   - Cron job execution logs');
  console.log('   - Error tracking and debugging');
  console.log('');

  console.log('\n📊 7. TRACKING TIMELINE:');
  console.log('   ⏰ Every 15 minutes: Popular content updates');
  console.log('   ⏰ Every hour: Engagement & commitment scores');
  console.log('   ⏰ Every 6 hours: Pathways & aha moments');
  console.log('   ⏰ Real-time: Webhook event processing');
  console.log('   ⏰ On-demand: Dashboard metric calculation');
  console.log('');

  console.log('\n🎯 NEXT STEPS:');
  console.log('   1. Monitor Supabase tables for data flow');
  console.log('   2. Check Vercel function logs for cron execution');
  console.log('   3. Visit dashboard URLs to see metrics populate');
  console.log('   4. Watch for cache hits/misses in dashboard API');
  console.log('   5. Track error rates and processing times');
}

showBackendTracking().catch(console.error);
