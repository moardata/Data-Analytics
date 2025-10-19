/**
 * Populate Mock Analytics Data
 * Tests multi-tenancy by creating data for a specific company
 * Run with: npx tsx scripts/populate-mock-data.ts
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.log('Make sure .env.local has:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL');
  console.log('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Company to populate data for
const COMPANY_ID = 'biz_3GYHNPbGkZCEky';

async function populateMockData() {
  console.log('🚀 Starting mock data population...');
  console.log(`📊 Target Company: ${COMPANY_ID}`);
  console.log('');

  try {
    // Step 1: Create or get client record
    console.log('1️⃣ Creating client record...');
    
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', COMPANY_ID)
      .single();

    let clientId: string;

    if (existingClient) {
      clientId = existingClient.id;
      console.log('   ✅ Client already exists:', clientId);
    } else {
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          whop_user_id: `user_${COMPANY_ID}`,
          company_id: COMPANY_ID,
          email: 'test@example.com',
          name: 'Test Company',
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (clientError) throw clientError;
      clientId = newClient.id;
      console.log('   ✅ Created new client:', clientId);
    }

    // Step 2: Create mock students/entities
    console.log('\n2️⃣ Creating mock students...');
    
    const students = [
      { name: 'Alice Johnson', email: 'alice@test.com' },
      { name: 'Bob Smith', email: 'bob@test.com' },
      { name: 'Charlie Davis', email: 'charlie@test.com' },
      { name: 'Diana Wilson', email: 'diana@test.com' },
      { name: 'Eve Martinez', email: 'eve@test.com' },
    ];

    const studentIds: string[] = [];

    for (const student of students) {
      const { data, error } = await supabase
        .from('entities')
        .insert({
          client_id: clientId,
          whop_user_id: `user_mock_${Math.random().toString(36).substr(2, 9)}`,
          name: student.name,
          email: student.email,
          metadata: {
            enrolled_courses: ['Course 101', 'Course 102'],
            progress: Math.floor(Math.random() * 100),
          },
        })
        .select('id')
        .single();

      if (error) {
        console.log(`   ⚠️ Skipping ${student.name} (may already exist)`);
      } else {
        studentIds.push(data.id);
        console.log(`   ✅ Created student: ${student.name}`);
      }
    }

    // Step 3: Create mock events (analytics data)
    console.log('\n3️⃣ Creating mock analytics events...');
    
    const eventTypes = ['page_view', 'course_start', 'lesson_complete', 'quiz_submit', 'video_watch'];
    const eventCount = 50;
    let eventsCreated = 0;

    for (let i = 0; i < eventCount; i++) {
      const randomDaysAgo = Math.floor(Math.random() * 30);
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - randomDaysAgo);

      const { error } = await supabase
        .from('events')
        .insert({
          client_id: clientId,
          entity_id: studentIds[Math.floor(Math.random() * studentIds.length)],
          event_type: 'activity', // Must be one of: order, subscription, activity, form_submission, custom
          event_data: {
            action: eventTypes[Math.floor(Math.random() * eventTypes.length)],
            course_id: `course_${Math.floor(Math.random() * 3) + 1}`,
            duration_seconds: Math.floor(Math.random() * 3600),
            timestamp: timestamp.toISOString(),
          },
          created_at: timestamp.toISOString(),
        });

      if (!error) eventsCreated++;
    }

    console.log(`   ✅ Created ${eventsCreated} analytics events`);

    // Step 4: Create mock subscriptions
    console.log('\n4️⃣ Creating mock subscriptions...');
    
    const subscriptionStatuses = ['active', 'active', 'active', 'cancelled'];
    let subscriptionsCreated = 0;

    for (let i = 0; i < studentIds.length; i++) {
      const status = subscriptionStatuses[Math.floor(Math.random() * subscriptionStatuses.length)];
      const amount = 29.99;
      
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          client_id: clientId,
          entity_id: studentIds[i],
          whop_subscription_id: `sub_mock_${Math.random().toString(36).substr(2, 9)}`,
          status: status as any,
          plan_id: 'plan_basic',
          amount: amount,
          currency: 'USD',
          started_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          expires_at: status === 'active' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        });

      if (!error) subscriptionsCreated++;
    }

    console.log(`   ✅ Created ${subscriptionsCreated} subscriptions`);

    // Step 5: Create mock revenue records
    console.log('\n5️⃣ Creating mock revenue records...');
    
    let revenueCreated = 0;

    for (let i = 0; i < 10; i++) {
      const randomDaysAgo = Math.floor(Math.random() * 30);
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - randomDaysAgo);

      const { error } = await supabase
        .from('revenue')
        .insert({
          client_id: clientId,
          amount: Math.floor(Math.random() * 10000) + 1000, // $10-$100
          currency: 'USD',
          status: 'completed',
          transaction_type: 'subscription',
          created_at: timestamp.toISOString(),
        });

      if (!error) revenueCreated++;
    }

    console.log(`   ✅ Created ${revenueCreated} revenue records`);

    // Summary
    console.log('\n✅ Mock data population complete!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Company ID: ${COMPANY_ID}`);
    console.log(`   Client UUID: ${clientId}`);
    console.log(`   Students: ${studentIds.length}`);
    console.log(`   Events: ${eventsCreated}`);
    console.log(`   Subscriptions: ${subscriptionsCreated}`);
    console.log(`   Revenue Records: ${revenueCreated}`);
    console.log('');
    console.log('🧪 Test your dashboard at:');
    console.log(`   https://data-analytics-gold.vercel.app/dashboard/${COMPANY_ID}`);
    console.log('');
    console.log('🔒 Multi-tenancy test:');
    console.log('   1. View this data in your dashboard');
    console.log('   2. Switch to a different company');
    console.log('   3. Verify this data does NOT appear');

  } catch (error) {
    console.error('❌ Error populating mock data:', error);
    process.exit(1);
  }
}

// Run the script
populateMockData();

