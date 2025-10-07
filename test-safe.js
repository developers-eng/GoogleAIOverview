import GoogleScraperService from './src/services/googleScraper.js';

async function testWithSaferQueries() {
  const scraper = new GoogleScraperService();
  
  // List of queries from safer to more commercial
  const testQueries = [
    'what is HTML',           // Very safe, educational
    'how does CSS work',      // Safe, technical
    'JavaScript basics',      // Moderately safe
    'web development tips',   // Slightly commercial
    'SEO Agency'             // Most commercial, likely to trigger blocks
  ];
  
  console.log('🧪 Testing AI Overview scraper with graduated queries...');
  console.log('📊 This will help us find the detection threshold\n');
  
  for (let i = 0; i < testQueries.length; i++) {
    const query = testQueries[i];
    console.log(`\n📍 Test ${i + 1}/${testQueries.length}: "${query}"`);
    console.log('=' .repeat(50));
    
    try {
      const startTime = Date.now();
      const result = await scraper.scrapeAiOverview(query, {
        gl: 'US',
        hl: 'en'
      });
      const endTime = Date.now();
      
      console.log(`⏱️  Request took: ${endTime - startTime}ms`);
      
      if (result.success) {
        console.log('✅ SUCCESS!');
        if (result.hasAiOverview) {
          console.log('🎯 AI Overview found!');
          const preview = result.aiOverview.text.substring(0, 150);
          console.log(`📝 Preview: "${preview}..."`);
          console.log(`🔍 Selector used: ${result.aiOverview.selector}`);
        } else {
          console.log('ℹ️  No AI Overview found for this query (normal)');
        }
      } else {
        console.log('❌ FAILED:', result.error);
        
        // If we get blocked, stop testing more commercial queries
        if (result.error.includes('BLOCKED') || result.error.includes('detected')) {
          console.log('🛑 Blocking detected - stopping further tests');
          console.log('💡 Recommendation: Wait 10+ minutes before trying again');
          break;
        }
      }
      
    } catch (error) {
      console.error('💥 Exception occurred:', error.message);
      
      // If we get blocked, stop testing
      if (error.message.includes('BLOCKED') || error.message.includes('detected')) {
        console.log('🛑 Blocking detected - stopping further tests');
        break;
      }
    }
    
    // Always wait between tests
    if (i < testQueries.length - 1) {
      console.log('\n⏳ Waiting 8 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 8000));
    }
  }
  
  console.log('\n🏁 Test sequence completed');
  await scraper.closeBrowser();
  console.log('🔒 Browser closed.');
}

// Additional function to test a single query with maximum stealth
async function testSingleQueryMaxStealth(query = 'what is programming') {
  console.log('\n🥷 Testing single query with MAXIMUM stealth measures...');
  console.log(`Query: "${query}"\n`);
  
  const scraper = new GoogleScraperService();
  
  // Increase minimum delay for this test
  scraper.minDelay = 10000; // 10 seconds between any requests
  
  try {
    const result = await scraper.scrapeAiOverview(query, {
      gl: 'US',
      hl: 'en'
    });
    
    console.log('📊 Final Result:');
    console.log('Success:', result.success);
    console.log('Has AI Overview:', result.hasAiOverview);
    if (result.success && result.hasAiOverview) {
      console.log('Preview:', result.aiOverview.text.substring(0, 200) + '...');
    }
    if (!result.success) {
      console.log('Error:', result.error);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await scraper.closeBrowser();
  }
}

// Run the tests
console.log('🚀 Starting AI Overview API Tests\n');
console.log('Options:');
console.log('1. Graduated query test (recommended)');
console.log('2. Single query with maximum stealth\n');

// For now, run the graduated test
// You can modify this to run testSingleQueryMaxStealth() instead
await testWithSaferQueries();

// Uncomment the line below to test single query with max stealth
// await testSingleQueryMaxStealth('what is JavaScript');