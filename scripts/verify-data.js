/**
 * Verify Data Script
 * Check what data exists in the database
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyData() {
  console.log('🔍 Verifying database data...');
  
  try {
    // Check clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name, created_at');
    
    if (clientsError) {
      console.log('❌ Error fetching clients:', clientsError.message);
    } else {
      console.log(`📊 Clients: ${clients?.length || 0}`);
      if (clients && clients.length > 0) {
        clients.forEach(client => {
          console.log(`  - ${client.id}: ${client.name} (${new Date(client.created_at).toLocaleString()})`);
        });
      }
    }
    
    // Check entities
    const { data: entities, error: entitiesError } = await supabase
      .from('entities')
      .select('id, name, client_id, created_at')
      .limit(5);
    
    if (entitiesError) {
      console.log('❌ Error fetching entities:', entitiesError.message);
    } else {
      console.log(`📊 Entities: ${entities?.length || 0} (showing first 5)`);
      if (entities && entities.length > 0) {
        entities.forEach(entity => {
          console.log(`  - ${entity.id}: ${entity.name} (${entity.client_id})`);
        });
      }
    }
    
    // Check events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, event_type, client_id, created_at')
      .limit(5);
    
    if (eventsError) {
      console.log('❌ Error fetching events:', eventsError.message);
    } else {
      console.log(`📊 Events: ${events?.length || 0} (showing first 5)`);
      if (events && events.length > 0) {
        events.forEach(event => {
          console.log(`  - ${event.id}: ${event.event_type} (${event.client_id})`);
        });
      }
    }
    
    // Check insights
    const { data: insights, error: insightsError } = await supabase
      .from('insights')
      .select('id, title, category, client_id, created_at');
    
    if (insightsError) {
      console.log('❌ Error fetching insights:', insightsError.message);
    } else {
      console.log(`📊 Insights: ${insights?.length || 0}`);
      if (insights && insights.length > 0) {
        insights.forEach(insight => {
          console.log(`  - ${insight.id}: ${insight.title} (${insight.category}) - ${insight.client_id}`);
        });
      }
    }
    
    // Check form templates
    const { data: templates, error: templatesError } = await supabase
      .from('form_templates')
      .select('id, name, client_id, created_at');
    
    if (templatesError) {
      console.log('❌ Error fetching form templates:', templatesError.message);
    } else {
      console.log(`📊 Form Templates: ${templates?.length || 0}`);
      if (templates && templates.length > 0) {
        templates.forEach(template => {
          console.log(`  - ${template.id}: ${template.name} (${template.client_id})`);
        });
      }
    }
    
    // Check form submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from('form_submissions')
      .select('id, template_id, client_id, created_at')
      .limit(5);
    
    if (submissionsError) {
      console.log('❌ Error fetching form submissions:', submissionsError.message);
    } else {
      console.log(`📊 Form Submissions: ${submissions?.length || 0} (showing first 5)`);
      if (submissions && submissions.length > 0) {
        submissions.forEach(submission => {
          console.log(`  - ${submission.id}: ${submission.template_id} (${submission.client_id})`);
        });
      }
    }
    
    console.log('\n✅ Data verification completed!');
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting data verification...');
  
  try {
    await verifyData();
    console.log('\n✅ Data verification completed successfully!');
  } catch (error) {
    console.error('\n❌ Data verification failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, verifyData };
