/**
 * Force Purge Data Script
 * More aggressive data deletion with different strategies
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function forcePurgeAllData() {
  console.log('🗑️  Force purging all data with multiple strategies...');
  
  try {
    // Strategy 1: Delete with specific conditions
    console.log('📋 Strategy 1: Deleting with specific conditions...');
    
    // Delete form submissions
    const { error: subsError } = await supabase
      .from('form_submissions')
      .delete()
      .not('id', 'is', null);
    if (subsError) console.log('❌ Form submissions error:', subsError.message);
    else console.log('✅ Deleted form submissions');
    
    // Delete form templates
    const { error: templatesError } = await supabase
      .from('form_templates')
      .delete()
      .not('id', 'is', null);
    if (templatesError) console.log('❌ Form templates error:', templatesError.message);
    else console.log('✅ Deleted form templates');
    
    // Delete insights
    const { error: insightsError } = await supabase
      .from('insights')
      .delete()
      .not('id', 'is', null);
    if (insightsError) console.log('❌ Insights error:', insightsError.message);
    else console.log('✅ Deleted insights');
    
    // Delete events
    const { error: eventsError } = await supabase
      .from('events')
      .delete()
      .not('id', 'is', null);
    if (eventsError) console.log('❌ Events error:', eventsError.message);
    else console.log('✅ Deleted events');
    
    // Delete subscriptions
    const { error: subscriptionsError } = await supabase
      .from('subscriptions')
      .delete()
      .not('id', 'is', null);
    if (subscriptionsError) console.log('❌ Subscriptions error:', subscriptionsError.message);
    else console.log('✅ Deleted subscriptions');
    
    // Delete entities
    const { error: entitiesError } = await supabase
      .from('entities')
      .delete()
      .not('id', 'is', null);
    if (entitiesError) console.log('❌ Entities error:', entitiesError.message);
    else console.log('✅ Deleted entities');
    
    // Delete clients
    const { error: clientsError } = await supabase
      .from('clients')
      .delete()
      .not('id', 'is', null);
    if (clientsError) console.log('❌ Clients error:', clientsError.message);
    else console.log('✅ Deleted clients');
    
    console.log('\n📋 Strategy 2: Checking remaining data...');
    
    // Check what's left
    const { data: remainingClients, error: clientsCheckError } = await supabase
      .from('clients')
      .select('id, name');
    
    if (clientsCheckError) {
      console.log('❌ Error checking clients:', clientsCheckError.message);
    } else {
      console.log(`📊 Remaining clients: ${remainingClients?.length || 0}`);
      if (remainingClients && remainingClients.length > 0) {
        console.log('Remaining client IDs:', remainingClients.map(c => c.id));
      }
    }
    
    const { data: remainingEntities, error: entitiesCheckError } = await supabase
      .from('entities')
      .select('id, name');
    
    if (entitiesCheckError) {
      console.log('❌ Error checking entities:', entitiesCheckError.message);
    } else {
      console.log(`📊 Remaining entities: ${remainingEntities?.length || 0}`);
    }
    
    const { data: remainingEvents, error: eventsCheckError } = await supabase
      .from('events')
      .select('id, event_type');
    
    if (eventsCheckError) {
      console.log('❌ Error checking events:', eventsCheckError.message);
    } else {
      console.log(`📊 Remaining events: ${remainingEvents?.length || 0}`);
    }
    
    console.log('\n🎉 Force purge completed!');
    
  } catch (error) {
    console.error('❌ Error during force purge:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting force purge of all data...');
  
  try {
    await forcePurgeAllData();
    console.log('\n✅ Force purge completed successfully!');
  } catch (error) {
    console.error('\n❌ Force purge failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, forcePurgeAllData };
