/**
 * Generate Mock Data for Advanced Dashboard Metrics
 * Creates comprehensive data to showcase all 6 new metrics
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

// Company IDs to generate data for
const COMPANY_IDS = ['biz_Jkhjc11f6HHRxh', 'biz_3GYHNPbGkZCEky'];

// Content experiences to use
const EXPERIENCES = [
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

async function main() {
  console.log('🚀 Starting Dashboard Metrics Data Generation...\n');

  for (const companyId of COMPANY_IDS) {
    console.log(`\n📊 Generating data for ${companyId}...`);
    
    // 1. Create/Get client
    const clientId = await ensureClient(companyId);
    
    // 2. Generate students (50 students)
    const students = await generateStudents(clientId, companyId, 50);
    
    // 3. Generate engagement patterns (for consistency score)
    await generateEngagementPatterns(clientId, students);
    
    // 4. Generate aha moment data (experience spikes)
    await generateAhaMoments(clientId, students);
    
    // 5. Generate content pathways
    await generateContentPathways(clientId, students);
    
    // 6. Generate popular content (today's data)
    await generatePopularContent(clientId, students);
    
    // 7. Generate feedback/form submissions
    await generateFeedbackData(clientId, students);
    
    // 8. Generate commitment score data (early engagement)
    await generateCommitmentData(clientId, students);
    
    console.log(`✅ Completed data generation for ${companyId}`);
  }

  console.log('\n🎉 All data generated successfully!');
  console.log('\n📈 You can now view the dashboard metrics at:');
  console.log(`   - https://your-app.vercel.app/analytics?companyId=${COMPANY_IDS[0]}`);
  console.log(`   - https://your-app.vercel.app/analytics?companyId=${COMPANY_IDS[1]}`);
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

async function generateStudents(clientId, companyId, count) {
  console.log(`  👥 Generating ${count} students...`);
  
  const students = [];
  for (let i = 0; i < count; i++) {
    const whopUserId = `user_${companyId}_${i}_${Date.now()}`;
    
    // Vary creation dates over the last 60 days
    const daysAgo = Math.floor(Math.random() * 60);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);
    
    students.push({
      client_id: clientId,
      whop_user_id: whopUserId,
      email: `student${i}@test.com`,
      name: `Student ${i}`,
      metadata: { source: 'mock_data' },
      created_at: createdAt.toISOString()
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
  console.log('  📅 Generating engagement consistency patterns...');
  
  const events = [];
  const now = new Date();
  
  // Generate 8 weeks of engagement data
  for (const student of students) {
    const studentCreated = new Date(student.created_at);
    const weeksOfData = Math.min(8, Math.floor((now - studentCreated) / (7 * 24 * 60 * 60 * 1000)));
    
    // Determine student engagement level
    const engagementLevel = Math.random();
    let weeksActive, consistencyPattern;
    
    if (engagementLevel > 0.7) {
      // High consistency (70-100 score)
      weeksActive = Math.floor(weeksOfData * 0.9); // 90% of weeks
      consistencyPattern = 'same_day'; // Monday, Wednesday, Friday pattern
    } else if (engagementLevel > 0.4) {
      // Medium consistency (40-69 score)
      weeksActive = Math.floor(weeksOfData * 0.6); // 60% of weeks
      consistencyPattern = 'varied'; // Random days
    } else {
      // Low consistency (0-39 score)
      weeksActive = Math.floor(weeksOfData * 0.3); // 30% of weeks
      consistencyPattern = 'sporadic';
    }
    
    // Generate events for active weeks
    for (let week = 0; week < weeksActive; week++) {
      const weekDate = new Date(studentCreated);
      weekDate.setDate(weekDate.getDate() + (week * 7));
      
      // Generate 2-5 events per active week
      const eventsPerWeek = Math.floor(Math.random() * 4) + 2;
      
      for (let e = 0; e < eventsPerWeek; e++) {
        let dayOffset;
        if (consistencyPattern === 'same_day') {
          dayOffset = [1, 3, 5][e % 3]; // Monday, Wednesday, Friday
        } else {
          dayOffset = Math.floor(Math.random() * 7);
        }
        
        const eventDate = new Date(weekDate);
        eventDate.setDate(eventDate.getDate() + dayOffset);
        eventDate.setHours(10 + Math.floor(Math.random() * 8)); // 10am-6pm
        
        events.push({
          client_id: clientId,
          entity_id: student.id,
          event_type: 'activity',
          event_data: {
            action: 'content_view',
            experience_id: EXPERIENCES[Math.floor(Math.random() * EXPERIENCES.length)]
          },
          created_at: eventDate.toISOString()
        });
      }
    }
  }
  
  // Batch insert
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
  
  // Select "breakthrough" experiences
  const breakthroughExperiences = ['module_2_advanced', 'module_3_mastery', 'live_session'];
  
  for (const student of students) {
    const studentCreated = new Date(student.created_at);
    const daysSinceJoin = Math.floor((Date.now() - studentCreated.getTime()) / (24 * 60 * 60 * 1000));
    
    if (daysSinceJoin < 7) continue; // Skip very new students
    
    // 60% of students experience aha moments
    if (Math.random() > 0.6) continue;
    
    // Time to first breakthrough (4-48 hours)
    const hoursToBreakthrough = Math.floor(Math.random() * 44) + 4;
    const breakthroughDate = new Date(studentCreated);
    breakthroughDate.setHours(breakthroughDate.getHours() + hoursToBreakthrough);
    
    const breakthroughExp = breakthroughExperiences[Math.floor(Math.random() * breakthroughExperiences.length)];
    
    // Low engagement before breakthrough (1-2 events)
    for (let i = 0; i < 2; i++) {
      const beforeDate = new Date(breakthroughDate);
      beforeDate.setDate(beforeDate.getDate() - (3 + i));
      
      events.push({
        client_id: clientId,
        entity_id: student.id,
        event_type: 'activity',
        event_data: {
          action: 'content_view',
          experience_id: EXPERIENCES[0]
        },
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
      created_at: breakthroughDate.toISOString()
    });
    
    // High engagement after breakthrough (40% spike - 3-5 events)
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
          experience_id: EXPERIENCES[Math.floor(Math.random() * EXPERIENCES.length)]
        },
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
  
  // Define dead-end pathways
  const deadEndExperiences = ['quiz_checkpoint_2', 'bonus_content'];
  
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
          created_at: currentDate.toISOString()
        });
        
        // 1-3 days between steps
        currentDate.setDate(currentDate.getDate() + Math.floor(Math.random() * 3) + 1);
      }
    } else {
      // 30% hit dead ends
      const deadEnd = deadEndExperiences[Math.floor(Math.random() * deadEndExperiences.length)];
      const currentDate = new Date(student.created_at);
      
      events.push({
        client_id: clientId,
        entity_id: student.id,
        event_type: 'activity',
        event_data: {
          action: 'content_view',
          experience_id: deadEnd
        },
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

async function generatePopularContent(clientId, students) {
  console.log('  📈 Generating popular content (today)...');
  
  const events = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 30% of students active today
  const activeToday = students.filter(() => Math.random() > 0.7);
  
  for (const student of activeToday) {
    // Each active student views 2-6 pieces of content today
    const viewsToday = Math.floor(Math.random() * 5) + 2;
    
    for (let i = 0; i < viewsToday; i++) {
      const eventTime = new Date(today);
      eventTime.setHours(Math.floor(Math.random() * 14) + 8); // 8am-10pm
      eventTime.setMinutes(Math.floor(Math.random() * 60));
      
      // Weight popular content higher
      let experience;
      if (Math.random() > 0.4) {
        // 60% view top 3 popular content
        experience = EXPERIENCES[Math.floor(Math.random() * 3)];
      } else {
        experience = EXPERIENCES[Math.floor(Math.random() * EXPERIENCES.length)];
      }
      
      events.push({
        client_id: clientId,
        entity_id: student.id,
        event_type: 'activity',
        event_data: {
          action: 'content_view',
          experience_id: experience
        },
        created_at: eventTime.toISOString()
      });
    }
  }
  
  await supabase.from('events').insert(events);
  console.log(`  ✓ Generated ${events.length} today's activity events`);
}

async function generateFeedbackData(clientId, students) {
  console.log('  💬 Generating feedback/form submissions...');
  
  // Create a feedback form
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

async function generateCommitmentData(clientId, students) {
  console.log('  🎯 Generating commitment score data...');
  
  const events = [];
  
  for (const student of students) {
    const studentCreated = new Date(student.created_at);
    const sevenDaysLater = new Date(studentCreated);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    
    // Determine commitment level
    const commitmentLevel = Math.random();
    
    if (commitmentLevel > 0.7) {
      // High commitment (70-100 score)
      // - Fast start (< 6 hours)
      // - Daily engagement (7/7 days)
      // - Multiple experiences (5+)
      
      const firstEventTime = new Date(studentCreated);
      firstEventTime.setHours(firstEventTime.getHours() + Math.floor(Math.random() * 4) + 1); // 1-5 hours
      
      // 7 days of activity
      for (let day = 0; day < 7; day++) {
        const dayDate = new Date(firstEventTime);
        dayDate.setDate(dayDate.getDate() + day);
        
        // 2-4 events per day
        const eventsPerDay = Math.floor(Math.random() * 3) + 2;
        for (let e = 0; e < eventsPerDay; e++) {
          const eventTime = new Date(dayDate);
          eventTime.setHours(10 + Math.floor(Math.random() * 8));
          
          events.push({
            client_id: clientId,
            entity_id: student.id,
            event_type: 'activity',
            event_data: {
              action: 'content_view',
              experience_id: EXPERIENCES[Math.min(e + day, EXPERIENCES.length - 1)]
            },
            created_at: eventTime.toISOString()
          });
        }
      }
    } else if (commitmentLevel > 0.4) {
      // Medium commitment (40-69 score)
      // - Moderate start (6-24 hours)
      // - 5-6 days active
      // - 3-4 experiences
      
      const firstEventTime = new Date(studentCreated);
      firstEventTime.setHours(firstEventTime.getHours() + Math.floor(Math.random() * 18) + 6); // 6-24 hours
      
      const activeDays = Math.floor(Math.random() * 2) + 5; // 5-6 days
      for (let day = 0; day < activeDays; day++) {
        const dayDate = new Date(firstEventTime);
        dayDate.setDate(dayDate.getDate() + day);
        
        events.push({
          client_id: clientId,
          entity_id: student.id,
          event_type: 'activity',
          event_data: {
            action: 'content_view',
            experience_id: EXPERIENCES[Math.min(day, 3)]
          },
          created_at: dayDate.toISOString()
        });
      }
    } else {
      // Low commitment / At-risk (0-39 score)
      // - Slow start (> 24 hours)
      // - 1-2 days active
      // - Limited exploration
      
      const firstEventTime = new Date(studentCreated);
      firstEventTime.setHours(firstEventTime.getHours() + Math.floor(Math.random() * 48) + 24); // 24-72 hours
      
      // Only 1-2 events total
      const totalEvents = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < totalEvents; i++) {
        const eventTime = new Date(firstEventTime);
        eventTime.setDate(eventTime.getDate() + i);
        
        events.push({
          client_id: clientId,
          entity_id: student.id,
          event_type: 'activity',
          event_data: {
            action: 'content_view',
            experience_id: EXPERIENCES[0]
          },
          created_at: eventTime.toISOString()
        });
      }
    }
  }
  
  // Batch insert
  const batchSize = 100;
  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize);
    await supabase.from('events').insert(batch);
  }
  
  console.log(`  ✓ Generated ${events.length} commitment-related events`);
}

main().catch(console.error);

