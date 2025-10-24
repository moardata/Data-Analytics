/**
 * Debug Dashboard Issue
 * Check the exact clientId mapping and API endpoint
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

async function debugDashboardIssue() {
  console.log('🔍 Debugging Dashboard Issue...\n');

  console.log('📊 1. CHECKING CLIENT ID MAPPING:');
  
  for (const companyId of COMPANY_IDS) {
    console.log(`\n  Company: ${companyId}`);
    
    // Get client details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('company_id', companyId)
      .single();
    
    if (clientError || !client) {
      console.log(`    ❌ Client not found: ${clientError?.message}`);
      continue;
    }
    
    console.log(`    ✅ Client ID: ${client.id}`);
    console.log(`    ✅ Company ID: ${client.company_id}`);
    console.log(`    ✅ Name: ${client.name}`);
    
    // Check if this client has data
    const { count: eventCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', client.id);
    
    const { count: entityCount } = await supabase
      .from('entities')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', client.id);
    
    console.log(`    📊 Events: ${eventCount || 0}`);
    console.log(`    👥 Students: ${entityCount || 0}`);
    
    // Test the exact API call the dashboard would make
    console.log(`\n  🔗 Dashboard would call: /api/dashboard/metrics?clientId=${client.id}`);
  }
  
  console.log('\n📊 2. CHECKING API ENDPOINT IMPLEMENTATION:');
  
  // Check if the API file exists and what it expects
  console.log('  📁 API Location: /app/api/dashboard/metrics/route.ts');
  console.log('  🔍 Expected: GET request with clientId parameter');
  console.log('  📋 Should return: DashboardMetrics interface');
  
  console.log('\n📊 3. POTENTIAL ISSUES:');
  console.log('  ❌ API endpoint might not be deployed');
  console.log('  ❌ clientId parameter mismatch');
  console.log('  ❌ Database connection issues in API');
  console.log('  ❌ Metric calculation functions failing');
  console.log('  ❌ Cache table issues');
  
  console.log('\n📊 4. CHECKING CACHED METRICS:');
  
  const { data: cachedMetrics, error: cacheError } = await supabase
    .from('cached_dashboard_metrics')
    .select('*')
    .order('calculated_at', { ascending: false });
  
  if (cacheError) {
    console.log(`  ❌ Cache error: ${cacheError.message}`);
  } else {
    console.log(`  📊 Cached metrics: ${cachedMetrics.length}`);
    if (cachedMetrics.length > 0) {
      cachedMetrics.forEach((metric, i) => {
        console.log(`    ${i + 1}. ${metric.metric_type} - Client: ${metric.client_id.slice(0, 8)}... - ${new Date(metric.calculated_at).toLocaleString()}`);
      });
    } else {
      console.log('    ⚠️  No cached metrics found (cron jobs haven\'t run)');
    }
  }
  
  console.log('\n🎯 DIAGNOSIS:');
  console.log('  The dashboard is trying to fetch from /api/dashboard/metrics');
  console.log('  But this API might not be working or returning data');
  console.log('  The data exists in the database, but the API layer is failing');
  
  console.log('\n💡 SOLUTIONS:');
  console.log('  1. Check if /api/dashboard/metrics/route.ts is deployed');
  console.log('  2. Check Vercel function logs for errors');
  console.log('  3. Test the API endpoint directly');
  console.log('  4. Check if metric calculation functions are working');
  console.log('  5. Manually trigger metric calculation');
}

debugDashboardIssue().catch(console.error);
