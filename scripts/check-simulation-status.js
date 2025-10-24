/**
 * Check Simulation Status
 * Verifies the data generated and checks if metrics are being calculated
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

const COMPANY_IDS = ['biz_Jkhjc11f6HHRxh', 'biz_3GYHNPbGkZCEky'];

async function checkSimulationStatus() {
  console.log('🔍 Checking Simulation Status...\n');

  for (const companyId of COMPANY_IDS) {
    console.log(`📊 Status for ${companyId}:`);
    
    // Get client
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', companyId)
      .single();
    
    if (!client) {
      console.log('  ❌ No client found');
      continue;
    }
    
    // Check entities (students)
    const { data: entities, error: entitiesError } = await supabase
      .from('entities')
      .select('id, created_at')
      .eq('client_id', client.id);
    
    if (entitiesError) {
      console.log(`  ❌ Error fetching entities: ${entitiesError.message}`);
      continue;
    }
    
    console.log(`  👥 Students: ${entities.length}`);
    
    // Check events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('event_type, created_at')
      .eq('client_id', client.id);
    
    if (eventsError) {
      console.log(`  ❌ Error fetching events: ${eventsError.message}`);
      continue;
    }
    
    console.log(`  📅 Total Events: ${events.length}`);
    
    // Break down by event type
    const eventTypes = events.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {});
    
    console.log('  📊 Event Breakdown:');
    Object.entries(eventTypes).forEach(([type, count]) => {
      console.log(`    - ${type}: ${count}`);
    });
    
    // Check form submissions
    const { data: forms, error: formsError } = await supabase
      .from('form_submissions')
      .select('id')
      .eq('client_id', client.id);
    
    if (formsError) {
      console.log(`  ❌ Error fetching forms: ${formsError.message}`);
    } else {
      console.log(`  📝 Form Submissions: ${forms.length}`);
    }
    
    // Check cached metrics
    const { data: cachedMetrics, error: metricsError } = await supabase
      .from('cached_dashboard_metrics')
      .select('metric_type, created_at, expires_at')
      .eq('client_id', client.id);
    
    if (metricsError) {
      console.log(`  ⚠️  Cached metrics table not found or error: ${metricsError.message}`);
    } else {
      console.log(`  💾 Cached Metrics: ${cachedMetrics.length}`);
      if (cachedMetrics.length > 0) {
        console.log('  📊 Available Metrics:');
        cachedMetrics.forEach(metric => {
          const isExpired = new Date(metric.expires_at) < new Date();
          console.log(`    - ${metric.metric_type}: ${isExpired ? '❌ Expired' : '✅ Fresh'} (${new Date(metric.created_at).toLocaleString()})`);
        });
      }
    }
    
    // Check recent activity (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: recentEvents } = await supabase
      .from('events')
      .select('id')
      .eq('client_id', client.id)
      .gte('created_at', yesterday.toISOString());
    
    console.log(`  🕐 Recent Activity (24h): ${recentEvents.length} events`);
    
    // Check engagement patterns
    const { data: engagementEvents } = await supabase
      .from('events')
      .select('created_at')
      .eq('client_id', client.id)
      .eq('event_type', 'activity')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (engagementEvents.length > 0) {
      console.log('  📈 Recent Engagement:');
      engagementEvents.slice(0, 5).forEach((event, i) => {
        console.log(`    ${i + 1}. ${new Date(event.created_at).toLocaleString()}`);
      });
    }
    
    console.log('');
  }
  
  // Check if cron jobs are configured
  console.log('⏰ Cron Job Status:');
  console.log('  - Light metrics (15min): /api/cron/metrics-light');
  console.log('  - Medium metrics (1hr): /api/cron/metrics-medium');
  console.log('  - Heavy metrics (6hr): /api/cron/metrics-heavy');
  console.log('');
  console.log('📊 Dashboard URLs:');
  COMPANY_IDS.forEach(companyId => {
    console.log(`  - https://data-analytics-beta-seven.vercel.app/analytics?companyId=${companyId}`);
  });
  
  console.log('\n🎯 Next Steps:');
  console.log('  1. Cron jobs will start processing the data automatically');
  console.log('  2. Metrics will be calculated and cached');
  console.log('  3. Dashboard will show real calculated metrics');
  console.log('  4. Check back in 15 minutes for popular content updates');
  console.log('  5. Check back in 1 hour for engagement & commitment scores');
  console.log('  6. Check back in 6 hours for pathways & aha moments');
}

checkSimulationStatus().catch(console.error);
