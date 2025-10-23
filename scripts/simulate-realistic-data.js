/**
 * Realistic Data Simulation
 * Simulates the entire webhook → normalization → metrics pipeline
 * This creates data that would result from real webhook processing
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const COMPANY_IDS = ['biz_Jkhjc11f6HHRxh', 'biz_3GYHNPbGkZCEky'];

async function simulateRealisticData() {
  console.log('🚀 Starting Realistic Data Simulation...\n');

  for (const companyId of COMPANY_IDS) {
    console.log(`📊 Generating realistic data for ${companyId}...`);
    
    // 1. Create/Get client
    const clientId = await ensureClient(companyId);
    
    // 2. Generate students with realistic join patterns
    const students = await generateStudents(clientId, companyId);
    
    // 3. Generate realistic engagement patterns
    await generateEngagementPatterns(clientId, students);
    
    // 4. Generate aha moment data
    await generateAhaMoments(clientId, students);
    
    // 5. Generate content pathways
    await generateContentPathways(clientId, students);
    
    // 6. Generate today's popular content
    await generateTodaysContent(clientId, students);
    
    // 7. Generate feedback data
    await generateFeedbackData(clientId, students);
    
    console.log(`✅ Completed realistic data for ${companyId}\n`);
  }

  console.log('🎉 Realistic data generation complete!');
  console.log('\n📈 Dashboard metrics will now be calculated from this data');
  console.log('⏰ Cron jobs will start processing automatically');
}

async function ensureClient(companyId) {
  console.log('  👤 Creating/getting client...');
  
  const { data: existing } = await supabase
    .from('clients')
    .select('id')
    .eq('company_id', companyId)
    .single();
  
  if (existing) {
    console.log('  ✓ Client exists:', existing.id);
    return existing.id;
  }
  
  const { data: newClient, error } = await supabase
    .from('clients')
    .insert({
      whop_user_id: companyId,
      company_id: companyId,
      email: `company@${companyId}.com`,
      name: `Company ${companyId}`,
      subscription_tier: 'premium',
      current_tier: 'premium',
      subscription_status: 'active'
    })
    .select()
    .single();
  
  if (error) throw error;
  console.log('  ✓ Client created:', newClient.id);
  return newClient.id;
}

async function generateStudents(clientId, companyId) {
  console.log('  👥 Generating students with realistic patterns...');
  
  const students = [];
  const studentCount = Math.floor(Math.random() * 21) + 30; // 30-50 students
  
  for (let i = 0; i < studentCount; i++) {
    // Realistic join distribution over last 60 days
    const daysAgo = Math.floor(Math.random() * 60);
    const joinDate = new Date();
    joinDate.setDate(joinDate.getDate() - daysAgo);
    
    students.push({
      client_id: clientId,
      whop_user_id: `user_${companyId}_${i}_${Date.now()}`,
      email: `student${i}@test.com`,
      name: `Student ${i}`,
      metadata: { source: 'realistic_simulation' },
      created_at: joinDate.toISOString()
    });
  }
  
  const { data, error } = await supabase
    .from('entities')
    .insert(students)
    .select();
  
  if (error) throw error;
  console.log(`  ✓ Created ${data.length} students`);
  return data;
}

async function generateEngagementPatterns(clientId, students) {
  console.log('  📅 Generating realistic engagement patterns...');
  
  const events = [];
  const experiences = [
    'course_introduction',
    'module_1_basics',
    'module_2_advanced', 
    'module_3_mastery',
    'quiz_checkpoint_1',
    'quiz_checkpoint_2',
    'resource_library',
    'community_forum',
    'live_session',
    'bonus_content'
  ];
  
  for (const student of students) {
    const studentCreated = new Date(student.created_at);
    const daysSinceJoin = Math.floor((Date.now() - studentCreated.getTime()) / (24 * 60 * 60 * 1000));
    
    if (daysSinceJoin < 1) continue; // Skip brand new students
    
    // Determine engagement pattern
    const engagementType = Math.random();
    let totalEvents, consistencyLevel;
    
    if (engagementType > 0.7) {
      // High consistency (70-100 score)
      totalEvents = Math.floor(Math.random() * 20) + 30; // 30-50 events
      consistencyLevel = 'high';
    } else if (engagementType > 0.4) {
      // Medium consistency (40-69 score)  
      totalEvents = Math.floor(Math.random() * 15) + 15; // 15-30 events
      consistencyLevel = 'medium';
    } else {
      // Low consistency (0-39 score)
      totalEvents = Math.floor(Math.random() * 10) + 5; // 5-15 events
      consistencyLevel = 'low';
    }
    
    // Generate events over time
    for (let i = 0; i < totalEvents; i++) {
      const progress = i / totalEvents;
      const daysFromStart = Math.floor(progress * daysSinceJoin);
      
      let eventDate;
      if (consistencyLevel === 'high') {
        // Consistent weekly pattern (Monday, Wednesday, Friday)
        const weekDay = [1, 3, 5][i % 3];
        eventDate = new Date(studentCreated);
        eventDate.setDate(eventDate.getDate() + daysFromStart);
        eventDate.setDate(eventDate.getDate() - eventDate.getDay() + weekDay);
        eventDate.setHours(10 + Math.floor(Math.random() * 6)); // 10am-4pm
      } else if (consistencyLevel === 'medium') {
        // Semi-consistent pattern
        eventDate = new Date(studentCreated);
        eventDate.setDate(eventDate.getDate() + daysFromStart);
        eventDate.setHours(8 + Math.floor(Math.random() * 10)); // 8am-6pm
      } else {
        // Sporadic pattern
        eventDate = new Date(studentCreated);
        eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * daysSinceJoin));
        eventDate.setHours(Math.floor(Math.random() * 24)); // Any time
      }
      
      // Generate membership.created event first
      if (i === 0) {
        events.push({
          client_id: clientId,
          entity_id: student.id,
          event_type: 'subscription',
          event_data: {
            action: 'created',
            subscription_id: `sub_${student.whop_user_id}`,
            plan_id: `plan_${Math.floor(Math.random() * 3) + 1}`,
            product_id: `product_${clientId}`,
            status: 'active',
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            renewal_period: 'monthly'
          },
          whop_event_id: `whop_${Date.now()}_${student.id}_created`,
          created_at: eventDate.toISOString()
        });
      }
      
      // Generate experience_claimed events
      const experience = experiences[Math.floor(Math.random() * experiences.length)];
      events.push({
        client_id: clientId,
        entity_id: student.id,
        event_type: 'activity',
        event_data: {
          action: 'experience_claimed',
          experience_id: experience,
          subscription_id: `sub_${student.whop_user_id}`
        },
        whop_event_id: `whop_${Date.now()}_${student.id}_${i}`,
        created_at: eventDate.toISOString()
      });
    }
  }
  
  // Batch insert events
  const batchSize = 100;
  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize);
    await supabase.from('events').insert(batch);
  }
  
  console.log(`  ✓ Generated ${events.length} engagement events`);
}

async function generateAhaMoments(clientId, students) {
  console.log('  💡 Generating aha moment data...');
  
  const events = [];
  const breakthroughExperiences = ['module_2_advanced', 'module_3_mastery', 'live_session'];
  
  for (const student of students) {
    const studentCreated = new Date(student.created_at);
    const daysSinceJoin = Math.floor((Date.now() - studentCreated.getTime()) / (24 * 60 * 60 * 1000));
    
    if (daysSinceJoin < 7) continue; // Skip very new students
    
    // 40% of students experience aha moments
    if (Math.random() > 0.4) continue;
    
    // Time to first breakthrough (4-48 hours)
    const hoursToBreakthrough = Math.floor(Math.random() * 44) + 4;
    const breakthroughDate = new Date(studentCreated);
    breakthroughDate.setHours(breakthroughDate.getHours() + hoursToBreakthrough);
    
    const breakthroughExp = breakthroughExperiences[Math.floor(Math.random() * breakthroughExperiences.length)];
    
    // Low engagement before breakthrough
    for (let i = 0; i < 2; i++) {
      const beforeDate = new Date(breakthroughDate);
      beforeDate.setDate(beforeDate.getDate() - (3 + i));
      
      events.push({
        client_id: clientId,
        entity_id: student.id,
        event_type: 'activity',
        event_data: {
          action: 'content_view',
          experience_id: 'course_introduction'
        },
        whop_event_id: `whop_${Date.now()}_${student.id}_before_${i}`,
        created_at: beforeDate.toISOString()
      });
    }
    
    // Breakthrough event
    events.push({
      client_id: clientId,
      entity_id: student.id,
      event_type: 'engagement',
      event_data: {
        action: 'course_access',
        experience_id: breakthroughExp,
        engagement_type: 'breakthrough'
      },
      whop_event_id: `whop_${Date.now()}_${student.id}_breakthrough`,
      created_at: breakthroughDate.toISOString()
    });
    
    // High engagement after breakthrough (spike)
    const spikeEvents = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < spikeEvents; i++) {
      const afterDate = new Date(breakthroughDate);
      afterDate.setDate(afterDate.getDate() + i + 1);
      
      events.push({
        client_id: clientId,
        entity_id: student.id,
        event_type: 'activity',
        event_data: {
          action: 'content_view',
          experience_id: breakthroughExp
        },
        whop_event_id: `whop_${Date.now()}_${student.id}_after_${i}`,
        created_at: afterDate.toISOString()
      });
    }
  }
  
  // Batch insert
  const batchSize = 100;
  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize);
    await supabase.from('events').insert(batch);
  }
  
  console.log(`  ✓ Generated ${events.length} aha moment events`);
}

async function generateContentPathways(clientId, students) {
  console.log('  🛤️  Generating content pathways...');
  
  const events = [];
  
  // Define successful pathways
  const successfulPathways = [
    ['course_introduction', 'module_1_basics', 'module_2_advanced', 'module_3_mastery'],
    ['course_introduction', 'resource_library', 'module_1_basics', 'quiz_checkpoint_1'],
    ['module_1_basics', 'community_forum', 'module_2_advanced']
  ];
  
  for (const student of students) {
    const pathwayType = Math.random();
    
    if (pathwayType > 0.3) {
      // 70% follow successful pathways
      const pathway = successfulPathways[Math.floor(Math.random() * successfulPathways.length)];
      
      let currentDate = new Date(student.created_at);
      currentDate.setHours(currentDate.getHours() + 2); // Start 2 hours after join
      
      for (const exp of pathway) {
        events.push({
          client_id: clientId,
          entity_id: student.id,
          event_type: 'activity',
          event_data: {
            action: 'content_view',
            experience_id: exp
          },
          whop_event_id: `whop_${Date.now()}_${student.id}_pathway_${exp}`,
          created_at: currentDate.toISOString()
        });
        
        // 1-3 days between steps
        currentDate.setDate(currentDate.getDate() + Math.floor(Math.random() * 3) + 1);
      }
    } else {
      // 30% hit dead ends
      const deadEnd = 'quiz_checkpoint_2';
      const currentDate = new Date(student.created_at);
      
      events.push({
        client_id: clientId,
        entity_id: student.id,
        event_type: 'activity',
        event_data: {
          action: 'content_view',
          experience_id: deadEnd
        },
        whop_event_id: `whop_${Date.now()}_${student.id}_deadend`,
        created_at: currentDate.toISOString()
      });
      // No follow-up events (dropped off)
    }
  }
  
  // Batch insert
  const batchSize = 100;
  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize);
    await supabase.from('events').insert(batch);
  }
  
  console.log(`  ✓ Generated ${events.length} pathway events`);
}

async function generateTodaysContent(clientId, students) {
  console.log('  📈 Generating today\'s popular content...');
  
  const events = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const experiences = [
    'course_introduction',
    'module_1_basics',
    'module_2_advanced',
    'module_3_mastery',
    'quiz_checkpoint_1',
    'resource_library',
    'community_forum',
    'live_session'
  ];
  
  // 30% of students active today
  const activeToday = students.filter(() => Math.random() > 0.7);
  
  for (const student of activeToday) {
    const viewsToday = Math.floor(Math.random() * 5) + 2; // 2-6 views
    
    for (let i = 0; i < viewsToday; i++) {
      const eventTime = new Date(today);
      eventTime.setHours(Math.floor(Math.random() * 14) + 8); // 8am-10pm
      eventTime.setMinutes(Math.floor(Math.random() * 60));
      
      // Weight popular content higher
      let experience;
      if (Math.random() > 0.4) {
        // 60% view top 3 popular content
        experience = experiences[Math.floor(Math.random() * 3)];
      } else {
        experience = experiences[Math.floor(Math.random() * experiences.length)];
      }
      
      events.push({
        client_id: clientId,
        entity_id: student.id,
        event_type: 'activity',
        event_data: {
          action: 'content_view',
          experience_id: experience
        },
        whop_event_id: `whop_${Date.now()}_${student.id}_today_${i}`,
        created_at: eventTime.toISOString()
      });
    }
  }
  
  await supabase.from('events').insert(events);
  console.log(`  ✓ Generated ${events.length} today's activity events`);
}

async function generateFeedbackData(clientId, students) {
  console.log('  💬 Generating feedback data...');
  
  // Create feedback form
  const { data: form, error: formError } = await supabase
    .from('form_templates')
    .insert({
      client_id: clientId,
      name: 'Course Feedback Survey',
      description: 'Tell us about your learning experience',
      fields: [
        { id: 'rating', type: 'rating', label: 'Overall Rating', required: true },
        { id: 'feedback', type: 'textarea', label: 'What did you like most?', required: true },
        { id: 'improvement', type: 'textarea', label: 'What could be improved?', required: false }
      ],
      is_active: true
    })
    .select()
    .single();
  
  if (formError) throw formError;
  
  // Generate submissions from 40% of students
  const submissions = [];
  const feedbackTexts = [
    "Module 3 is amazing! Really helped me understand the concepts.",
    "The videos are great but could be shorter.",
    "Love the community forum, very helpful!",
    "Quiz checkpoint 2 was too difficult, got stuck.",
    "The live sessions are the best part of this course!",
    "Module 2 was confusing, needed more examples.",
    "Overall great course, learned a lot!",
    "The pace is perfect for beginners.",
    "Would love more practical exercises.",
    "The instructor is very knowledgeable."
  ];
  
  for (const student of students) {
    if (Math.random() > 0.6) continue; // 40% submit feedback
    
    const submittedAt = new Date(student.created_at);
    submittedAt.setDate(submittedAt.getDate() + Math.floor(Math.random() * 30) + 7); // 7-37 days after join
    
    submissions.push({
      form_id: form.id,
      entity_id: student.id,
      client_id: clientId,
      responses: {
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        feedback: feedbackTexts[Math.floor(Math.random() * feedbackTexts.length)],
        improvement: Math.random() > 0.5 ? feedbackTexts[Math.floor(Math.random() * feedbackTexts.length)] : ''
      },
      submitted_at: submittedAt.toISOString()
    });
  }
  
  await supabase.from('form_submissions').insert(submissions);
  console.log(`  ✓ Generated ${submissions.length} form submissions`);
}

// Run the simulation
simulateRealisticData().catch(console.error);
