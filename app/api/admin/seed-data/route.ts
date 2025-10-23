/**
 * Admin endpoint to seed database with test data
 * Hit this once to populate database: /api/admin/seed-data
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    // Support both company IDs
    const body = await request.json().catch(() => ({}));
    const companyId = body.companyId || 'biz_3GYHNPbGkZCEky';
    
    console.log('🌱 Starting database seed for company:', companyId);
    
    // Get or create client record
    let { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', companyId)
      .single();
    
    if (!client) {
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({ company_id: companyId })
        .select()
        .single();
      if (clientError) throw clientError;
      client = newClient;
    }
    
    if (!client) {
      throw new Error('Failed to get or create client record');
    }
    
    const clientId = client.id;
    console.log('📋 Using client ID:', clientId);

    // 1. Create events data (payments, engagement)
    const events = [];
    const now = Date.now();
    const daysAgo = 30;
    
    // Valid event types: 'order', 'subscription', 'activity', 'form_submission', 'custom'
    for (let i = 0; i < 200; i++) {
      const randomDate = new Date(now - Math.random() * daysAgo * 86400000);
      const eventTypes = ['order', 'subscription', 'activity', 'form_submission', 'custom'];
      const selectedType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      let eventData: any = {};
      
      if (selectedType === 'order') {
        eventData = {
          amount: Math.floor(Math.random() * 10000) + 1000,
          status: Math.random() > 0.1 ? 'succeeded' : 'failed',
          product_id: `prod_${Math.floor(Math.random() * 5)}`
        };
      } else if (selectedType === 'subscription') {
        eventData = {
          action: Math.random() > 0.7 ? 'cancelled' : Math.random() > 0.5 ? 'renewed' : 'created',
          plan_id: `plan_${['basic', 'pro', 'premium'][Math.floor(Math.random() * 3)]}`
        };
      } else if (selectedType === 'activity') {
        eventData = {
          action: ['login', 'video_watch', 'quiz_complete', 'lesson_view', 'download'][Math.floor(Math.random() * 5)],
          duration: Math.floor(Math.random() * 3600),
          engagement_score: Math.floor(Math.random() * 100)
        };
      } else if (selectedType === 'form_submission') {
        eventData = {
          form_id: `form_${Math.floor(Math.random() * 3)}`,
          response_count: Math.floor(Math.random() * 10) + 1
        };
      } else {
        eventData = {
          custom_action: ['course_completion', 'achievement_unlocked', 'milestone_reached'][Math.floor(Math.random() * 3)]
        };
      }
      
      events.push({
        client_id: clientId,
        event_type: selectedType,
        event_data: eventData,
        created_at: randomDate.toISOString()
      });
    }

    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .insert(events)
      .select();
    
    if (eventsError) throw eventsError;
    console.log(`✅ Created ${eventsData?.length || 0} events`);

    // 2. Create subscriptions
    const subscriptions = [];
    for (let i = 0; i < 50; i++) {
      const randomDate = new Date(now - Math.random() * daysAgo * 86400000);
      const statuses = ['active', 'active', 'active', 'cancelled', 'expired']; // 60% active
      
      subscriptions.push({
        client_id: clientId,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        plan_id: `plan_${['basic', 'pro', 'premium'][Math.floor(Math.random() * 3)]}`,
        created_at: randomDate.toISOString(),
        metadata: {
          source: 'seed_data'
        }
      });
    }

    const { data: subsData, error: subsError } = await supabase
      .from('subscriptions')
      .insert(subscriptions)
      .select();
    
    if (subsError) throw subsError;
    console.log(`✅ Created ${subsData?.length || 0} subscriptions`);

    // 3. Create entities (students)
    const entities = [];
    for (let i = 0; i < 30; i++) {
      const randomDate = new Date(now - Math.random() * daysAgo * 86400000);
      
      entities.push({
        client_id: clientId,
        whop_user_id: `user_seed_${i}`,
        name: `Test User ${i}`,
        email: `testuser${i}@example.com`,
        metadata: {
          source: 'seed_data',
          isActive: Math.random() > 0.3
        },
        created_at: randomDate.toISOString()
      });
    }

    const { data: entitiesData, error: entitiesError } = await supabase
      .from('entities')
      .insert(entities)
      .select();
    
    if (entitiesError) throw entitiesError;
    console.log(`✅ Created ${entitiesData?.length || 0} entities`);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        events: eventsData?.length || 0,
        subscriptions: subsData?.length || 0,
        entities: entitiesData?.length || 0
      }
    });

  } catch (error: any) {
    console.error('❌ Seed failed:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

