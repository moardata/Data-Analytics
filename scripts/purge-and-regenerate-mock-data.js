/**
 * Purge and Regenerate Mock Data Script
 * Clears all existing mock data and generates fresh data for specific company IDs
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

// Mock data generators
function generateMockStudents(companyId, count = 20) {
  const students = [];
  const firstNames = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage', 'River', 'Phoenix', 'Blake', 'Drew', 'Cameron', 'Hayden', 'Skyler', 'Rowan', 'Emery', 'Finley', 'Harper'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@example.com`;
    
    students.push({
      id: `student_${companyId}_${i + 1}`,
      client_id: companyId,
      name: `${firstName} ${lastName}`,
      email: email,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  return students;
}

function generateMockEvents(companyId, studentCount = 20) {
  const events = [];
  const eventTypes = ['course_started', 'course_completed', 'lesson_viewed', 'quiz_completed', 'assignment_submitted', 'forum_posted', 'certificate_earned'];
  const courses = ['Web Development Fundamentals', 'Advanced React', 'Python for Data Science', 'UI/UX Design', 'Digital Marketing', 'Project Management'];
  
  for (let i = 0; i < studentCount * 15; i++) {
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const course = courses[Math.floor(Math.random() * courses.length)];
    const studentId = `student_${companyId}_${Math.floor(Math.random() * studentCount) + 1}`;
    
    events.push({
      id: `event_${companyId}_${i + 1}`,
      client_id: companyId,
      entity_id: studentId,
      event_type: eventType,
      event_data: {
        course_name: course,
        lesson_title: `Lesson ${Math.floor(Math.random() * 20) + 1}`,
        score: eventType === 'quiz_completed' ? Math.floor(Math.random() * 40) + 60 : null,
        duration_minutes: Math.floor(Math.random() * 120) + 15
      },
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return events;
}

function generateMockSubscriptions(companyId, studentCount = 20) {
  const subscriptions = [];
  const plans = ['Basic', 'Pro', 'Premium', 'Enterprise'];
  const statuses = ['active', 'cancelled', 'expired', 'paused'];
  
  for (let i = 0; i < studentCount; i++) {
    const studentId = `student_${companyId}_${i + 1}`;
    const plan = plans[Math.floor(Math.random() * plans.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const startDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
    
    subscriptions.push({
      id: `sub_${companyId}_${i + 1}`,
      client_id: companyId,
      entity_id: studentId,
      plan_name: plan,
      status: status,
      start_date: startDate.toISOString(),
      end_date: status === 'active' ? new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
      created_at: startDate.toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  return subscriptions;
}

function generateMockFormTemplates(companyId) {
  const templates = [
    {
      name: 'Course Feedback Survey',
      description: 'Gather feedback on course content and delivery',
      fields: [
        { type: 'rating', label: 'Overall Course Rating', required: true },
        { type: 'text', label: 'What did you like most?', required: false },
        { type: 'text', label: 'What could be improved?', required: false },
        { type: 'rating', label: 'Instructor Rating', required: true }
      ]
    },
    {
      name: 'Learning Progress Check',
      description: 'Assess student learning progress',
      fields: [
        { type: 'text', label: 'What concepts are you struggling with?', required: false },
        { type: 'rating', label: 'Confidence Level (1-10)', required: true },
        { type: 'text', label: 'Additional support needed?', required: false }
      ]
    },
    {
      name: 'Course Completion Survey',
      description: 'Final feedback on course completion',
      fields: [
        { type: 'rating', label: 'Course Difficulty', required: true },
        { type: 'text', label: 'Key Takeaways', required: true },
        { type: 'rating', label: 'Would Recommend', required: true },
        { type: 'text', label: 'Suggestions for Future Students', required: false }
      ]
    }
  ];
  
  return templates.map((template, index) => ({
    id: `template_${companyId}_${index + 1}`,
    client_id: companyId,
    name: template.name,
    description: template.description,
    fields: template.fields,
    is_active: true,
    created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }));
}

function generateMockFormSubmissions(companyId, studentCount = 20, templateCount = 3) {
  const submissions = [];
  
  for (let i = 0; i < studentCount * 2; i++) {
    const studentId = `student_${companyId}_${Math.floor(Math.random() * studentCount) + 1}`;
    const templateId = `template_${companyId}_${Math.floor(Math.random() * templateCount) + 1}`;
    
    const responses = {
      'Overall Course Rating': Math.floor(Math.random() * 3) + 3,
      'Instructor Rating': Math.floor(Math.random() * 3) + 3,
      'Confidence Level (1-10)': Math.floor(Math.random() * 5) + 5,
      'Course Difficulty': Math.floor(Math.random() * 3) + 2,
      'Would Recommend': Math.floor(Math.random() * 3) + 3
    };
    
    submissions.push({
      id: `submission_${companyId}_${i + 1}`,
      client_id: companyId,
      entity_id: studentId,
      template_id: templateId,
      responses: responses,
      submitted_at: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return submissions;
}

function generateMockInsights(companyId) {
  const insights = [
    {
      title: 'High Drop-off Rate in Module 3',
      content: 'Students are showing a 45% drop-off rate in Module 3: Advanced Concepts. This suggests the content may be too challenging or not well-explained.',
      category: 'issue',
      priority: 'high',
      confidence: 0.87,
      status: 'generated',
      tags: ['drop-off', 'module-3', 'difficulty'],
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'Positive Feedback on Interactive Elements',
      content: 'Students consistently rate interactive elements (quizzes, hands-on exercises) highly. Consider adding more interactive content to other modules.',
      category: 'positive',
      priority: 'medium',
      confidence: 0.92,
      status: 'generated',
      tags: ['interactive', 'engagement', 'positive'],
      created_at: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'Recommendation: Add Video Tutorials',
      content: 'Based on student feedback, adding video tutorials for complex concepts would improve comprehension and reduce support requests.',
      category: 'recommendation',
      priority: 'medium',
      confidence: 0.78,
      status: 'generated',
      tags: ['video', 'tutorial', 'comprehension'],
      created_at: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  return insights.map((insight, index) => ({
    id: `insight_${companyId}_${index + 1}`,
    client_id: companyId,
    title: insight.title,
    content: insight.content,
    category: insight.category,
    priority: insight.priority,
    confidence: insight.confidence,
    status: insight.status,
    tags: insight.tags,
    created_at: insight.created_at,
    updated_at: new Date().toISOString()
  }));
}

async function purgeAllData() {
  console.log('🗑️  Purging all existing mock data...');
  
  try {
    // Delete all data in reverse order of dependencies
    await supabase.from('form_submissions').delete().neq('id', '');
    console.log('✅ Deleted form submissions');
    
    await supabase.from('form_templates').delete().neq('id', '');
    console.log('✅ Deleted form templates');
    
    await supabase.from('insights').delete().neq('id', '');
    console.log('✅ Deleted insights');
    
    await supabase.from('events').delete().neq('id', '');
    console.log('✅ Deleted events');
    
    await supabase.from('subscriptions').delete().neq('id', '');
    console.log('✅ Deleted subscriptions');
    
    await supabase.from('entities').delete().neq('id', '');
    console.log('✅ Deleted entities');
    
    await supabase.from('clients').delete().neq('id', '');
    console.log('✅ Deleted clients');
    
    console.log('🎉 All existing data purged successfully!');
  } catch (error) {
    console.error('❌ Error purging data:', error);
    throw error;
  }
}

async function generateFreshData() {
  console.log('🔄 Generating fresh mock data...');
  
  try {
    for (const companyId of COMPANY_IDS) {
      console.log(`\n📊 Generating data for ${companyId}...`);
      
      // Create client
      await supabase.from('clients').insert({
        id: companyId,
        name: `Company ${companyId.slice(-6)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      console.log(`✅ Created client: ${companyId}`);
      
      // Generate students
      const students = generateMockStudents(companyId, 25);
      await supabase.from('entities').insert(students);
      console.log(`✅ Generated ${students.length} students`);
      
      // Generate events
      const events = generateMockEvents(companyId, 25);
      await supabase.from('events').insert(events);
      console.log(`✅ Generated ${events.length} events`);
      
      // Generate subscriptions
      const subscriptions = generateMockSubscriptions(companyId, 25);
      await supabase.from('subscriptions').insert(subscriptions);
      console.log(`✅ Generated ${subscriptions.length} subscriptions`);
      
      // Generate form templates
      const templates = generateMockFormTemplates(companyId);
      await supabase.from('form_templates').insert(templates);
      console.log(`✅ Generated ${templates.length} form templates`);
      
      // Generate form submissions
      const submissions = generateMockFormSubmissions(companyId, 25, templates.length);
      await supabase.from('form_submissions').insert(submissions);
      console.log(`✅ Generated ${submissions.length} form submissions`);
      
      // Generate insights
      const insights = generateMockInsights(companyId);
      await supabase.from('insights').insert(insights);
      console.log(`✅ Generated ${insights.length} insights`);
      
      console.log(`🎉 Completed data generation for ${companyId}`);
    }
    
    console.log('\n🎊 All fresh mock data generated successfully!');
  } catch (error) {
    console.error('❌ Error generating data:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting mock data purge and regeneration...');
  console.log(`📋 Target companies: ${COMPANY_IDS.join(', ')}`);
  
  try {
    await purgeAllData();
    await generateFreshData();
    
    console.log('\n✅ Mock data purge and regeneration completed successfully!');
    console.log('🎯 Fresh data is now available for AI insights testing.');
  } catch (error) {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, purgeAllData, generateFreshData };
