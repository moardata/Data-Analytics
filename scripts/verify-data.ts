/**
 * Verify Mock Data in Supabase
 * Quick script to check if data was properly inserted
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const COMPANY_ID = 'biz_3GYHNPbGkZCEky';

async function verifyData() {
  console.log('🔍 Verifying data for company:', COMPANY_ID);
  console.log('');

  try {
    // Step 1: Find client
    console.log('1️⃣ Looking for client record...');
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('company_id', COMPANY_ID)
      .single();

    if (clientError) {
      console.error('❌ Client error:', clientError);
      return;
    }

    if (!client) {
      console.log('❌ No client found!');
      return;
    }

    console.log('✅ Client found:');
    console.log('   ID:', client.id);
    console.log('   Name:', client.name);
    console.log('');

    const clientId = client.id;

    // Step 2: Check entities
    console.log('2️⃣ Checking entities (students)...');
    const { data: entities, error: entitiesError } = await supabase
      .from('entities')
      .select('*')
      .eq('client_id', clientId);

    if (entitiesError) {
      console.error('❌ Entities error:', entitiesError);
    } else {
      console.log(`✅ Found ${entities?.length || 0} students`);
      entities?.forEach((e, i) => {
        console.log(`   ${i + 1}. ${e.name} (${e.email})`);
      });
    }
    console.log('');

    // Step 3: Check events
    console.log('3️⃣ Checking events...');
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('client_id', clientId);

    if (eventsError) {
      console.error('❌ Events error:', eventsError);
    } else {
      console.log(`✅ Found ${events?.length || 0} events`);
      const eventTypes = events?.reduce((acc: any, e) => {
        acc[e.event_type] = (acc[e.event_type] || 0) + 1;
        return acc;
      }, {});
      console.log('   Types:', eventTypes);
    }
    console.log('');

    // Step 4: Check subscriptions
    console.log('4️⃣ Checking subscriptions...');
    const { data: subs, error: subsError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('client_id', clientId);

    if (subsError) {
      console.error('❌ Subscriptions error:', subsError);
    } else {
      console.log(`✅ Found ${subs?.length || 0} subscriptions`);
      const statuses = subs?.reduce((acc: any, s) => {
        acc[s.status] = (acc[s.status] || 0) + 1;
        return acc;
      }, {});
      console.log('   Statuses:', statuses);
    }
    console.log('');

    // Summary
    console.log('📊 SUMMARY:');
    console.log(`   Client ID: ${clientId}`);
    console.log(`   Students: ${entities?.length || 0}`);
    console.log(`   Events: ${events?.length || 0}`);
    console.log(`   Subscriptions: ${subs?.length || 0}`);
    console.log('');
    
    if ((entities?.length || 0) > 0 && (events?.length || 0) > 0) {
      console.log('✅ Data looks good! Should be visible in dashboard.');
    } else {
      console.log('⚠️ Missing data - may need to run populate script again.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verifyData();

