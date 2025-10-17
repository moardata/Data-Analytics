/**
 * Test Data Population API
 * Generates realistic test data to populate the dashboard
 * ⚠️ FOR TESTING ONLY - Remove before production
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, studentCount = 5 } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: 'Missing companyId' },
        { status: 400 }
      );
    }

    console.log(`🧪 Generating test data for company: ${companyId}`);

    // 1. Get or create client
    let { data: client } = await supabase
      .from('clients')
      .select('id, current_tier')
      .eq('company_id', companyId)
      .single();

    if (!client) {
      // Create client
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          company_id: companyId,
          whop_user_id: `test_user_${Date.now()}`,
          current_tier: 'core',
          subscription_status: 'active',
        })
        .select()
        .single();

      if (clientError) {
        console.error('Error creating client:', clientError);
        return NextResponse.json(
          { error: 'Failed to create client', details: clientError.message },
          { status: 500 }
        );
      }

      client = newClient;
      console.log('✅ Created new client');
    }

    const clientId = client.id;

    // 2. Create students (entities)
    const students = [];
    const names = [
      'Alex Johnson', 'Sam Smith', 'Jordan Lee', 'Taylor Brown', 
      'Casey Davis', 'Morgan Wilson', 'Riley Martinez', 'Avery Garcia'
    ];

    for (let i = 0; i < studentCount; i++) {
      const name = names[i % names.length];
      const email = `${name.toLowerCase().replace(' ', '.')}@example.com`;
      const userId = `test_user_${companyId}_${i}_${Date.now()}`;

      const { data: entity, error: entityError } = await supabase
        .from('entities')
        .insert({
          client_id: clientId,
          whop_user_id: userId,
          email: email,
          metadata: { name, test_data: true },
        })
        .select()
        .single();

      if (entityError) {
        console.error('Error creating entity:', entityError);
        continue;
      }

      students.push(entity);
    }

    console.log(`✅ Created ${students.length} students`);

    // 3. Create events (activities)
    const eventTypes = ['signup', 'course_start', 'lesson_complete', 'form_submit', 'purchase'];
    const eventsCreated = [];

    for (const student of students) {
      // Create 3-5 events per student
      const eventCount = 3 + Math.floor(Math.random() * 3);

      for (let i = 0; i < eventCount; i++) {
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const daysAgo = Math.floor(Math.random() * 30); // Events within last 30 days
        const eventDate = new Date();
        eventDate.setDate(eventDate.getDate() - daysAgo);

        const { data: event, error: eventError } = await supabase
          .from('events')
          .insert({
            client_id: clientId,
            entity_id: student.id,
            event_type: eventType,
            event_data: {
              test_data: true,
              action: eventType,
              timestamp: eventDate.toISOString(),
            },
            created_at: eventDate.toISOString(),
          })
          .select()
          .single();

        if (!eventError && event) {
          eventsCreated.push(event);
        }
      }
    }

    console.log(`✅ Created ${eventsCreated.length} events`);

    // 4. Create subscriptions
    const subscriptionsCreated = [];

    for (const student of students) {
      const planTypes = ['atom', 'core', 'pulse'];
      const plan = planTypes[Math.floor(Math.random() * planTypes.length)];
      const isActive = Math.random() > 0.3; // 70% active

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 60));

      const expiresDate = new Date();
      expiresDate.setDate(expiresDate.getDate() + 30);

      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .insert({
          client_id: clientId,
          entity_id: student.id,
          whop_subscription_id: `test_sub_${student.id}_${Date.now()}`,
          plan_name: plan,
          status: isActive ? 'active' : 'cancelled',
          started_at: startDate.toISOString(),
          expires_at: isActive ? expiresDate.toISOString() : null,
        })
        .select()
        .single();

      if (!subError && subscription) {
        subscriptionsCreated.push(subscription);
      }
    }

    console.log(`✅ Created ${subscriptionsCreated.length} subscriptions`);

    // 5. Create form submissions (for sentiment analysis)
    const sentiments = ['positive', 'neutral', 'negative'];
    const feedbackTexts = [
      'This course is amazing! Really helpful content.',
      'Good information, could use more examples.',
      'Not what I expected, needs improvement.',
      'Love the teaching style and pace!',
      'The material is okay, nothing special.',
      'Struggling to keep up with the content.',
      'Absolutely fantastic experience!',
      'Average course, met my expectations.',
    ];

    const formsCreated = [];

    for (let i = 0; i < Math.min(studentCount, 5); i++) {
      const student = students[i];
      const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
      const feedback = feedbackTexts[Math.floor(Math.random() * feedbackTexts.length)];

      const { data: formSub, error: formError } = await supabase
        .from('form_submissions')
        .insert({
          client_id: clientId,
          entity_id: student.id,
          form_template_id: null, // No template for test data
          response_data: {
            feedback: feedback,
            rating: Math.floor(Math.random() * 5) + 1,
            test_data: true,
          },
          sentiment: sentiment,
        })
        .select()
        .single();

      if (!formError && formSub) {
        formsCreated.push(formSub);
      }
    }

    console.log(`✅ Created ${formsCreated.length} form submissions`);

    // 6. Generate AI insight
    const insightData = {
      summary: '🎓 Your students are highly engaged! 70% have completed at least 3 activities in the past week.',
      recommendations: [
        'Consider creating advanced content for your most active students',
        'Send re-engagement emails to inactive members',
        'Create a community space for students to connect',
      ],
      metrics: {
        engagement_rate: 0.7,
        completion_rate: 0.65,
        satisfaction_score: 4.2,
      },
    };

    const { data: insight, error: insightError } = await supabase
      .from('insights')
      .insert({
        client_id: clientId,
        insight_type: 'engagement',
        content: insightData,
        generated_by: 'test_generator',
        confidence_score: 0.85,
      })
      .select()
      .single();

    if (insight) {
      console.log('✅ Created AI insight');
    }

    // Return summary
    return NextResponse.json({
      success: true,
      message: 'Test data created successfully',
      data: {
        companyId,
        clientId,
        studentsCreated: students.length,
        eventsCreated: eventsCreated.length,
        subscriptionsCreated: subscriptionsCreated.length,
        formsCreated: formsCreated.length,
        insightCreated: !!insight,
      },
      nextSteps: {
        viewDashboard: `/analytics?companyId=${companyId}`,
        viewStudents: `/students?companyId=${companyId}`,
        viewInsights: `/insights?companyId=${companyId}`,
      },
    });

  } catch (error: any) {
    console.error('❌ Error generating test data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate test data', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check if test data exists
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Missing companyId parameter' },
        { status: 400 }
      );
    }

    // Check for client
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', companyId)
      .single();

    if (!client) {
      return NextResponse.json({
        hasData: false,
        message: 'No client found for this company',
      });
    }

    // Count data
    const { count: studentCount } = await supabase
      .from('entities')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', client.id);

    const { count: eventCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', client.id);

    return NextResponse.json({
      hasData: true,
      companyId,
      clientId: client.id,
      counts: {
        students: studentCount || 0,
        events: eventCount || 0,
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

