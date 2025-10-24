/**
 * Test Dashboard API
 * Check if the dashboard API is working and returning data
 */

require('dotenv').config({ path: '.env.local' });

const COMPANY_IDS = ['biz_Jkhjc11f6HHRxh', 'biz_3GYHNPbGkZCEky'];
const BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

async function testDashboardAPI() {
  console.log('🔍 Testing Dashboard API...\n');

  for (const companyId of COMPANY_IDS) {
    console.log(`📊 Testing API for ${companyId}:`);
    
    try {
      // Test the dashboard metrics API
      const response = await fetch(`${BASE_URL}/api/dashboard/metrics?clientId=${companyId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`  Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('  ✅ API Response:');
        console.log(`     Client ID: ${data.metadata?.clientId || 'N/A'}`);
        console.log(`     Generated At: ${data.metadata?.generatedAt || 'N/A'}`);
        console.log(`     Cache Status: ${JSON.stringify(data.metadata?.cacheStatus || {})}`);
        
        // Check each metric
        const metrics = [
          'engagementConsistency',
          'ahaMoments', 
          'contentPathways',
          'popularContent',
          'feedbackThemes',
          'commitmentScores'
        ];
        
        console.log('\n  📊 Metrics Status:');
        metrics.forEach(metric => {
          const hasData = data[metric] && Object.keys(data[metric]).length > 0;
          console.log(`     ${hasData ? '✅' : '❌'} ${metric}: ${hasData ? 'Has data' : 'No data'}`);
        });
        
      } else {
        const errorText = await response.text();
        console.log(`  ❌ API Error: ${errorText}`);
      }
      
    } catch (error) {
      console.log(`  ❌ Request failed: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  }
  
  // Test the old analytics API for comparison
  console.log('🔍 Testing Old Analytics API for comparison...\n');
  
  for (const companyId of COMPANY_IDS) {
    console.log(`📊 Testing old API for ${companyId}:`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/analytics/metrics?companyId=${companyId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`  Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('  ✅ Old API Response:');
        console.log(`     Total Students: ${data.totalStudents || 'N/A'}`);
        console.log(`     Total Events: ${data.totalEvents || 'N/A'}`);
        console.log(`     Active Subscriptions: ${data.activeSubscriptions || 'N/A'}`);
      } else {
        const errorText = await response.text();
        console.log(`  ❌ Old API Error: ${errorText}`);
      }
      
    } catch (error) {
      console.log(`  ❌ Old API Request failed: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  }
  
  console.log('🎯 DIAGNOSIS:');
  console.log('  1. If new API returns data → Dashboard should work');
  console.log('  2. If new API fails → Check API implementation');
  console.log('  3. If old API works but new doesn\'t → New API has issues');
  console.log('  4. If both fail → Check deployment or database connection');
}

testDashboardAPI().catch(console.error);
