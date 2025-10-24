/**
 * Check Cached Metrics
 * Verify the cached metrics table and data
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

async function checkCachedMetrics() {
  console.log('🔍 Checking Cached Metrics...\n');

  // Check if table exists and get its structure
  console.log('📊 1. CHECKING TABLE STRUCTURE:');
  
  try {
    const { data: tableInfo, error: tableError } = await supabase
      .from('cached_dashboard_metrics')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log(`  ❌ Table error: ${tableError.message}`);
      console.log(`  🔍 Error details: ${JSON.stringify(tableError, null, 2)}`);
    } else {
      console.log('  ✅ Table exists and accessible');
      if (tableInfo && tableInfo.length > 0) {
        console.log('  📋 Sample record structure:');
        console.log(`     Keys: ${Object.keys(tableInfo[0]).join(', ')}`);
      }
    }
  } catch (error) {
    console.log(`  ❌ Table check failed: ${error.message}`);
  }
  
  console.log('\n📊 2. CHECKING CACHED METRICS:');
  
  try {
    const { data: cachedMetrics, error: cacheError } = await supabase
      .from('cached_dashboard_metrics')
      .select('*')
      .order('calculated_at', { ascending: false });
    
    if (cacheError) {
      console.log(`  ❌ Cache error: ${cacheError.message}`);
    } else {
      console.log(`  📊 Total cached metrics: ${cachedMetrics.length}`);
      
      if (cachedMetrics.length > 0) {
        console.log('\n  📋 Cached Metrics:');
        cachedMetrics.forEach((metric, i) => {
          console.log(`    ${i + 1}. ${metric.metric_type}`);
          console.log(`       Client: ${metric.client_id.slice(0, 8)}...`);
          console.log(`       Calculated: ${new Date(metric.calculated_at).toLocaleString()}`);
          console.log(`       Expires: ${new Date(metric.expires_at).toLocaleString()}`);
          console.log(`       Data keys: ${Object.keys(metric.metric_data || {}).join(', ')}`);
          console.log('');
        });
      } else {
        console.log('  ⚠️  No cached metrics found');
      }
    }
  } catch (error) {
    console.log(`  ❌ Cache check failed: ${error.message}`);
  }
  
  console.log('\n📊 3. CHECKING CLIENT MAPPING:');
  
  const COMPANY_IDS = ['biz_Jkhjc11f6HHRxh', 'biz_3GYHNPbGkZCEky'];
  
  for (const companyId of COMPANY_IDS) {
    console.log(`\n  Company: ${companyId}`);
    
    // Get client ID
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, name')
      .eq('company_id', companyId)
      .single();
    
    if (clientError || !client) {
      console.log(`    ❌ Client not found: ${clientError?.message}`);
      continue;
    }
    
    console.log(`    ✅ Client ID: ${client.id}`);
    console.log(`    ✅ Name: ${client.name}`);
    
    // Check cached metrics for this client
    const { data: clientMetrics, error: clientMetricsError } = await supabase
      .from('cached_dashboard_metrics')
      .select('*')
      .eq('client_id', client.id);
    
    if (clientMetricsError) {
      console.log(`    ❌ Client metrics error: ${clientMetricsError.message}`);
    } else {
      console.log(`    📊 Cached metrics: ${clientMetrics.length}`);
      clientMetrics.forEach(metric => {
        console.log(`      - ${metric.metric_type} (${new Date(metric.calculated_at).toLocaleString()})`);
      });
    }
  }
  
  console.log('\n🎯 DIAGNOSIS:');
  console.log('  If table exists and has data → Metrics are cached');
  console.log('  If table exists but no data → Need to run manual calculation');
  console.log('  If table doesn\'t exist → Database migration issue');
  console.log('  If client mapping fails → Client ID mismatch');
}

checkCachedMetrics().catch(console.error);
