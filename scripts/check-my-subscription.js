/**
 * Quick script to check your current subscription status
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSubscription() {
  const companyId = 'biz_3GYHNPbGkZCEky'; // Your dev company

  console.log('🔍 Checking subscription for:', companyId);
  console.log('');

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('company_id', companyId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      console.log('❌ No client record found');
      console.log('   You have NO SUBSCRIPTION');
      console.log('');
      console.log('💡 You need to subscribe to access the app!');
    } else {
      console.error('Error:', error);
    }
    return;
  }

  console.log('✅ Client Found:');
  console.log('   Name:', client.name);
  console.log('   Email:', client.email);
  console.log('');
  console.log('📊 SUBSCRIPTION STATUS:');
  console.log('   Current Tier:', client.current_tier?.toUpperCase() || 'NONE');
  console.log('   Subscription Status:', client.subscription_status?.toUpperCase() || 'NONE');
  console.log('   Whop Plan ID:', client.whop_plan_id || 'None');
  console.log('');

  // Map tier to plan name
  const tierNames = {
    'atom': 'Starter ($30/month)',
    'core': 'Growth ($99.99/month)',
    'pulse': 'Pro ($299/month)',
    'surge': 'Scale ($599/month)',
  };

  if (client.current_tier) {
    console.log('💳 Current Plan:', tierNames[client.current_tier] || client.current_tier);
  } else {
    console.log('💳 Current Plan: FREE / NO SUBSCRIPTION');
  }

  console.log('');
  console.log('🎯 Dev Bypass Status:');
  console.log('   Your company ID has FULL ACCESS in dev mode (bypasses all paywalls)');
  console.log('');

  // Check subscriptions table
  const { data: subs } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false });

  if (subs && subs.length > 0) {
    console.log('📜 Subscription History:');
    subs.forEach((sub, i) => {
      console.log(`   ${i + 1}. Status: ${sub.status} | Created: ${new Date(sub.created_at).toLocaleDateString()}`);
    });
  } else {
    console.log('📜 No subscription history found');
  }
}

checkSubscription().catch(console.error);

