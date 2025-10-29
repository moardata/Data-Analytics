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

  try {
    // Step 1: Find client
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
      return;
    }


    const clientId = client.id;

    // Step 2: Check entities
    const { data: entities, error: entitiesError } = await supabase
      .from('entities')
      .select('*')
      .eq('client_id', clientId);

    if (entitiesError) {
      console.error('❌ Entities error:', entitiesError);
    } else {
      entities?.forEach((e, i) => {
      });
    }

    // Step 3: Check events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('client_id', clientId);

    if (eventsError) {
      console.error('❌ Events error:', eventsError);
    } else {
      const eventTypes = events?.reduce((acc: any, e) => {
        acc[e.event_type] = (acc[e.event_type] || 0) + 1;
        return acc;
      }, {});
    }

    // Step 4: Check subscriptions
    const { data: subs, error: subsError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('client_id', clientId);

    if (subsError) {
      console.error('❌ Subscriptions error:', subsError);
    } else {
      const statuses = subs?.reduce((acc: any, s) => {
        acc[s.status] = (acc[s.status] || 0) + 1;
        return acc;
      }, {});
    }

    // Summary
    
    if ((entities?.length || 0) > 0 && (events?.length || 0) > 0) {
    } else {
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verifyData();

