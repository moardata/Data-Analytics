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
      // Try to find existing client for this specific company
      const { data: existingClients } = await supabase.from('clients').select('id').eq('company_id', companyId);
      
      if (existingClients && existingClients.length > 0) {
        clientId = existingClients[0].id;
        console.log('✅ Found existing client for company:', companyId);
      } else {
        throw new Error('No existing client for this company');
      }
    } catch (error) {
      // Create new client for this company
      const { data: newClient, error: clientError } = await supabase.from('clients').insert({
        company_id: companyId,
        whop_user_id: `test_user_${companyId}_${Date.now()}`,
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
      console.log('✅ Created new client for company:', companyId);
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

      // Generate realistic student progress and engagement data
      const progress = Math.floor(Math.random() * 40) + 30; // 30-70% progress
      const courses = ['Beginner Course', 'Intermediate Course', 'Advanced Course', 'Master Course'];
      const course = courses[Math.floor(Math.random() * courses.length)];
      
      const { data: entity, error: entityError } = await supabase.from('entities').insert({
        client_id: clientId,
        whop_user_id: userId,
        email: email,
        metadata: { 
          name, 
          test_data: true,
          progress: progress,
          course: course,
          last_active: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
          engagement_score: Math.floor(Math.random() * 30) + 70, // 70-100
        },
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

    // 3. Create events with realistic revenue data
    const eventsCreated = [];
    
    console.log('Creating events with revenue tracking...');

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      // Create 5-10 events per student for better engagement metrics
      const eventCount = 5 + Math.floor(Math.random() * 6);

      for (let j = 0; j < eventCount; j++) {
        const daysAgo = Math.floor(Math.random() * 60); // Spread over 60 days
        const eventDate = new Date();
        eventDate.setDate(eventDate.getDate() - daysAgo);

        // Weighted event distribution for realistic metrics
        const rand = Math.random();
        let eventType: string;
        let eventData: any = {
          test_data: true,
          timestamp: eventDate.toISOString(),
        };

        if (rand < 0.15) {
          // 15% - Order events with revenue
          eventType = 'order';
          const amounts = [1999, 2999, 4999, 9999, 19999]; // $19.99 to $199.99 in cents
          const amount = amounts[Math.floor(Math.random() * amounts.length)];
          eventData = {
            ...eventData,
            amount: amount,
            currency: 'USD',
            status: 'completed',
            product: ['Course Bundle', 'Premium Course', 'Membership', 'Workshop'][Math.floor(Math.random() * 4)],
          };
        } else if (rand < 0.25) {
          // 10% - Subscription events
          eventType = 'subscription';
          eventData = {
            ...eventData,
            action: ['started', 'renewed', 'upgraded'][Math.floor(Math.random() * 3)],
            plan: ['atom', 'core', 'pulse', 'surge', 'quantum'][Math.floor(Math.random() * 5)],
          };
        } else if (rand < 0.75) {
          // 50% - Activity events (engagement tracking)
          eventType = 'activity';
          const activities = [
            { action: 'course_started', course: 'Module 1', duration: 600 },
            { action: 'lesson_viewed', lesson: 'Introduction', duration: 300 },
            { action: 'course_completed', course: 'Module 5', duration: 3600 },
            { action: 'video_watched', video: 'Tutorial 3', duration: 1200 },
            { action: 'quiz_completed', quiz: 'Chapter 2 Quiz', score: Math.floor(Math.random() * 30) + 70 },
            { action: 'assignment_submitted', assignment: 'Week 3 Project', grade: Math.floor(Math.random() * 20) + 80 },
          ];
          const activity = activities[Math.floor(Math.random() * activities.length)];
          eventData = { ...eventData, ...activity };
        } else if (rand < 0.90) {
          // 15% - Form submission events
          eventType = 'form_submission';
          eventData = {
            ...eventData,
            form_type: ['feedback', 'satisfaction', 'exit'][Math.floor(Math.random() * 3)],
            rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
            completed: true,
          };
        } else {
          // 10% - Custom tracking events
          eventType = 'custom';
          eventData = {
            ...eventData,
            action: ['profile_updated', 'certificate_earned', 'badge_unlocked', 'comment_posted'][Math.floor(Math.random() * 4)],
          };
        }

        const { data: event, error: eventError } = await supabase.from('events').insert({
          client_id: clientId,
          entity_id: student.id,
          event_type: eventType,
          event_data: eventData,
          created_at: eventDate.toISOString(),
        });

        if (!eventError && event) {
          eventsCreated.push(event[0]);
        }
      }

      if ((i + 1) % 50 === 0) {
        console.log(`Created events for ${i + 1}/${students.length} students...`);
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

      const { data: subscription, error: subError } = await supabase.from('subscriptions').insert({
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
      const { data: form, error: formError } = await supabase.from('form_templates').insert({
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

      const { data: submission, error: submissionError } = await supabase.from('form_submissions').insert({
        form_id: formTemplate.id,
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

    // 7. Create AI insights (using valid insight_type values)
    const insights = [
      {
        type: 'trend',
        title: 'Strong Student Engagement Detected',
        content: `🎓 Excellent news! Your community of ${students.length} students shows strong engagement with 70% actively participating in the last week. This is ${students.length > 100 ? 'significantly' : 'well'} above industry average.`,
        recommendations: [
          'Consider creating advanced content tracks for your most active students',
          'Implement a referral program - engaged students are your best advocates',
          'Create exclusive community spaces for top performers',
        ],
        confidence: 0.88,
        severity: 'info',
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
        severity: 'info',
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
        severity: 'info',
      },
      {
        type: 'alert',
        title: 'High Satisfaction Score - Upsell Opportunity',
        content: `⭐ Your students are extremely satisfied (4.5/5 average rating). This is the perfect time to introduce premium offerings or exclusive content tiers.`,
        recommendations: [
          'Launch a premium tier with exclusive content and direct access',
          'Create a VIP community for top-performing students',
          'Offer early access to new courses as an upsell incentive',
        ],
        confidence: 0.85,
        severity: 'success',
      }
    ];

    const createdInsights = [];

    for (const insightData of insights) {
      const { data: insight, error: insightError } = await supabase.from('insights').insert({
        client_id: clientId,
        insight_type: insightData.type,
        title: insightData.title,
        content: insightData.content,
        severity: insightData.severity,
        metadata: { 
          recommendations: insightData.recommendations,
          confidence: insightData.confidence,
          test_data: true
        },
        dismissed: false,
        created_at: new Date().toISOString(),
      });

      if (insightError) {
        console.error('Error creating insight:', insightError);
      } else if (insight) {
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
