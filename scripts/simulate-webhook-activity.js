/**
 * Webhook Activity Simulator
 * Simulates realistic Whop webhook events to test the entire pipeline
 * This tests the real data flow: Webhook → Normalization → DB → Metrics
 */

require('dotenv').config({ path: '.env.local' });

const COMPANY_IDS = ['biz_Jkhjc11f6HHRxh', 'biz_3GYHNPbGkZCEky'];
const BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

// Simulate realistic webhook events
async function simulateWebhookActivity() {
  console.log('🚀 Starting Webhook Activity Simulation...\n');

  for (const companyId of COMPANY_IDS) {
    console.log(`📊 Simulating webhooks for ${companyId}...`);
    
    // 1. Create initial membership events (new students joining)
    await simulateMembershipCreated(companyId);
    
    // 2. Simulate experience claims over time
    await simulateExperienceClaims(companyId);
    
    // 3. Simulate form submissions
    await simulateFormSubmissions(companyId);
    
    // 4. Simulate subscription events
    await simulateSubscriptionEvents(companyId);
    
    console.log(`✅ Completed webhook simulation for ${companyId}\n`);
  }

  console.log('🎉 All webhook activity simulated!');
  console.log('\n📈 Dashboard metrics will now be calculated from real webhook data');
  console.log('⏰ Cron jobs will start processing this data automatically');
}

async function simulateMembershipCreated(companyId) {
  console.log('  👥 Simulating membership.created events...');
  
  // Generate 30-50 students joining over the last 60 days
  const studentCount = Math.floor(Math.random() * 21) + 30; // 30-50 students
  
  for (let i = 0; i < studentCount; i++) {
    const daysAgo = Math.floor(Math.random() * 60);
    const joinDate = new Date();
    joinDate.setDate(joinDate.getDate() - daysAgo);
    
    const webhookEvent = {
      id: `whop_${Date.now()}_${i}`,
      action: 'membership.created',
      data: {
        id: `sub_${companyId}_${i}_${Date.now()}`,
        user_id: `user_${companyId}_${i}_${Date.now()}`,
        plan_id: `plan_${Math.floor(Math.random() * 3) + 1}`,
        product_id: `product_${companyId}`,
        status: 'active',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        renewal_period: 'monthly',
        experience_id: null
      },
      created_at: joinDate.toISOString()
    };
    
    await sendWebhook(webhookEvent, companyId);
    
    // Small delay to avoid overwhelming
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`  ✓ Created ${studentCount} membership events`);
}

async function simulateExperienceClaims(companyId) {
  console.log('  🎯 Simulating experience_claimed events...');
  
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
  
  // Get existing students (we'll simulate based on membership events)
  const studentCount = 30; // Approximate from previous step
  
  for (let studentIndex = 0; studentIndex < studentCount; studentIndex++) {
    const userId = `user_${companyId}_${studentIndex}_${Date.now()}`;
    const subscriptionId = `sub_${companyId}_${studentIndex}_${Date.now()}`;
    
    // Determine student engagement pattern
    const engagementLevel = Math.random();
    let totalEvents, timeSpan;
    
    if (engagementLevel > 0.7) {
      // High engagement: 15-25 events over 30-45 days
      totalEvents = Math.floor(Math.random() * 11) + 15;
      timeSpan = Math.floor(Math.random() * 16) + 30;
    } else if (engagementLevel > 0.4) {
      // Medium engagement: 8-15 events over 20-30 days
      totalEvents = Math.floor(Math.random() * 8) + 8;
      timeSpan = Math.floor(Math.random() * 11) + 20;
    } else {
      // Low engagement: 3-8 events over 10-20 days
      totalEvents = Math.floor(Math.random() * 6) + 3;
      timeSpan = Math.floor(Math.random() * 11) + 10;
    }
    
    // Generate events over time
    for (let eventIndex = 0; eventIndex < totalEvents; eventIndex++) {
      const daysFromStart = Math.floor((eventIndex / totalEvents) * timeSpan);
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() - (timeSpan - daysFromStart));
      eventDate.setHours(8 + Math.floor(Math.random() * 12)); // 8am-8pm
      eventDate.setMinutes(Math.floor(Math.random() * 60));
      
      const experience = experiences[Math.floor(Math.random() * experiences.length)];
      
      const webhookEvent = {
        id: `whop_${Date.now()}_${studentIndex}_${eventIndex}`,
        action: 'membership.experienced_claimed',
        data: {
          id: subscriptionId,
          user_id: userId,
          plan_id: `plan_${Math.floor(Math.random() * 3) + 1}`,
          product_id: `product_${companyId}`,
          status: 'active',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          renewal_period: 'monthly',
          experience_id: experience
        },
        created_at: eventDate.toISOString()
      };
      
      await sendWebhook(webhookEvent, companyId);
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  console.log(`  ✓ Generated experience claim events for ${studentCount} students`);
}

async function simulateFormSubmissions(companyId) {
  console.log('  📝 Simulating form submissions...');
  
  // First, create a feedback form via API
  const formData = {
    name: 'Course Feedback Survey',
    description: 'Tell us about your learning experience',
    fields: [
      { id: 'rating', type: 'rating', label: 'Overall Rating', required: true },
      { id: 'feedback', type: 'textarea', label: 'What did you like most?', required: true },
      { id: 'improvement', type: 'textarea', label: 'What could be improved?', required: false }
    ],
    is_active: true
  };
  
  try {
    const formResponse = await fetch(`${BASE_URL}/api/forms/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, companyId })
    });
    
    if (formResponse.ok) {
      const form = await formResponse.json();
      console.log('  ✓ Created feedback form');
      
      // Generate 15-25 form submissions
      const submissionCount = Math.floor(Math.random() * 11) + 15;
      
      for (let i = 0; i < submissionCount; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const submitDate = new Date();
        submitDate.setDate(submitDate.getDate() - daysAgo);
        
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
        
        const submissionData = {
          formId: form.id,
          responses: {
            rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
            feedback: feedbackTexts[Math.floor(Math.random() * feedbackTexts.length)],
            improvement: Math.random() > 0.5 ? feedbackTexts[Math.floor(Math.random() * feedbackTexts.length)] : ''
          },
          submittedAt: submitDate.toISOString()
        };
        
        await fetch(`${BASE_URL}/api/forms/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...submissionData, companyId })
        });
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`  ✓ Generated ${submissionCount} form submissions`);
    }
  } catch (error) {
    console.log('  ⚠️  Could not create form (API might not be available)');
  }
}

async function simulateSubscriptionEvents(companyId) {
  console.log('  💳 Simulating subscription events...');
  
  // Simulate some payment events
  const paymentEvents = [
    { action: 'payment.succeeded', count: 15 },
    { action: 'payment.failed', count: 3 },
    { action: 'membership.renewed', count: 8 },
    { action: 'membership.cancelled', count: 2 }
  ];
  
  for (const eventType of paymentEvents) {
    for (let i = 0; i < eventType.count; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() - daysAgo);
      
      const webhookEvent = {
        id: `whop_${Date.now()}_${eventType.action}_${i}`,
        action: eventType.action,
        data: {
          id: `sub_${companyId}_${i}_${Date.now()}`,
          user_id: `user_${companyId}_${i}_${Date.now()}`,
          plan_id: `plan_${Math.floor(Math.random() * 3) + 1}`,
          product_id: `product_${companyId}`,
          status: eventType.action.includes('succeeded') ? 'active' : 'cancelled',
          amount: Math.floor(Math.random() * 100) + 29, // $29-$128
          currency: 'USD'
        },
        created_at: eventDate.toISOString()
      };
      
      await sendWebhook(webhookEvent, companyId);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  console.log('  ✓ Generated subscription and payment events');
}

async function sendWebhook(webhookEvent, companyId) {
  try {
    const response = await fetch(`${BASE_URL}/api/webhooks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Whop-Company-Id': companyId
      },
      body: JSON.stringify(webhookEvent)
    });
    
    if (!response.ok) {
      console.log(`    ⚠️  Webhook failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`    ⚠️  Webhook error: ${error.message}`);
  }
}

// Run the simulation
simulateWebhookActivity().catch(console.error);
