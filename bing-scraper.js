import GoogleScraperService from './src/services/googleScraper.js';

class BingScraperService extends GoogleScraperService {
  buildSearchUrl(query, options = {}) {
    const {
      cc = 'US',        // Country code
      setLang = 'en',   // Language
      count = 10        // Number of results
    } = options;

    const params = new URLSearchParams({
      q: query,
      cc,
      setLang,
      count: count.toString()
    });

    return `https://www.bing.com/search?${params.toString()}`;
  }

  extractAiOverview(html) {
    const $ = require('cheerio').load(html);
    
    // Bing AI/Copilot response selectors
    const bingAiSelectors = [
      '.b_cards',
      '.b_ans',
      '.b_entityTP',
      '.b_pag',
      '.b_factrow',
      '.ans_nws',
      '.b_xlText',
      '.rms_rnk'
    ];

    let aiContent = null;

    for (const selector of bingAiSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        const text = element.text().trim();
        if (text && text.length > 30) {
          aiContent = {
            text: text,
            html: element.html(),
            selector: selector
          };
          break;
        }
      }
    }

    return aiContent;
  }

  async scrapeAiOverview(query, options = {}) {
    console.log(`🔍 Scraping Bing for: "${query}"`);
    
    // Use same browser setup but with Bing URL
    let page = null;
    
    try {
      const browser = await this.initBrowser();
      page = await browser.newPage();
      
      // Set user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Build Bing search URL
      const searchUrl = this.buildSearchUrl(query, options);
      console.log(`Navigating to: ${searchUrl}`);
      
      // Navigate to Bing search
      await page.goto(searchUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });

      await page.waitForTimeout(3000);
      
      // Get page content
      const html = await page.content();
      
      // Extract AI content
      const aiOverview = this.extractAiOverview(html);
      
      return {
        success: true,
        query,
        searchUrl,
        aiOverview: aiOverview || null,
        hasAiOverview: !!aiOverview,
        timestamp: new Date().toISOString(),
        source: 'Bing'
      };

    } catch (error) {
      console.error('Error scraping Bing:', error.message);
      
      return {
        success: false,
        query,
        error: error.message,
        aiOverview: null,
        hasAiOverview: false,
        timestamp: new Date().toISOString(),
        source: 'Bing'
      };
    } finally {
      if (page && !page.isClosed()) {
        await page.close();
      }
    }
  }
}

// Test function
async function testBingScaper() {
  console.log('🚀 Testing Bing Scraper (Alternative to Google)');
  
  const scraper = new BingScraperService();
  
  try {
    const result = await scraper.scrapeAiOverview('SEO Agency', {
      cc: 'US',
      setLang: 'en'
    });
    
    console.log('\n📊 Result:');
    console.log('Success:', result.success);
    console.log('Source:', result.source);
    console.log('Has AI Overview:', result.hasAiOverview);
    
    if (result.success && result.hasAiOverview) {
      console.log('✅ AI content found!');
      console.log('Preview:', result.aiOverview.text.substring(0, 200) + '...');
    } else if (result.success) {
      console.log('ℹ️  No AI content found, but search successful');
    } else {
      console.log('❌ Failed:', result.error);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await scraper.closeBrowser();
  }
}

// Run test
testBingScaper();