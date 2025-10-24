/**
 * Test Metric Calculation
 * Test if the metric calculation functions are working
 */

require('dotenv').config({ path: '.env.local' });

// Test the consistency score calculation
async function testConsistencyScore() {
  console.log('🔍 Testing Consistency Score Calculation...\n');
  
  const clientId = 'e379694f-7de5-411d-9040-9f62cf0ac0dc'; // biz_Jkhjc11f6HHRxh
  
  try {
    // Import the function dynamically
    const { calculateConsistencyScore } = await import('./lib/utils/metrics/consistencyScore.ts');
    
    console.log(`📊 Calculating consistency score for client: ${clientId}`);
    const result = await calculateConsistencyScore(clientId);
    
    console.log('✅ Consistency Score Result:');
    console.log(`   Average Score: ${result.averageScore}`);
    console.log(`   Distribution: ${JSON.stringify(result.distribution)}`);
    console.log(`   Trend: ${result.trend}`);
    console.log(`   Student Scores: ${result.studentScores.length} students`);
    
  } catch (error) {
    console.error('❌ Consistency Score Calculation Failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
  }
}

// Test the popular content calculation
async function testPopularContent() {
  console.log('\n🔍 Testing Popular Content Calculation...\n');
  
  const clientId = 'e379694f-7de5-411d-9040-9f62cf0ac0dc'; // biz_Jkhjc11f6HHRxh
  
  try {
    // Import the function dynamically
    const { calculatePopularContent } = await import('./lib/utils/metrics/popularContent.ts');
    
    console.log(`📊 Calculating popular content for client: ${clientId}`);
    const result = await calculatePopularContent(clientId);
    
    console.log('✅ Popular Content Result:');
    console.log(`   Total Engagements: ${result.totalEngagements}`);
    console.log(`   Total Unique Students: ${result.totalUniqueStudents}`);
    console.log(`   Content Items: ${result.content.length}`);
    
    if (result.content.length > 0) {
      console.log('   Top 3 Content:');
      result.content.slice(0, 3).forEach((item, i) => {
        console.log(`     ${i + 1}. ${item.name} - ${item.engagements} engagements`);
      });
    }
    
  } catch (error) {
    console.error('❌ Popular Content Calculation Failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
  }
}

// Test the feedback themes calculation
async function testFeedbackThemes() {
  console.log('\n🔍 Testing Feedback Themes Calculation...\n');
  
  const clientId = 'e379694f-7de5-411d-9040-9f62cf0ac0dc'; // biz_Jkhjc11f6HHRxh
  
  try {
    // Import the function dynamically
    const { calculateFeedbackThemes } = await import('./lib/utils/metrics/feedbackThemes.ts');
    
    console.log(`📊 Calculating feedback themes for client: ${clientId}`);
    const result = await calculateFeedbackThemes(clientId);
    
    console.log('✅ Feedback Themes Result:');
    console.log(`   Has Data: ${result.hasData}`);
    console.log(`   Total Submissions: ${result.totalSubmissions}`);
    console.log(`   Themes: ${result.themes.length}`);
    
    if (result.themes.length > 0) {
      console.log('   Top Themes:');
      result.themes.slice(0, 3).forEach((theme, i) => {
        console.log(`     ${i + 1}. ${theme.theme} (${theme.count} mentions)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Feedback Themes Calculation Failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
  }
}

async function runTests() {
  console.log('🧪 Testing Metric Calculation Functions...\n');
  
  await testConsistencyScore();
  await testPopularContent();
  await testFeedbackThemes();
  
  console.log('\n🎯 DIAGNOSIS:');
  console.log('  If all tests pass → Metric functions work, API should work');
  console.log('  If tests fail → Metric functions have bugs, need to fix');
  console.log('  If import fails → TypeScript compilation issues');
}

runTests().catch(console.error);
