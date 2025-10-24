/**
 * Test Dashboard Direct
 * Test the dashboard API directly by making HTTP requests
 */

require('dotenv').config({ path: '.env.local' });

const COMPANY_IDS = ['biz_Jkhjc11f6HHRxh', 'biz_3GYHNPbGkZCEky'];

async function testDashboardDirect() {
  console.log('🔍 Testing Dashboard API Directly...\n');

  // Test with localhost first
  const baseUrls = [
    'http://localhost:3000',
    'https://data-analytics-whop.vercel.app' // Replace with your actual Vercel URL
  ];

  for (const baseUrl of baseUrls) {
    console.log(`🌐 Testing: ${baseUrl}`);
    
    for (const companyId of COMPANY_IDS) {
      console.log(`\n📊 Testing ${companyId}:`);
      
      try {
        // Test GET request (normal dashboard load)
        console.log('  🔄 Testing GET /api/dashboard/metrics...');
        const getResponse = await fetch(`${baseUrl}/api/dashboard/metrics?clientId=${companyId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log(`    Status: ${getResponse.status} ${getResponse.statusText}`);
        
        if (getResponse.ok) {
          const data = await getResponse.json();
          console.log('    ✅ GET Success!');
          console.log(`       Client ID: ${data.metadata?.clientId || 'N/A'}`);
          console.log(`       Generated At: ${data.metadata?.generatedAt || 'N/A'}`);
          console.log(`       Cache Status: ${JSON.stringify(data.metadata?.cacheStatus || {})}`);
          
          // Check if we have actual data
          const hasData = Object.values(data.metadata?.cacheStatus || {}).some(Boolean);
          console.log(`       Has Cached Data: ${hasData ? '✅ Yes' : '❌ No'}`);
          
          if (!hasData) {
            console.log('    🔄 No cached data, testing POST (sync)...');
            
            // Test POST request (sync operation)
            const postResponse = await fetch(`${baseUrl}/api/dashboard/metrics?clientId=${companyId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            console.log(`      POST Status: ${postResponse.status} ${postResponse.statusText}`);
            
            if (postResponse.ok) {
              const syncData = await postResponse.json();
              console.log('      ✅ POST Success!');
              console.log(`         Synced: ${syncData.metadata?.synced || false}`);
              console.log(`         Cache Status: ${JSON.stringify(syncData.metadata?.cacheStatus || {})}`);
            } else {
              const errorText = await postResponse.text();
              console.log(`      ❌ POST Error: ${errorText}`);
            }
          }
          
        } else {
          const errorText = await getResponse.text();
          console.log(`    ❌ GET Error: ${errorText}`);
        }
        
      } catch (error) {
        console.log(`    ❌ Request failed: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  }
  
  console.log('🎯 DIAGNOSIS:');
  console.log('  If GET works with data → Dashboard should display metrics');
  console.log('  If GET works but no data → Need to run POST (sync) first');
  console.log('  If both fail → API deployment or function issues');
  console.log('  If localhost works but Vercel doesn\'t → Deployment issue');
}

testDashboardDirect().catch(console.error);
