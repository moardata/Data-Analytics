/**
 * Admin endpoint to seed database with test data
 * Hit this once to populate database: /api/admin/seed-data
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const clientId = 'biz_3GYHNPbGkZCEky'; // Your company ID
    
    console.log('🌱 Starting database seed...');

    // 1. Create events data (payments, engagement)
    const events = [];
    const now = Date.now();
    const daysAgo = 30;
    
    for (let i = 0; i < 200; i++) {
      const randomDate = new Date(now - Math.random() * daysAgo * 86400000);
      const eventTypes = [
        'payment.succeeded',
        'payment.refunded', 
        'membership.went_valid',
        'membership.went_invalid',
        'user.created',
        'course_completion',
        'engagement'
      ];
      
      events.push({
        client_id: clientId,
        event_type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        event_data: {
          amount: Math.floor(Math.random() * 10000),
          action: ['login', 'video_watch', 'quiz_complete', 'lesson_view'][Math.floor(Math.random() * 4)]
        },
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

