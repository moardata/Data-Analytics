/**
 * Check Database Schema
 * Verifies if the cached_dashboard_metrics table exists and shows all tables
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

async function checkDatabaseSchema() {
  console.log('🔍 Checking Database Schema...\n');

  try {
    // Check if cached_dashboard_metrics table exists
    console.log('📊 Checking for cached_dashboard_metrics table...');
    
    const { data: metricsTable, error: metricsError } = await supabase
      .from('cached_dashboard_metrics')
      .select('*')
      .limit(1);
    
    if (metricsError) {
      console.log(`❌ cached_dashboard_metrics table not found: ${metricsError.message}`);
    } else {
      console.log('✅ cached_dashboard_metrics table exists!');
      console.log(`📈 Found ${metricsTable.length} cached metrics`);
    }
    
    // List all tables in the database
    console.log('\n📋 All Tables in Database:');
    
    const tables = [
      'clients',
      'entities', 
      'events',
      'subscriptions',
      'form_templates',
      'form_submissions',
      'insights',
      'courses',
      'course_lessons',
      'course_enrollments',
      'lesson_interactions',
      'webhook_events',
      'cached_dashboard_metrics'
    ];
    
    for (const tableName of tables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`  ❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`  ✅ ${tableName}: Table exists`);
        }
      } catch (err) {
        console.log(`  ❌ ${tableName}: ${err.message}`);
      }
    }
    
    // Check specific table structure if it exists
    if (!metricsError) {
      console.log('\n🔍 cached_dashboard_metrics table structure:');
      try {
        const { data: sampleData } = await supabase
          .from('cached_dashboard_metrics')
          .select('*')
          .limit(3);
        
        if (sampleData && sampleData.length > 0) {
          console.log('📊 Sample data:');
          sampleData.forEach((row, i) => {
            console.log(`  ${i + 1}. ${row.metric_type} - ${row.client_id} (${new Date(row.created_at).toLocaleString()})`);
          });
        } else {
          console.log('📊 No cached metrics yet (table is empty)');
        }
      } catch (err) {
        console.log(`❌ Error reading table: ${err.message}`);
      }
    }
    
    // Check if we can insert a test record
    console.log('\n🧪 Testing table write access...');
    try {
      const testRecord = {
        client_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
        metric_type: 'test_metric',
        metric_data: { test: true },
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      };
      
      const { error: insertError } = await supabase
        .from('cached_dashboard_metrics')
        .insert(testRecord);
      
      if (insertError) {
        console.log(`❌ Cannot insert test record: ${insertError.message}`);
      } else {
        console.log('✅ Table write access works!');
        
        // Clean up test record
        await supabase
          .from('cached_dashboard_metrics')
          .delete()
          .eq('client_id', '00000000-0000-0000-0000-000000000000');
        console.log('🧹 Test record cleaned up');
      }
    } catch (err) {
      console.log(`❌ Write test failed: ${err.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
  
  console.log('\n🎯 If cached_dashboard_metrics table exists:');
  console.log('  ✅ Cron jobs can start processing');
  console.log('  ✅ Metrics will be cached automatically');
  console.log('  ✅ Dashboard will load faster');
  
  console.log('\n🎯 If table is missing:');
  console.log('  ❌ Run the SQL migration again');
  console.log('  ❌ Check Supabase SQL Editor for errors');
  console.log('  ❌ Verify you\'re in the correct database');
}

checkDatabaseSchema().catch(console.error);
