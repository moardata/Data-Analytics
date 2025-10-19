/**
 * Populate Rich Mock Data for Testing
 * Creates 20+ students, forms, revenue, and comprehensive analytics data
 */

import { createClient } from '@supabase/supabase-js';

const COMPANY_ID = 'biz_Jkhjc11f6HHRxh';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rdllbtepprsfkbewqcwj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkbGxidGVwcHJzZmtiZXdxY3dqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE2NjQ5NiwiZXhwIjoyMDc1NzQyNDk2fQ.fzE4SymiGkPXBOGx95BNleFSyfysGF3NJAjQ___dxrw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Generate realistic student names
const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William', 
                    'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander',
                    'Abigail', 'Michael', 'Emily', 'Daniel', 'Elizabeth', 'Matthew', 'Sofia', 'Jackson', 'Avery', 'Sebastian'];

const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
                   'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
                   'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen'];

async function populateRichData() {
  console.log('🚀 Starting rich mock data population...');
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
          email: 'admin@testcompany.com',
          name: `Test Company ${COMPANY_ID}`,
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (clientError) throw clientError;
      clientId = newClient.id;
      console.log('   ✅ Created new client:', clientId);
    }

    // Step 2: Create 25 students
    console.log('\n2️⃣ Creating 25 students...');
    const studentIds: string[] = [];
    const studentsToCreate = 25;
    let studentsCreated = 0;

    for (let i = 0; i < studentsToCreate; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@test.com`;
      
      const progress = Math.floor(Math.random() * 100);
      const createdDaysAgo = Math.floor(Math.random() * 60); // Joined within last 60 days
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - createdDaysAgo);

      const { data: newEntity, error: entityError } = await supabase
        .from('entities')
        .insert({
          client_id: clientId,
          whop_user_id: `whop_user_${name.replace(/\s/g, '_').toLowerCase()}_${i}`,
          email: email,
          name: name,
          metadata: { 
            progress: progress,
            course: i % 3 === 0 ? 'Advanced Analytics' : i % 3 === 1 ? 'Data Science 101' : 'Business Intelligence',
            lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          created_at: createdAt.toISOString(),
        })
        .select('id')
        .single();

      if (entityError) {
        if (entityError.code === '23505') {
          console.log(`   ⚠️ Student ${name} already exists.`);
          const { data: existingEntity } = await supabase
            .from('entities')
            .select('id')
            .eq('client_id', clientId)
            .eq('email', email)
            .single();
          if (existingEntity) studentIds.push(existingEntity.id);
        } else {
          console.error(`   ❌ Error creating ${name}:`, entityError);
        }
      } else if (newEntity) {
        studentIds.push(newEntity.id);
        studentsCreated++;
        if (studentsCreated % 5 === 0) {
          console.log(`   ✅ Created ${studentsCreated}/${studentsToCreate} students...`);
        }
      }
    }
    console.log(`   ✅ Total students created: ${studentsCreated}`);

    // Step 3: Create 150 analytics events (various types)
    console.log('\n3️⃣ Creating 150 analytics events...');
    const eventTypes = ['page_view', 'course_start', 'lesson_complete', 'quiz_submit', 'video_watch', 'download', 'comment_post'];
    const eventCount = 150;
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
          event_type: 'activity',
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

    // Step 4: Create subscriptions with revenue
    console.log('\n4️⃣ Creating subscriptions and revenue data...');
    const subscriptionPlans = [
      { plan_id: 'plan_basic', amount: 29.99, name: 'Basic' },
      { plan_id: 'plan_pro', amount: 79.99, name: 'Pro' },
      { plan_id: 'plan_premium', amount: 149.99, name: 'Premium' },
    ];
    
    let subscriptionsCreated = 0;
    let totalRevenue = 0;

    for (let i = 0; i < studentIds.length; i++) {
      // 80% of students have active subscriptions
      if (Math.random() < 0.8) {
        const plan = subscriptionPlans[Math.floor(Math.random() * subscriptionPlans.length)];
        const status = Math.random() < 0.9 ? 'active' : 'cancelled';
        const startedDaysAgo = Math.floor(Math.random() * 90);
        const startedAt = new Date();
        startedAt.setDate(startedAt.getDate() - startedDaysAgo);
        
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            client_id: clientId,
            entity_id: studentIds[i],
            whop_subscription_id: `sub_mock_${COMPANY_ID}_${i}_${Math.random().toString(36).substr(2, 9)}`,
            status: status as any,
            plan_id: plan.plan_id,
            amount: plan.amount,
            currency: 'USD',
            started_at: startedAt.toISOString(),
            expires_at: status === 'active' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
          });

        if (!error) {
          subscriptionsCreated++;
          totalRevenue += plan.amount;
        }
      }
    }
    console.log(`   ✅ Created ${subscriptionsCreated} subscriptions`);
    console.log(`   💰 Total monthly revenue: $${totalRevenue.toFixed(2)}`);

    // Step 5: Create revenue/payment events
    console.log('\n5️⃣ Creating payment events...');
    let paymentsCreated = 0;

    for (let i = 0; i < subscriptionsCreated; i++) {
      const randomDaysAgo = Math.floor(Math.random() * 30);
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - randomDaysAgo);
      
      const plan = subscriptionPlans[Math.floor(Math.random() * subscriptionPlans.length)];
      
      const { error } = await supabase
        .from('events')
        .insert({
          client_id: clientId,
          entity_id: studentIds[Math.floor(Math.random() * studentIds.length)],
          event_type: 'order',
          event_data: {
            type: 'payment_succeeded',
            amount: plan.amount * 100, // In cents
            currency: 'USD',
            plan_id: plan.plan_id,
            timestamp: timestamp.toISOString(),
          },
          created_at: timestamp.toISOString(),
        });

      if (!error) paymentsCreated++;
    }
    console.log(`   ✅ Created ${paymentsCreated} payment events`);

    // Step 6: Create form templates
    console.log('\n6️⃣ Creating form templates...');
    const formTemplates = [
      {
        name: 'Course Feedback Survey',
        description: 'Get feedback on course content',
        fields: [
          { id: 'rating', label: 'Overall Rating', type: 'rating', required: true },
          { id: 'favorite', label: 'Favorite Module', type: 'text', required: true },
          { id: 'improve', label: 'What can we improve?', type: 'textarea', required: false },
          { id: 'recommend', label: 'Would you recommend?', type: 'multiple_choice', required: true, options: ['Yes', 'No', 'Maybe'] },
        ],
      },
      {
        name: 'Onboarding Survey',
        description: 'Welcome new students',
        fields: [
          { id: 'experience', label: 'Experience Level', type: 'multiple_choice', required: true, options: ['Beginner', 'Intermediate', 'Advanced'] },
          { id: 'goals', label: 'Learning Goals', type: 'textarea', required: true },
          { id: 'contact', label: 'Email for Updates', type: 'email', required: false },
        ],
      },
    ];

    const formIds: string[] = [];
    for (const template of formTemplates) {
      const { data: newForm, error: formError } = await supabase
        .from('form_templates')
        .insert({
          client_id: clientId,
          name: template.name,
          description: template.description,
          fields: template.fields,
          is_active: true,
        })
        .select('id')
        .single();

      if (!formError && newForm) {
        formIds.push(newForm.id);
        console.log(`   ✅ Created form: ${template.name}`);
      }
    }

    // Step 7: Create form submissions
    console.log('\n7️⃣ Creating form submissions...');
    let submissionsCreated = 0;

    // Create 30+ form responses
    for (let i = 0; i < 35; i++) {
      const formId = formIds[i % formIds.length];
      const entityId = studentIds[Math.floor(Math.random() * studentIds.length)];
      
      const responses = i % 2 === 0 
        ? {
            rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
            favorite: ['Module 1', 'Module 2', 'Module 3'][Math.floor(Math.random() * 3)],
            improve: 'More examples and practice exercises',
            recommend: ['Yes', 'Yes', 'Maybe'][Math.floor(Math.random() * 3)],
          }
        : {
            experience: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
            goals: 'Learn advanced analytics and data visualization',
            contact: `user${i}@test.com`,
          };

      const submittedDaysAgo = Math.floor(Math.random() * 30);
      const submittedAt = new Date();
      submittedAt.setDate(submittedAt.getDate() - submittedDaysAgo);

      const { error } = await supabase
        .from('form_submissions')
        .insert({
          form_id: formId,
          entity_id: entityId,
          client_id: clientId,
          responses: responses,
          submitted_at: submittedAt.toISOString(),
        });

      if (!error) submissionsCreated++;
    }
    console.log(`   ✅ Created ${submissionsCreated} form submissions`);

    console.log('\n✅ Mock data population complete!');
    console.log('\n📊 SUMMARY:');
    console.log(`   Company ID: ${COMPANY_ID}`);
    console.log(`   Client UUID: ${clientId}`);
    console.log(`   Students: ${studentIds.length}`);
    console.log(`   Events: ${eventsCreated + paymentsCreated}`);
    console.log(`   Subscriptions: ${subscriptionsCreated}`);
    console.log(`   Monthly Revenue: $${totalRevenue.toFixed(2)}`);
    console.log(`   Forms: ${formIds.length}`);
    console.log(`   Form Submissions: ${submissionsCreated}`);

    console.log('\n🧪 Test your dashboard at:');
    console.log(`   https://data-analytics-gold.vercel.app/analytics?companyId=${COMPANY_ID}`);
    console.log('\n🤖 AI Insights should now have rich data to analyze!');

  } catch (error: any) {
    console.error('❌ Error populating mock data:', error);
  }
}

populateRichData();

