/**
 * Direct Database Population - Bypasses Supabase client issues
 * Uses direct SQL queries to insert test data
 */

import { NextRequest, NextResponse } from 'next/server';

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
    const names = [
      'Alex Johnson', 'Sam Smith', 'Jordan Lee', 'Taylor Brown', 
      'Casey Davis', 'Morgan Wilson', 'Riley Martinez', 'Avery Garcia'
    ];

    for (let i = 0; i < studentCount; i++) {
      const name = names[i % names.length];
      const email = `${name.toLowerCase().replace(' ', '.')}@example.com`;
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
    }

    console.log(`✅ Created ${students.length} students`);

    // 3. Create events
    const eventTypes = ['signup', 'course_start', 'lesson_complete', 'form_submit', 'purchase'];
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

    // 4. Create AI insight
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

    const insightsTable = await supabase.from('insights');
    const { data: insight, error: insightError } = await insightsTable.insert({
      client_id: clientId,
      insight_type: 'engagement',
      content: insightData,
      generated_by: 'direct_test_generator',
      confidence_score: 0.85,
    });

    if (insight) {
      console.log('✅ Created AI insight');
    }

    // Return summary
    return NextResponse.json({
      success: true,
      message: 'Test data created directly in database',
      data: {
        companyId,
        clientId,
        studentsCreated: students.length,
        eventsCreated: eventsCreated.length,
        insightCreated: !!insight,
      },
      dashboardUrl: `https://data-analytics-gold.vercel.app/analytics?companyId=${companyId}`,
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
