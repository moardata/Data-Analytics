/**
 * Verify Simulation Data
 * Deep check to see if simulation data was actually stored
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

async function verifySimulationData() {
  console.log('🔍 Verifying Simulation Data...\n');

  for (const companyId of COMPANY_IDS) {
    console.log(`📊 Checking ${companyId}:`);
    
    // Get client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('company_id', companyId)
      .single();
    
    if (clientError || !client) {
      console.log(`  ❌ Client not found: ${clientError?.message || 'No client'}`);
      continue;
    }
    
    console.log(`  ✅ Client exists: ${client.id}`);
    console.log(`     Name: ${client.name}`);
    console.log(`     Email: ${client.email}`);
    console.log(`     Created: ${new Date(client.created_at).toLocaleString()}`);
    
    // Check entities (students)
    const { data: entities, count: entityCount } = await supabase
      .from('entities')
      .select('*', { count: 'exact' })
      .eq('client_id', client.id);
    
    console.log(`\n  👥 Students: ${entityCount || 0}`);
    if (entities && entities.length > 0) {
      console.log('     Latest 5 students:');
      entities.slice(0, 5).forEach((student, i) => {
        console.log(`     ${i + 1}. ${student.name} (${student.email}) - ${new Date(student.created_at).toLocaleString()}`);
      });
    } else {
      console.log('     ⚠️  No students found!');
    }
    
    // Check events
    const { data: events, count: eventCount } = await supabase
      .from('events')
      .select('event_type, event_data, created_at', { count: 'exact' })
      .eq('client_id', client.id)
      .order('created_at', { ascending: false });
    
    console.log(`\n  📅 Events: ${eventCount || 0}`);
    if (events && events.length > 0) {
      // Group by event type
      const eventTypes = events.reduce((acc, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {});
      
      console.log('     Event breakdown:');
      Object.entries(eventTypes).forEach(([type, count]) => {
        console.log(`     - ${type}: ${count}`);
      });
      
      console.log('\n     Latest 5 events:');
      events.slice(0, 5).forEach((event, i) => {
        const action = event.event_data?.action || 'N/A';
        const experienceId = event.event_data?.experience_id || 'N/A';
        console.log(`     ${i + 1}. ${event.event_type} (${action}) - Experience: ${experienceId} - ${new Date(event.created_at).toLocaleString()}`);
      });
    } else {
      console.log('     ⚠️  No events found!');
    }
    
    // Check form submissions
    const { data: forms, count: formCount } = await supabase
      .from('form_submissions')
      .select('*', { count: 'exact' })
      .eq('client_id', client.id);
    
    console.log(`\n  📝 Form Submissions: ${formCount || 0}`);
    if (forms && forms.length > 0) {
      console.log('     Latest 3 submissions:');
      forms.slice(0, 3).forEach((form, i) => {
        const rating = form.responses?.rating || 'N/A';
        console.log(`     ${i + 1}. Rating: ${rating}/5 - ${new Date(form.submitted_at).toLocaleString()}`);
      });
    } else {
      console.log('     ⚠️  No form submissions found!');
    }
    
    // Check date range of data
    if (events && events.length > 0) {
      const dates = events.map(e => new Date(e.created_at).getTime());
      const oldest = new Date(Math.min(...dates));
      const newest = new Date(Math.max(...dates));
      
      console.log(`\n  📅 Data Date Range:`);
      console.log(`     Oldest event: ${oldest.toLocaleString()}`);
      console.log(`     Newest event: ${newest.toLocaleString()}`);
      console.log(`     Span: ${Math.round((newest - oldest) / (24 * 60 * 60 * 1000))} days`);
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
  }
  
  // Overall summary
  console.log('📊 OVERALL SUMMARY:');
  
  const { count: totalClients } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true });
  
  const { count: totalEntities } = await supabase
    .from('entities')
    .select('*', { count: 'exact', head: true });
  
  const { count: totalEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true });
  
  const { count: totalForms } = await supabase
    .from('form_submissions')
    .select('*', { count: 'exact', head: true });
  
  console.log(`  Total Clients: ${totalClients || 0}`);
  console.log(`  Total Students: ${totalEntities || 0}`);
  console.log(`  Total Events: ${totalEvents || 0}`);
  console.log(`  Total Form Submissions: ${totalForms || 0}`);
  
  if (totalEvents === 0) {
    console.log('\n❌ NO DATA FOUND!');
    console.log('\n🔧 Possible Issues:');
    console.log('  1. Simulation script didn\'t run successfully');
    console.log('  2. Data was inserted into wrong database/project');
    console.log('  3. Data was deleted or cleared');
    console.log('  4. Wrong Supabase credentials in .env.local');
    console.log('\n💡 Solution:');
    console.log('  Run the simulation again:');
    console.log('  node scripts/simulate-realistic-data.js');
  } else {
    console.log('\n✅ Simulation data found and verified!');
  }
}

verifySimulationData().catch(console.error);
