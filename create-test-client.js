/**
 * Script to manually create a client record for testing
 * Run this with: node create-test-client.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestClient() {
  const companyId = 'biz_3GYHNPbGkZCEky';
  
  console.log(`Creating client record for company: ${companyId}`);
  
  try {
    // Check if client already exists
    const { data: existing, error: checkError } = await supabase
      .from('clients')
      .select('id, company_id, name')
      .eq('company_id', companyId)
      .single();

    if (existing) {
      console.log('✅ Client already exists:', existing);
      return existing.id;
    }

    // Create new client record
    const { data: newClient, error: createError } = await supabase
      .from('clients')
      .insert({
        whop_user_id: companyId,
        company_id: companyId,
        email: `test@${companyId}.com`,
        name: `Test Company ${companyId}`,
        subscription_tier: 'atom', // Legacy field
        current_tier: 'atom', // Start with free tier
        subscription_status: 'active',
      })
      .select('id, company_id, name, current_tier')
      .single();

    if (createError) {
      console.error('❌ Error creating client:', createError);
      return null;
    }

    console.log('✅ Client created successfully:', newClient);
    console.log(`Client ID: ${newClient.id}`);
    console.log(`Company ID: ${newClient.company_id}`);
    console.log(`Tier: ${newClient.current_tier}`);
    
    return newClient.id;

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return null;
  }
}

createTestClient().then((clientId) => {
  if (clientId) {
    console.log('\n🎉 Setup complete! Your test user should now see data.');
    console.log('You can now access: https://whop.com/joined/live-analytics/creator-iq-7I9k1bQcdZXmur/app/');
  } else {
    console.log('\n❌ Setup failed. Check the errors above.');
  }
  process.exit(0);
});
