/**
 * Clear Hardcoded Data and Run Webhook Simulation
 * This script:
 * 1. Clears all hardcoded mock data
 * 2. Runs realistic webhook simulation
 * 3. Tests the entire pipeline
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

async function clearHardcodedData() {
  console.log('🧹 Clearing hardcoded mock data...\n');
  
  for (const companyId of COMPANY_IDS) {
    console.log(`  🗑️  Clearing data for ${companyId}...`);
    
    // Get client ID
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', companyId)
      .single();
    
    if (!client) {
      console.log(`    ⚠️  No client found for ${companyId}`);
      continue;
    }
    
    // Delete in order (respecting foreign key constraints)
    const tables = [
      'form_submissions',
      'events', 
      'entities',
      'cached_dashboard_metrics'
    ];
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('client_id', client.id);
      
      if (error) {
        console.log(`    ⚠️  Error clearing ${table}: ${error.message}`);
      } else {
        console.log(`    ✓ Cleared ${table}`);
      }
    }
  }
  
  console.log('\n✅ Hardcoded data cleared!\n');
}

async function runWebhookSimulation() {
  console.log('🚀 Starting webhook simulation...\n');
  
  // Import and run the webhook simulator
  const { exec } = require('child_process');
  
  return new Promise((resolve, reject) => {
    exec('node scripts/simulate-webhook-activity.js', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Webhook simulation failed:', error);
        reject(error);
        return;
      }
      
      console.log(stdout);
      if (stderr) console.error(stderr);
      resolve();
    });
  });
}

async function main() {
  try {
    // Step 1: Clear hardcoded data
    await clearHardcodedData();
    
    // Step 2: Run webhook simulation
    await runWebhookSimulation();
    
    console.log('\n🎉 Webhook simulation complete!');
    console.log('\n📊 What happens next:');
    console.log('  1. Cron jobs will start processing the webhook data');
    console.log('  2. Dashboard metrics will be calculated from real data');
    console.log('  3. All 6 metrics will populate organically');
    console.log('\n⏰ Timeline:');
    console.log('  - Popular content: Updates in 15 minutes');
    console.log('  - Engagement & commitment: Updates in 1 hour');
    console.log('  - Pathways & aha moments: Updates in 6 hours');
    console.log('\n🔗 View your dashboard:');
    console.log(`   - https://data-analytics-beta-seven.vercel.app/analytics?companyId=${COMPANY_IDS[0]}`);
    console.log(`   - https://data-analytics-beta-seven.vercel.app/analytics?companyId=${COMPANY_IDS[1]}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
