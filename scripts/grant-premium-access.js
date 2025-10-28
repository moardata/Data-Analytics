/**
 * Grant Premium Access Script
 * Sets a specific company to top tier (Scale) with unlimited access
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function grantPremiumAccess(companyId) {
  console.log(`🔓 Granting premium access to: ${companyId}`);

  // Set trial end date far in the future (1 year)
  const trialEndsAt = new Date();
  trialEndsAt.setFullYear(trialEndsAt.getFullYear() + 1);

  // Update or create client with top tier
  const { data, error } = await supabase
    .from('clients')
    .upsert({
      company_id: companyId,
      whop_user_id: companyId,
      email: `${companyId}@dev.test`,
      name: 'Premium Dev Account',
      current_tier: 'surge', // Top tier (Scale - $599/mo equivalent)
      subscription_tier: 'premium', // For RLS compatibility
      subscription_status: 'active',
      trial_ends_at: trialEndsAt.toISOString(),
      whop_plan_id: 'prod_bm98P1RCFrFmF', // Scale plan ID
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'company_id',
      ignoreDuplicates: false
    })
    .select();

  if (error) {
    console.error('❌ Error:', error);
    return false;
  }

  console.log('✅ Premium access granted!');
  console.log('📊 Account details:', {
    tier: 'surge (Scale)',
    price: '$599/mo equivalent',
    limits: {
      students: 'Unlimited',
      responses: 'Unlimited',
      aiInsights: '20/day',
      csvExport: true,
      pdfExport: true,
      apiAccess: true,
      allMetrics: true
    },
    trialEndsAt: trialEndsAt.toISOString()
  });

  return true;
}

// Run the script
const companyId = process.argv[2] || 'biz_3GYHNPbGkZCEky';
grantPremiumAccess(companyId)
  .then(() => {
    console.log('✅ Done! You now have full access to all features.');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });

