import GoogleScraperService from './src/services/googleScraper.js';

async function testScraper() {
  const scraper = new GoogleScraperService();
  
  console.log('Testing AI Overview scraper...');
  
  try {
    // Test with a simple query
    const result = await scraper.scrapeAiOverview('SEO Agency', {
      gl: 'US',
      hl: 'en'
    });
    
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Scraper working successfully!');
      if (result.hasAiOverview) {
        console.log('✅ AI Overview found!');
        console.log('Preview:', result.aiOverview.text.substring(0, 200) + '...');
      } else {
        console.log('ℹ️  No AI Overview found for this query');
      }
    } else {
      console.log('❌ Scraper failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await scraper.closeBrowser();
    console.log('Browser closed.');
  }
}

testScraper();