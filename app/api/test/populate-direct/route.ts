/**
 * Direct Database Population - Bypasses Supabase client issues
 * Uses direct SQL queries to insert test data
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, studentCount = 200 } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: 'Missing companyId' },
        { status: 400 }
      );
    }

    console.log(`🧪 Direct database population for company: ${companyId}`);

    // Use direct SQL approach instead of Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    // Create client with direct fetch approach
    const createClient = async () => {
      return {
        async from(table: string) {
          return {
            async insert(data: any) {
              const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${supabaseKey}`,
                  'apikey': supabaseKey,
                  'Prefer': 'return=representation'
                },
                body: JSON.stringify(data)
              });
              
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
              }
              
              return { data: await response.json(), error: null };
            },
            
            async select(columns = '*') {
              const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=${columns}`, {
                headers: {
                  'Authorization': `Bearer ${supabaseKey}`,
                  'apikey': supabaseKey
                }
              });
              
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
              }
              
              return { data: await response.json(), error: null };
            },
            
            async single() {
              const response = await fetch(`${supabaseUrl}/rest/v1/${table}?limit=1`, {
                headers: {
                  'Authorization': `Bearer ${supabaseKey}`,
                  'apikey': supabaseKey
                }
              });
              
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
              }
              
              const data = await response.json();
              return { data: data[0] || null, error: null };
            }
          };
        }
      };
    };

    const supabase = await createClient();

    // 1. Create or get client
    let clientId: string;
    
    try {
      // Try to find existing client
      const clientsTable = await supabase.from('clients');
      const { data: existingClient } = await clientsTable.single();

      if (existingClient) {
        clientId = existingClient.id;
        console.log('✅ Found existing client');
      } else {
        throw new Error('No existing client');
      }
    } catch (error) {
      // Create new client
      const clientsTable = await supabase.from('clients');
      const { data: newClient, error: clientError } = await clientsTable.insert({
        company_id: companyId,
        whop_user_id: `test_user_${Date.now()}`,
        current_tier: 'core',
        subscription_status: 'active',
      });

      if (clientError) {
        console.error('Error creating client:', clientError);
        return NextResponse.json(
          { error: 'Failed to create client', details: String(clientError) },
          { status: 500 }
        );
      }

      clientId = newClient[0].id;
      console.log('✅ Created new client');
    }

    // 2. Create students
    const students = [];
    const firstNames = [
      'Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery',
      'Quinn', 'Reese', 'Jamie', 'Dakota', 'Skylar', 'Phoenix', 'River', 'Sage',
      'Charlie', 'Drew', 'Emerson', 'Finley', 'Harper', 'Justice', 'Kendall', 'Logan',
      'Parker', 'Rowan', 'Spencer', 'Tatum', 'Blake', 'Cameron', 'Dylan', 'Elliot',
      'Frances', 'Gray', 'Hayden', 'Indiana', 'Jesse', 'Kai', 'Lane', 'Marley'
    ];
    
    const lastNames = [
      'Johnson', 'Smith', 'Lee', 'Brown', 'Davis', 'Wilson', 'Martinez', 'Garcia',
      'Miller', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin',
      'Thompson', 'Moore', 'Young', 'Allen', 'King', 'Wright', 'Lopez', 'Hill',
      'Scott', 'Green', 'Adams', 'Baker', 'Nelson', 'Carter', 'Mitchell', 'Perez',
      'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins'
    ];

    console.log(`Creating ${studentCount} students...`);

    for (let i = 0; i < studentCount; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 39 ? i : ''}@example.com`;
      const userId = `test_user_${companyId}_${i}_${Date.now()}`;

      const entitiesTable = await supabase.from('entities');
      const { data: entity, error: entityError } = await entitiesTable.insert({
        client_id: clientId,
        whop_user_id: userId,
        email: email,
        metadata: { name, test_data: true },
      });

      if (entityError) {
        console.error('Error creating entity:', entityError);
        continue;
      }

      students.push(entity[0]);

      // Progress logging
      if ((i + 1) % 50 === 0) {
        console.log(`Created ${i + 1}/${studentCount} students...`);
      }
    }

    console.log(`✅ Created ${students.length} students`);

    // 3. Create events
    const eventTypes = ['order', 'subscription', 'activity', 'form_submission', 'custom'];
    const eventsCreated = [];

    for (const student of students) {
      const eventCount = 3 + Math.floor(Math.random() * 3);

      for (let i = 0; i < eventCount; i++) {
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const daysAgo = Math.floor(Math.random() * 30);
        const eventDate = new Date();
        eventDate.setDate(eventDate.getDate() - daysAgo);

        const eventsTable = await supabase.from('events');
        const { data: event, error: eventError } = await eventsTable.insert({
          client_id: clientId,
          entity_id: student.id,
          event_type: eventType,
          event_data: {
            test_data: true,
            action: eventType,
            timestamp: eventDate.toISOString(),
          },
          created_at: eventDate.toISOString(),
        });

        if (!eventError && event) {
          eventsCreated.push(event[0]);
        }
      }
    }

    console.log(`✅ Created ${eventsCreated.length} events`);

    // 4. Create subscriptions with revenue
    const plans = [
      { id: 'plan_atom', name: 'atom', amount: 0 },
      { id: 'plan_core', name: 'core', amount: 20 },
      { id: 'plan_pulse', name: 'pulse', amount: 50 },
      { id: 'plan_surge', name: 'surge', amount: 100 },
      { id: 'plan_quantum', name: 'quantum', amount: 200 },
    ];

    const subscriptionsCreated = [];
    let totalRevenue = 0;

    console.log('Creating subscriptions and revenue data...');

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      // 70% of students have paid subscriptions
      const hasPaidSubscription = Math.random() > 0.3;
      const plan = hasPaidSubscription 
        ? plans[1 + Math.floor(Math.random() * 4)] // core, pulse, surge, or quantum
        : plans[0]; // atom (free)

      const status = Math.random() > 0.1 ? 'active' : 'cancelled';
      const daysAgo = Math.floor(Math.random() * 90);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const subscriptionsTable = await supabase.from('subscriptions');
      const { data: subscription, error: subError } = await subscriptionsTable.insert({
        client_id: clientId,
        entity_id: student.id,
        whop_subscription_id: `sub_test_${companyId}_${i}_${Date.now()}`,
        plan_id: plan.id,
        status: status,
        amount: plan.amount,
        currency: 'USD',
        started_at: startDate.toISOString(),
        expires_at: status === 'active' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : startDate.toISOString(),
      });

      if (!subError && subscription) {
        subscriptionsCreated.push(subscription[0]);
        if (status === 'active') {
          totalRevenue += plan.amount;
        }
      }

      if ((i + 1) % 50 === 0) {
        console.log(`Created ${i + 1}/${students.length} subscriptions...`);
      }
    }

    console.log(`✅ Created ${subscriptionsCreated.length} subscriptions with $${totalRevenue.toFixed(2)} monthly revenue`);

    // 5. Create form templates
    console.log('Creating form templates...');

    const formTemplates = [
      {
        name: 'Course Feedback Survey',
        description: 'Gather student feedback on course quality',
        fields: [
          { id: 'rating', type: 'rating', label: 'Overall Rating', required: true },
          { id: 'content_quality', type: 'rating', label: 'Content Quality', required: true },
          { id: 'instructor', type: 'rating', label: 'Instructor Effectiveness', required: true },
          { id: 'recommend', type: 'radio', label: 'Would you recommend this course?', options: ['Yes', 'No', 'Maybe'], required: true },
          { id: 'comments', type: 'textarea', label: 'Additional Comments', required: false },
        ]
      },
      {
        name: 'Student Satisfaction Survey',
        description: 'Measure overall student satisfaction',
        fields: [
          { id: 'satisfaction', type: 'rating', label: 'Overall Satisfaction', required: true },
          { id: 'value', type: 'rating', label: 'Value for Money', required: true },
          { id: 'support', type: 'rating', label: 'Support Quality', required: true },
          { id: 'improvement', type: 'textarea', label: 'What could we improve?', required: false },
        ]
      },
      {
        name: 'Exit Survey',
        description: 'Understand why students are leaving',
        fields: [
          { id: 'reason', type: 'radio', label: 'Primary reason for leaving', options: ['Too expensive', 'Not enough value', 'Found alternative', 'Personal reasons', 'Other'], required: true },
          { id: 'experience', type: 'rating', label: 'Rate your experience', required: true },
          { id: 'feedback', type: 'textarea', label: 'Any final feedback?', required: false },
        ]
      }
    ];

    const createdFormTemplates = [];

    for (const template of formTemplates) {
      const formsTable = await supabase.from('form_templates');
      const { data: form, error: formError } = await formsTable.insert({
        client_id: clientId,
        name: template.name,
        description: template.description,
        fields: template.fields,
        is_active: true,
      });

      if (!formError && form) {
        createdFormTemplates.push(form[0]);
      }
    }

    console.log(`✅ Created ${createdFormTemplates.length} form templates`);

    // 6. Create form submissions (responses)
    console.log('Creating form submissions...');

    const formSubmissionsCreated = [];
    
    // Generate responses for ~40% of students
    const respondentCount = Math.floor(students.length * 0.4);
    
    for (let i = 0; i < respondentCount; i++) {
      const student = students[i];
      const formTemplate = createdFormTemplates[i % createdFormTemplates.length];
      
      // Generate realistic responses based on form type
      let responses: any = {};
      
      if (formTemplate.name.includes('Feedback')) {
        responses = {
          rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
          content_quality: Math.floor(Math.random() * 2) + 4,
          instructor: Math.floor(Math.random() * 2) + 4,
          recommend: Math.random() > 0.2 ? 'Yes' : 'Maybe',
          comments: Math.random() > 0.5 ? 'Great course! Really learned a lot.' : ''
        };
      } else if (formTemplate.name.includes('Satisfaction')) {
        responses = {
          satisfaction: Math.floor(Math.random() * 2) + 4,
          value: Math.floor(Math.random() * 3) + 3,
          support: Math.floor(Math.random() * 2) + 4,
          improvement: Math.random() > 0.6 ? 'More interactive content would be great!' : ''
        };
      } else if (formTemplate.name.includes('Exit')) {
        responses = {
          reason: ['Too expensive', 'Not enough value', 'Found alternative', 'Personal reasons'][Math.floor(Math.random() * 4)],
          experience: Math.floor(Math.random() * 3) + 3,
          feedback: Math.random() > 0.5 ? 'It was good while it lasted.' : ''
        };
      }

      const daysAgo = Math.floor(Math.random() * 60);
      const submittedAt = new Date();
      submittedAt.setDate(submittedAt.getDate() - daysAgo);

      const submissionsTable = await supabase.from('form_submissions');
      const { data: submission, error: submissionError } = await submissionsTable.insert({
        form_template_id: formTemplate.id,
        entity_id: student.id,
        client_id: clientId,
        responses: responses,
        submitted_at: submittedAt.toISOString(),
      });

      if (!submissionError && submission) {
        formSubmissionsCreated.push(submission[0]);
      }

      if ((i + 1) % 50 === 0) {
        console.log(`Created ${i + 1}/${respondentCount} form submissions...`);
      }
    }

    console.log(`✅ Created ${formSubmissionsCreated.length} form submissions`);

    // 7. Create AI insights
    const insights = [
      {
        type: 'engagement',
        title: 'Strong Student Engagement Detected',
        content: `🎓 Excellent news! Your community of ${students.length} students shows strong engagement with 70% actively participating in the last week. This is ${students.length > 100 ? 'significantly' : 'well'} above industry average.`,
        recommendations: [
          'Consider creating advanced content tracks for your most active students',
          'Implement a referral program - engaged students are your best advocates',
          'Create exclusive community spaces for top performers',
        ],
        confidence: 0.88,
      },
      {
        type: 'weekly_summary',
        title: 'Revenue Growth Opportunity',
        content: `💰 You're generating $${totalRevenue.toFixed(2)}/month in revenue. Based on form feedback (${formSubmissionsCreated.length} responses), students rate content quality at 4.5/5. This high satisfaction creates an opportunity for upselling.`,
        recommendations: [
          `${Math.floor(students.length * 0.3)} students on free plans could convert to paid`,
          'Consider offering a mid-tier bundle at $35/month',
          'Launch time-limited upgrade promotions for existing members',
        ],
        confidence: 0.82,
      },
      {
        type: 'recommendation',
        title: 'Form Response Insights',
        content: `📊 ${formSubmissionsCreated.length} students provided feedback. Key insight: 85% would recommend your content. Main improvement areas: more interactive content and faster support response times.`,
        recommendations: [
          'Add interactive quizzes or challenges to boost engagement',
          'Set up automated support workflows for common questions',
          'Create a student success stories section to boost social proof',
        ],
        confidence: 0.79,
      }
    ];

    const createdInsights = [];

    for (const insightData of insights) {
      const insightsTable = await supabase.from('insights');
      const { data: insight, error: insightError } = await insightsTable.insert({
        client_id: clientId,
        insight_type: insightData.type as any,
        title: insightData.title,
        content: insightData.content,
        metadata: { 
          recommendations: insightData.recommendations,
          confidence: insightData.confidence,
          test_data: true
        },
        created_at: new Date().toISOString(),
      });

      if (!insightError && insight) {
        createdInsights.push(insight[0]);
      }
    }

    console.log(`✅ Created ${createdInsights.length} AI insights`);

    // Return summary
    return NextResponse.json({
      success: true,
      message: 'Comprehensive test data created directly in database',
      data: {
        companyId,
        clientId,
        studentsCreated: students.length,
        eventsCreated: eventsCreated.length,
        subscriptionsCreated: subscriptionsCreated.length,
        monthlyRevenue: `$${totalRevenue.toFixed(2)}`,
        formTemplatesCreated: createdFormTemplates.length,
        formSubmissionsCreated: formSubmissionsCreated.length,
        insightsCreated: createdInsights.length,
      },
      summary: {
        totalStudents: students.length,
        activeSubscriptions: subscriptionsCreated.filter((s: any) => s.status === 'active').length,
        monthlyRevenue: totalRevenue,
        formResponses: formSubmissionsCreated.length,
        avgSatisfaction: 4.3,
        engagementRate: 0.72,
      },
      dashboardUrl: `https://data-analytics-gold.vercel.app/analytics?companyId=${companyId}`,
      note: 'Access your dashboard through Whop or enable BYPASS_WHOP_AUTH to view directly',
    });

  } catch (error: any) {
    console.error('❌ Error in direct database population:', error);
    return NextResponse.json(
      { 
        error: 'Failed to populate database', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}
