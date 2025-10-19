/**
 * Setup Verification Script
 * Run this to verify your app is properly configured
 */

const { createClient } = require('@supabase/supabase-js');

async function verifySetup() {
  console.log('🔍 Verifying Whop Creator Analytics Setup...\n');

  // Check environment variables
  console.log('📋 Checking Environment Variables:');
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_WHOP_APP_ID',
    'WHOP_API_KEY',
    'WHOP_WEBHOOK_SECRET'
  ];

  let envVarsOk = true;
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value === 'your_' + varName.toLowerCase().replace('next_public_', '')) {
      console.log(`❌ ${varName}: Missing or placeholder value`);
      envVarsOk = false;
    } else {
      console.log(`✅ ${varName}: Set`);
    }
  });

  if (!envVarsOk) {
    console.log('\n❌ Environment variables not properly configured. See SETUP_GUIDE.md');
    return;
  }

  // Check Supabase connection and tables
  console.log('\n🗄️ Checking Database Schema:');
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Check if all required tables exist
    const requiredTables = [
      'clients',
      'entities', 
      'events',
      'subscriptions',
      'insights',
      'form_templates',
      'form_submissions',
      'ai_runs',
      'ai_text_pool'
    ];

    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.log('❌ Cannot connect to Supabase:', tablesError.message);
      return;
    }

    const existingTables = tables.map(t => t.table_name);
    let dbOk = true;

    requiredTables.forEach(tableName => {
      if (existingTables.includes(tableName)) {
        console.log(`✅ Table ${tableName}: Exists`);
      } else {
        console.log(`❌ Table ${tableName}: Missing`);
        dbOk = false;
      }
    });

    if (!dbOk) {
      console.log('\n❌ Database schema incomplete. Run database/complete-working-schema.sql');
      return;
    }

    // Test RLS policies
    console.log('\n🔒 Testing Row Level Security:');
    const { data: rlsTables, error: rlsError } = await supabase
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('schemaname', 'public');

    if (rlsError) {
      console.log('❌ Cannot check RLS status');
    } else {
      const rlsEnabledTables = rlsTables.filter(t => t.rowsecurity);
      console.log(`✅ RLS enabled on ${rlsEnabledTables.length} tables`);
      
      if (rlsEnabledTables.length < requiredTables.length) {
        console.log('⚠️ Some tables may not have RLS enabled');
      }
    }

  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return;
  }

  // Check Whop SDK configuration
  console.log('\n🔗 Checking Whop Integration:');
  try {
    // Check if the new SDK is installed
    const Whop = require('@whop/sdk');
    
    if (process.env.NEXT_PUBLIC_WHOP_APP_ID && process.env.WHOP_API_KEY) {
      console.log('✅ Whop SDK configured (@whop/sdk)');
    } else {
      console.log('❌ Whop SDK credentials missing');
    }
  } catch (error) {
    console.log('⚠️ Whop SDK not found (@whop/sdk should be installed)');
  }

  // Check OpenAI configuration (optional)
  console.log('\n🤖 Checking AI Configuration:');
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
    console.log('✅ OpenAI API key configured');
  } else {
    console.log('⚠️ OpenAI API key not configured (AI insights will use stub data)');
  }

  console.log('\n🎉 Setup Verification Complete!');
  console.log('\nNext steps:');
  console.log('1. Start your app: npm run dev');
  console.log('2. Go to: http://localhost:3000/auth/login');
  console.log('3. Test the OAuth flow');
  console.log('4. Verify data isolation works');
}

// Run verification
verifySetup().catch(console.error);

