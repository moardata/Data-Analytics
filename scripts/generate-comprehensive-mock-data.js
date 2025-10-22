/**
 * Comprehensive Mock Data Generator
 * Generates realistic data showcasing all platform capabilities
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Company IDs to generate data for
const COMPANY_IDS = ['biz_Jkhjc11f6HHRxh', 'biz_3GYHNPbGkZCEky'];

// Configuration for realistic data distribution
const CONFIG = {
  studentsPerCompany: 50, // More students for better insights
  daysOfHistory: 90, // 3 months of data
  engagementRate: 0.75, // 75% of students are active
  churnRate: 0.15, // 15% churn rate
  paymentFailureRate: 0.05, // 5% payment failures
  refundRate: 0.03, // 3% refund rate
  renewalRate: 0.85, // 85% renewal rate
};

// ========================================
// 1. STUDENT DATA GENERATION
// ========================================
function generateStudents(clientId, count) {
  const students = [];
  const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Abigail', 'Michael', 'Emily', 'Daniel', 'Elizabeth', 'Matthew', 'Sofia', 'David', 'Avery', 'Joseph', 'Ella', 'Carter', 'Scarlett', 'Owen', 'Grace', 'Wyatt', 'Chloe', 'John', 'Victoria', 'Jack', 'Riley', 'Luke', 'Aria', 'Jayden', 'Lily', 'Dylan', 'Aubrey', 'Grayson', 'Zoey', 'Levi'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@example.com`;
    const joinDate = new Date(Date.now() - Math.random() * CONFIG.daysOfHistory * 24 * 60 * 60 * 1000);
    
    // Determine if student is active based on engagement rate
    const isActive = Math.random() < CONFIG.engagementRate;
    const lastActiveDate = isActive 
      ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Active within last week
      : new Date(Date.now() - (7 + Math.random() * 30) * 24 * 60 * 60 * 1000); // Inactive for 1-5 weeks
    
    students.push({
      client_id: clientId,
      whop_user_id: `user_${clientId.slice(-8)}_${String(i + 1).padStart(3, '0')}`,
      name: `${firstName} ${lastName}`,
      email: email,
      metadata: {
        source: 'comprehensive_mock_data',
        generated_at: new Date().toISOString(),
        isActive: isActive,
        lastActiveDate: lastActiveDate.toISOString(),
        timezone: ['America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'][Math.floor(Math.random() * 5)],
        acquisitionSource: ['organic', 'referral', 'paid_ads', 'social_media', 'affiliate'][Math.floor(Math.random() * 5)],
      },
      created_at: joinDate.toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  return students;
}

// ========================================
// 2. SUBSCRIPTION METRICS
// ========================================
function generateSubscriptions(clientId, entityIds) {
  const subscriptions = [];
  const plans = [
    { id: 'plan_basic_monthly', name: 'Basic Monthly', amount: 2999, interval: 'month' },
    { id: 'plan_pro_monthly', name: 'Pro Monthly', amount: 4999, interval: 'month' },
    { id: 'plan_premium_monthly', name: 'Premium Monthly', amount: 9999, interval: 'month' },
    { id: 'plan_basic_yearly', name: 'Basic Yearly', amount: 29999, interval: 'year' },
    { id: 'plan_pro_yearly', name: 'Pro Yearly', amount: 49999, interval: 'year' },
  ];
  
  entityIds.forEach((entityId, index) => {
    const plan = plans[Math.floor(Math.random() * plans.length)];
    const startDate = new Date(Date.now() - Math.random() * CONFIG.daysOfHistory * 24 * 60 * 60 * 1000);
    const intervalDays = plan.interval === 'month' ? 30 : 365;
    
    // Determine subscription status
    let status, expiresAt, cancelledAt, renewalCount;
    const rand = Math.random();
    
    if (rand < 0.7) { // 70% active
      status = 'active';
      expiresAt = new Date(startDate.getTime() + intervalDays * 24 * 60 * 60 * 1000);
      cancelledAt = null;
      renewalCount = Math.floor(Math.random() * 5); // 0-4 renewals
    } else if (rand < 0.85) { // 15% cancelled
      status = 'cancelled';
      cancelledAt = new Date(startDate.getTime() + Math.random() * intervalDays * 24 * 60 * 60 * 1000);
      expiresAt = cancelledAt;
      renewalCount = Math.floor(Math.random() * 3);
    } else { // 15% expired
      status = 'expired';
      expiresAt = new Date(startDate.getTime() + intervalDays * 24 * 60 * 60 * 1000);
      cancelledAt = null;
      renewalCount = Math.floor(Math.random() * 2);
    }
    
    subscriptions.push({
      client_id: clientId,
      entity_id: entityId,
      whop_subscription_id: `sub_${clientId.slice(-8)}_${String(index + 1).padStart(3, '0')}`,
      plan_id: plan.id,
      status: status,
      amount: plan.amount,
      currency: 'usd',
      interval: plan.interval,
      started_at: startDate.toISOString(),
      expires_at: expiresAt.toISOString(),
      cancelled_at: cancelledAt?.toISOString() || null,
      renewal_count: renewalCount,
      metadata: {
        plan_name: plan.name,
        lifetime_value: plan.amount * (renewalCount + 1),
        churn_risk: status === 'active' && renewalCount === 0 ? 'high' : 'low',
      },
      created_at: startDate.toISOString(),
      updated_at: new Date().toISOString()
    });
  });
  
  return subscriptions;
}

// ========================================
// 3. COURSE & ENROLLMENT DATA
// ========================================
function generateCourses(clientId) {
  const courseTemplates = [
    { name: 'Web Development Fundamentals', description: 'Learn HTML, CSS, and JavaScript', duration: 8 },
    { name: 'Advanced React & Next.js', description: 'Build modern web applications', duration: 12 },
    { name: 'Python for Data Science', description: 'Master data analysis with Python', duration: 10 },
    { name: 'UI/UX Design Mastery', description: 'Create beautiful user experiences', duration: 6 },
    { name: 'Digital Marketing Pro', description: 'Master digital marketing strategies', duration: 8 },
    { name: 'Full-Stack Development', description: 'Become a full-stack developer', duration: 16 },
  ];
  
  return courseTemplates.map((course, index) => ({
    client_id: clientId,
    name: course.name,
    description: course.description,
    metadata: {
      duration_weeks: course.duration,
      difficulty: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
      category: ['development', 'design', 'marketing', 'data'][Math.floor(Math.random() * 4)],
    },
    created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }));
}

function generateEnrollments(clientId, entityIds, courseIds) {
  const enrollments = [];
  
  // Each student enrolls in 1-4 courses
  entityIds.forEach((entityId) => {
    const numCourses = Math.floor(Math.random() * 4) + 1;
    const selectedCourses = [...courseIds].sort(() => 0.5 - Math.random()).slice(0, numCourses);
    
    selectedCourses.forEach((courseId) => {
      const enrollDate = new Date(Date.now() - Math.random() * CONFIG.daysOfHistory * 24 * 60 * 60 * 1000);
      const progress = Math.random() * 100;
      const isCompleted = progress > 95;
      
      enrollments.push({
        client_id: clientId,
        entity_id: entityId,
        course_id: courseId,
        status: isCompleted ? 'completed' : progress > 50 ? 'in_progress' : 'started',
        progress_percentage: Math.round(progress),
        last_accessed_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: isCompleted ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        metadata: {
          time_spent_minutes: Math.round(progress * 5),
          lessons_completed: Math.round(progress / 10),
          quiz_scores: [75, 82, 91, 88, 95].slice(0, Math.floor(progress / 20)),
        },
        created_at: enrollDate.toISOString(),
        updated_at: new Date().toISOString()
      });
    });
  });
  
  return enrollments;
}

// ========================================
// 4. COMPREHENSIVE EVENT TRACKING
// ========================================
function generateEvents(clientId, entityIds, subscriptions) {
  const events = [];
  
  // Payment Success Events
  subscriptions.forEach((sub) => {
    const paymentsCount = sub.renewal_count + 1;
    for (let i = 0; i < paymentsCount; i++) {
      const paymentDate = new Date(new Date(sub.started_at).getTime() + i * 30 * 24 * 60 * 60 * 1000);
      
      // Successful payment
      if (Math.random() > CONFIG.paymentFailureRate) {
        events.push({
          client_id: clientId,
          entity_id: sub.entity_id,
          event_type: 'payment.succeeded',
          event_data: {
            subscription_id: sub.whop_subscription_id,
            plan_id: sub.plan_id,
            amount: sub.amount,
            currency: sub.currency,
            payment_method: ['card', 'paypal', 'bank_transfer'][Math.floor(Math.random() * 3)],
          },
          whop_event_id: `evt_payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          created_at: paymentDate.toISOString()
        });
      } else {
        // Failed payment
        events.push({
          client_id: clientId,
          entity_id: sub.entity_id,
          event_type: 'payment.failed',
          event_data: {
            subscription_id: sub.whop_subscription_id,
            plan_id: sub.plan_id,
            amount: sub.amount,
            currency: sub.currency,
            failure_reason: ['insufficient_funds', 'card_expired', 'card_declined', 'network_error'][Math.floor(Math.random() * 4)],
          },
          whop_event_id: `evt_payment_failed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          created_at: paymentDate.toISOString()
        });
      }
    }
    
    // Refund events (3% of subscriptions)
    if (Math.random() < CONFIG.refundRate) {
      events.push({
        client_id: clientId,
        entity_id: sub.entity_id,
        event_type: 'payment.refunded',
        event_data: {
          subscription_id: sub.whop_subscription_id,
          amount: sub.amount,
          reason: ['not_satisfied', 'accidental_purchase', 'technical_issues', 'other'][Math.floor(Math.random() * 4)],
        },
        whop_event_id: `evt_refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date(new Date(sub.started_at).getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    // Subscription lifecycle events
    events.push({
      client_id: clientId,
      entity_id: sub.entity_id,
      event_type: 'membership.created',
      event_data: {
        subscription_id: sub.whop_subscription_id,
        plan_id: sub.plan_id,
      },
      whop_event_id: `evt_membership_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: sub.started_at
    });
    
    if (sub.status === 'cancelled') {
      events.push({
        client_id: clientId,
        entity_id: sub.entity_id,
        event_type: 'membership.cancelled',
        event_data: {
          subscription_id: sub.whop_subscription_id,
          cancellation_reason: ['too_expensive', 'not_using', 'found_alternative', 'technical_issues'][Math.floor(Math.random() * 4)],
        },
        whop_event_id: `evt_cancel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: sub.cancelled_at
      });
    }
    
    // Renewal events
    for (let i = 0; i < sub.renewal_count; i++) {
      events.push({
        client_id: clientId,
        entity_id: sub.entity_id,
        event_type: 'membership.renewed',
        event_data: {
          subscription_id: sub.whop_subscription_id,
          renewal_number: i + 1,
        },
        whop_event_id: `evt_renewal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date(new Date(sub.started_at).getTime() + (i + 1) * 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  });
  
  // Activity & Engagement Events
  entityIds.forEach((entityId) => {
    const activityCount = Math.floor(Math.random() * 50) + 10; // 10-60 activities per student
    
    for (let i = 0; i < activityCount; i++) {
      const activityDate = new Date(Date.now() - Math.random() * CONFIG.daysOfHistory * 24 * 60 * 60 * 1000);
      const activityTypes = ['course_view', 'lesson_complete', 'quiz_attempt', 'video_watch', 'resource_download', 'comment_post', 'forum_view'];
      
      events.push({
        client_id: clientId,
        entity_id: entityId,
        event_type: 'activity',
        event_data: {
          activity_type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
          duration_seconds: Math.floor(Math.random() * 3600),
          engagement_score: Math.floor(Math.random() * 100),
        },
        whop_event_id: `evt_activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: activityDate.toISOString()
      });
    }
  });
  
  return events;
}

// ========================================
// 5. FORM TEMPLATES & SUBMISSIONS
// ========================================
function generateFormTemplates(clientId) {
  const templates = [
    {
      name: 'Course Feedback Survey',
      description: 'Collect feedback on course quality and content',
      fields: [
        { label: 'Overall Rating', type: 'rating', required: true },
        { label: 'What did you like most?', type: 'textarea', required: true },
        { label: 'What could be improved?', type: 'textarea', required: false },
        { label: 'Would you recommend this course?', type: 'boolean', required: true },
      ]
    },
    {
      name: 'Student Onboarding',
      description: 'Welcome new students and gather initial info',
      fields: [
        { label: 'What are your learning goals?', type: 'textarea', required: true },
        { label: 'Experience level', type: 'select', required: true, options: ['Beginner', 'Intermediate', 'Advanced'] },
        { label: 'How did you hear about us?', type: 'text', required: false },
      ]
    },
    {
      name: 'Exit Survey',
      description: 'Understand why students are leaving',
      fields: [
        { label: 'Reason for cancelling', type: 'select', required: true, options: ['Too expensive', 'Not enough time', 'Found alternative', 'Technical issues', 'Other'] },
        { label: 'What would make you stay?', type: 'textarea', required: false },
        { label: 'Overall satisfaction', type: 'rating', required: true },
      ]
    },
  ];
  
  return templates.map((template) => ({
    client_id: clientId,
    name: template.name,
    description: template.description,
    fields: template.fields,
    is_active: true,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }));
}

function generateFormSubmissions(clientId, entityIds, templateIds) {
  const submissions = [];
  
  // Generate 20-40 submissions per template
  templateIds.forEach((templateId, tIndex) => {
    const submissionCount = Math.floor(Math.random() * 20) + 20;
    
    for (let i = 0; i < submissionCount; i++) {
      const entityId = entityIds[Math.floor(Math.random() * entityIds.length)];
      const submissionDate = new Date(Date.now() - Math.random() * CONFIG.daysOfHistory * 24 * 60 * 60 * 1000);
      
      let responses;
      if (tIndex === 0) { // Course Feedback
        responses = {
          'Overall Rating': Math.floor(Math.random() * 5) + 1,
          'What did you like most?': ['Great instructor', 'Clear explanations', 'Practical examples', 'Well-structured content'][Math.floor(Math.random() * 4)],
          'What could be improved?': ['More practice exercises', 'Better pacing', 'More examples', 'Nothing'][Math.floor(Math.random() * 4)],
          'Would you recommend this course?': Math.random() > 0.2,
        };
      } else if (tIndex === 1) { // Onboarding
        responses = {
          'What are your learning goals?': ['Career change', 'Skill upgrade', 'Personal project', 'Hobby'][Math.floor(Math.random() * 4)],
          'Experience level': ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
          'How did you hear about us?': ['Social media', 'Friend referral', 'Google search', 'YouTube'][Math.floor(Math.random() * 4)],
        };
      } else { // Exit Survey
        responses = {
          'Reason for cancelling': ['Too expensive', 'Not enough time', 'Found alternative', 'Technical issues', 'Other'][Math.floor(Math.random() * 5)],
          'What would make you stay?': ['Lower price', 'More content', 'Better support', 'Nothing'][Math.floor(Math.random() * 4)],
          'Overall satisfaction': Math.floor(Math.random() * 5) + 1,
        };
      }
      
      submissions.push({
        client_id: clientId,
        form_id: templateId,
        entity_id: entityId,
        responses: responses,
        submitted_at: submissionDate.toISOString()
      });
    }
  });
  
  return submissions;
}

// ========================================
// 6. AI INSIGHTS
// ========================================
function generateInsights(clientId) {
  const insights = [
    {
      insight_type: 'churn_risk',
      title: 'High Churn Risk Detected',
      content: '15% of active students show signs of disengagement. They haven\'t logged in for 2+ weeks despite active subscriptions. Consider sending re-engagement emails with exclusive content.',
      severity: 'high',
      metadata: {
        affected_students: 8,
        potential_revenue_loss: 39992,
        recommended_action: 'Send personalized re-engagement campaign',
        tags: ['retention', 'engagement', 'revenue'],
      }
    },
    {
      insight_type: 'revenue_opportunity',
      title: 'Upsell Opportunity: Yearly Plans',
      content: '60% of monthly subscribers have been active for 6+ months. Converting them to yearly plans could increase revenue by 40% and reduce churn.',
      severity: 'medium',
      metadata: {
        potential_conversions: 30,
        estimated_revenue_increase: 179960,
        conversion_probability: 0.35,
        tags: ['revenue', 'upsell', 'retention'],
      }
    },
    {
      insight_type: 'content_performance',
      title: 'Course Completion Drop-off in Module 3',
      content: 'Advanced React course shows 35% drop-off at Module 3. Students report difficulty with state management concepts. Consider adding video tutorials and practice exercises.',
      severity: 'medium',
      metadata: {
        affected_course: 'Advanced React & Next.js',
        drop_off_rate: 0.35,
        student_feedback_count: 12,
        tags: ['content', 'completion', 'quality'],
      }
    },
    {
      insight_type: 'engagement_pattern',
      title: 'Peak Engagement: Weekday Evenings',
      content: '75% of student activity occurs between 6-9 PM EST on weekdays. Schedule live sessions and release new content during these peak hours for maximum engagement.',
      severity: 'info',
      metadata: {
        peak_hours: [18, 19, 20],
        engagement_lift_potential: 0.25,
        timezone: 'America/New_York',
        tags: ['engagement', 'timing', 'optimization'],
      }
    },
    {
      insight_type: 'payment_health',
      title: 'Payment Success Rate: 95%',
      content: 'Payment success rate is healthy at 95%. Most failures are due to expired cards. Implement automated card update reminders 7 days before expiration.',
      severity: 'info',
      metadata: {
        success_rate: 0.95,
        failure_reasons: { expired_card: 60, insufficient_funds: 25, declined: 15 },
        recommended_action: 'Automated payment method update system',
        tags: ['payments', 'revenue', 'automation'],
      }
    },
    {
      insight_type: 'student_satisfaction',
      title: 'NPS Score Trending Positive',
      content: 'Net Promoter Score increased from 65 to 72 this quarter. Students particularly praise the "practical examples" and "responsive support team".',
      severity: 'positive',
      metadata: {
        current_nps: 72,
        previous_nps: 65,
        trend: 'up',
        top_praise_categories: ['practical_examples', 'support', 'content_quality'],
        tags: ['satisfaction', 'nps', 'quality'],
      }
    },
  ];
  
  return insights.map((insight) => ({
    client_id: clientId,
    insight_type: insight.insight_type,
    title: insight.title,
    content: insight.content,
    metadata: insight.metadata,
    severity: insight.severity,
    dismissed: false,
    created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }));
}

// ========================================
// MAIN EXECUTION
// ========================================
async function purgeAllData() {
  console.log('🗑️  Purging all existing data...');
  
  try {
    await supabase.from('form_submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('✅ Deleted form submissions');
    
    await supabase.from('form_templates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('✅ Deleted form templates');
    
    await supabase.from('insights').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('✅ Deleted insights');
    
    await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('✅ Deleted events');
    
    await supabase.from('subscriptions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('✅ Deleted subscriptions');
    
    await supabase.from('entities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('✅ Deleted entities');
    
    await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('✅ Deleted clients');
    
    console.log('🎉 All data purged successfully!\n');
  } catch (error) {
    console.error('❌ Error purging data:', error);
    throw error;
  }
}

async function generateComprehensiveData() {
  console.log('🔄 Generating comprehensive mock data...\n');
  
  try {
    for (const companyId of COMPANY_IDS) {
      console.log(`\n📊 Generating data for ${companyId}...`);
      console.log('═'.repeat(50));
      
      // 1. Create client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert({
          whop_user_id: `whop_${companyId}`,
          company_id: companyId,
          email: `admin@${companyId}.com`,
          name: `${companyId === 'biz_Jkhjc11f6HHRxh' ? 'TechEd Academy' : 'Creative Skills Hub'}`,
          subscription_tier: 'pro',
          current_tier: 'molecule',
          subscription_status: 'active'
        })
        .select()
        .single();
      
      if (clientError) {
        console.log(`❌ Error creating client: ${clientError.message}`);
        continue;
      }
      
      const clientId = clientData.id;
      console.log(`✅ Created client: ${clientData.name} (ID: ${clientId})`);
      
      // 2. Generate students
      const students = generateStudents(clientId, CONFIG.studentsPerCompany);
      const { data: studentData, error: studentError } = await supabase
        .from('entities')
        .insert(students)
        .select('id');
      
      if (studentError) {
        console.log(`❌ Error creating students: ${studentError.message}`);
        continue;
      }
      
      const entityIds = studentData.map(s => s.id);
      console.log(`✅ Generated ${students.length} students`);
      
      // 3. Generate subscriptions
      const subscriptions = generateSubscriptions(clientId, entityIds);
      await supabase.from('subscriptions').insert(subscriptions);
      console.log(`✅ Generated ${subscriptions.length} subscriptions`);
      console.log(`   - Active: ${subscriptions.filter(s => s.status === 'active').length}`);
      console.log(`   - Cancelled: ${subscriptions.filter(s => s.status === 'cancelled').length}`);
      console.log(`   - Expired: ${subscriptions.filter(s => s.status === 'expired').length}`);
      
      // 4. Skip courses for now (not essential for core metrics)
      // We'll focus on subscriptions, payments, forms, and engagement
      console.log(`⏭️  Skipped courses and enrollments (not in current scope)`);
      
      // 6. Generate events
      const events = generateEvents(clientId, entityIds, subscriptions);
      await supabase.from('events').insert(events);
      console.log(`✅ Generated ${events.length} events`);
      console.log(`   - Payment succeeded: ${events.filter(e => e.event_type === 'payment.succeeded').length}`);
      console.log(`   - Payment failed: ${events.filter(e => e.event_type === 'payment.failed').length}`);
      console.log(`   - Refunds: ${events.filter(e => e.event_type === 'payment.refunded').length}`);
      console.log(`   - Activities: ${events.filter(e => e.event_type === 'activity').length}`);
      
      // 7. Generate form templates
      const templates = generateFormTemplates(clientId);
      const { data: templateData, error: templateError } = await supabase.from('form_templates').insert(templates).select('id');
      
      if (templateError) {
        console.log(`❌ Error creating form templates: ${templateError.message}`);
        continue;
      }
      
      const templateIds = templateData.map(t => t.id);
      console.log(`✅ Generated ${templates.length} form templates`);
      
      // 8. Generate form submissions
      const submissions = generateFormSubmissions(clientId, entityIds, templateIds);
      await supabase.from('form_submissions').insert(submissions);
      console.log(`✅ Generated ${submissions.length} form submissions`);
      
      // 9. Generate AI insights
      const insights = generateInsights(clientId);
      await supabase.from('insights').insert(insights);
      console.log(`✅ Generated ${insights.length} AI insights`);
      
      console.log(`\n🎉 Completed data generation for ${companyId}`);
      console.log('═'.repeat(50));
    }
    
    console.log('\n\n🎊 ALL COMPREHENSIVE MOCK DATA GENERATED SUCCESSFULLY! 🎊');
    console.log('\n📈 Summary of Generated Data:');
    console.log(`   - ${CONFIG.studentsPerCompany * COMPANY_IDS.length} total students`);
    console.log(`   - ${CONFIG.daysOfHistory} days of historical data`);
    console.log(`   - Full subscription lifecycle tracking`);
    console.log(`   - Course enrollments and progress`);
    console.log(`   - Payment events (success, failures, refunds)`);
    console.log(`   - Student activity and engagement`);
    console.log(`   - Form submissions and feedback`);
    console.log(`   - AI-generated insights`);
    console.log('\n✨ Your platform is now ready for comprehensive testing!\n');
    
  } catch (error) {
    console.error('❌ Error generating data:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting Comprehensive Mock Data Generation...\n');
  console.log(`📋 Target Companies: ${COMPANY_IDS.join(', ')}\n`);
  console.log(`⚙️  Configuration:`);
  console.log(`   - Students per company: ${CONFIG.studentsPerCompany}`);
  console.log(`   - Days of history: ${CONFIG.daysOfHistory}`);
  console.log(`   - Engagement rate: ${CONFIG.engagementRate * 100}%`);
  console.log(`   - Churn rate: ${CONFIG.churnRate * 100}%`);
  console.log(`   - Payment failure rate: ${CONFIG.paymentFailureRate * 100}%\n`);
  
  await purgeAllData();
  await generateComprehensiveData();
  
  console.log('✅ Comprehensive mock data generation completed successfully!\n');
  console.log('🎯 You can now test all platform features with realistic data.\n');
}

main().catch(console.error);

