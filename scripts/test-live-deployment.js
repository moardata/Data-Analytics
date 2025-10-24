/**
 * Test Live Deployment
 * Check if the dashboard API is working in production
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

async function testLiveDeployment() {
  console.log('🔍 Testing Live Deployment Status...\n');

  // 1. Check if data exists in database
  console.log('📊 STEP 1: Checking Database Data\n');
  
  for (const companyId of COMPANY_IDS) {
    console.log(`\n📋 Company: ${companyId}`);
    
    // Get client ID
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, name, company_id')
      .eq('company_id', companyId)
      .single();
    
    if (clientError || !client) {
      console.log(`  ❌ Client not found: ${clientError?.message}`);
      continue;
    }
    
    console.log(`  ✅ Client ID: ${client.id}`);
    console.log(`  ✅ Name: ${client.name}`);
    
    // Check events
    const { count: eventCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', client.id);
    
    // Check entities
    const { count: entityCount } = await supabase
      .from('entities')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', client.id);
    
    // Check cached metrics
    const { data: cachedMetrics, error: cacheError } = await supabase
      .from('cached_dashboard_metrics')
      .select('metric_type, calculated_at, expires_at')
      .eq('client_id', client.id);
    
    console.log(`  📊 Events: ${eventCount || 0}`);
    console.log(`  👥 Students: ${entityCount || 0}`);
    
    if (cacheError) {
      console.log(`  ❌ Cache error: ${cacheError.message}`);
    } else {
      console.log(`  💾 Cached Metrics: ${cachedMetrics?.length || 0}`);
      if (cachedMetrics && cachedMetrics.length > 0) {
        cachedMetrics.forEach(m => {
          const isExpired = new Date(m.expires_at) < new Date();
          console.log(`     ${isExpired ? '❌' : '✅'} ${m.metric_type} - ${isExpired ? 'EXPIRED' : 'Valid'}`);
        });
      }
    }
  }
  
  // 2. Check if API endpoint exists
  console.log('\n\n📡 STEP 2: Testing API Endpoint\n');
  
  // Try to determine the deployment URL
  console.log('⚠️  Note: Cannot test live API from local script without deployment URL');
  console.log('   You need to test this manually in the browser or Postman');
  console.log('\n📝 Manual Test Instructions:');
  console.log('   1. Open browser console (F12) in Whop app');
  console.log('   2. Run this command:');
  console.log('\n   fetch(window.location.origin + "/api/dashboard/metrics?clientId=e379694f-7de5-411d-9040-9f62cf0ac0dc")');
  console.log('     .then(r => r.json())');
  console.log('     .then(console.log)');
  console.log('\n   3. Check if you get metrics data back');
  
  // 3. Diagnostic summary
  console.log('\n\n🎯 DIAGNOSTIC SUMMARY\n');
  console.log('═'.repeat(60));
  
  // Check if data exists
  const { data: allClients } = await supabase.from('clients').select('id');
  const { data: allEvents } = await supabase.from('events').select('id', { count: 'exact', head: true });
  const { data: allMetrics } = await supabase.from('cached_dashboard_metrics').select('id');
  
  console.log('\n✅ DATA STATUS:');
  console.log(`   Clients: ${allClients?.length || 0}`);
  console.log(`   Events: ${allEvents?.length || 0}`);
  console.log(`   Cached Metrics: ${allMetrics?.length || 0}`);
  
  if (!allClients || allClients.length === 0) {
    console.log('\n❌ PROBLEM: No clients in database');
    console.log('   Solution: Run npm run quick-setup');
  } else if (!allEvents || allEvents.length === 0) {
    console.log('\n❌ PROBLEM: No events in database');
    console.log('   Solution: Run npm run simulate');
  } else if (!allMetrics || allMetrics.length === 0) {
    console.log('\n❌ PROBLEM: No cached metrics');
    console.log('   Solution: Run npm run cache-metrics');
  } else {
    console.log('\n✅ DATABASE: All data exists!');
    console.log('\n❓ NEXT STEPS:');
    console.log('   1. Check browser console for errors');
    console.log('   2. Test API endpoint manually (see instructions above)');
    console.log('   3. Check Vercel deployment logs');
    console.log('   4. Verify /api/dashboard/metrics/route.ts is deployed');
  }
  
  console.log('\n' + '═'.repeat(60));
}

testLiveDeployment().catch(console.error);
