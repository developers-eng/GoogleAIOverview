import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import UserAgent from 'user-agents';

class GoogleScraperService {
  constructor() {
    this.browser = null;
    this.userAgent = new UserAgent();
    this.lastRequestTime = 0;
    this.minDelay = 5000; // Minimum 5 seconds between requests
  }

  async initBrowser() {
    if (!this.browser || !this.browser.connected) {
      if (this.browser) {
        try {
          await this.browser.close();
        } catch (e) {
          // Browser already closed
        }
      }
      
      this.browser = await puppeteer.launch({
        headless: process.env.HEADLESS_MODE === 'true' ? 'new' : false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled',
          '--disable-features=VizDisplayCompositor',
          '--no-first-run',
          '--disable-gpu',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-default-apps',
          '--disable-extensions',
          '--disable-sync',
          '--no-default-browser-check',
          '--no-pings',
          '--disable-client-side-phishing-detection',
          '--disable-component-extensions-with-background-pages'
        ],
        timeout: 60000
      });
      
      // Additional stealth measures
      const pages = await this.browser.pages();
      if (pages.length > 0) {
        const page = pages[0];
        await page.evaluateOnNewDocument(() => {
          Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
          });
          
          // Remove automation indicators
          delete navigator.__proto__.webdriver;
          
          // Mock permissions API
          Object.defineProperty(navigator, 'permissions', {
            get: () => ({
              query: () => Promise.resolve({ state: 'granted' })
            })
          });
        });
      }
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  buildGoogleSearchUrl(query, options = {}) {
    const {
      gl = 'US',        // Geographic location
      hl = 'en',        // Language
      num = 10,         // Number of results
      start = 0,        // Starting position
      pws = 0           // Personalized web search (0 = off)
    } = options;

    const params = new URLSearchParams({
      q: query,
      gl,
      hl,
      num: num.toString(),
      start: start.toString(),
      pws: pws.toString()
    });

    return `https://www.google.com/search?${params.toString()}`;
  }

  extractAiOverview(html) {
    const $ = cheerio.load(html);
    
    // Updated selectors for AI Overview sections (Google frequently changes these)
    const aiOverviewSelectors = [
      '[data-attrid="FeaturedSnippet"]',
      '[data-attrid="SGTOverview"]',
      '[jsname="xQjRM"]',
      '[data-async-context="query:"]',
      '.aCOpRe',
      '.kp-wholepage-osrp',
      '.g-blk',
      '.TzHB6b',
      '.BNeawe',
      '.IZ6rdc',
      '.hgKElc',
      '.LTKOO',
      '.sATSHe',
      '.UCInVb',
      '.yXK7lf',
      '.MjjYud',
      '.VwiC3b',
      '.yXK7lf em',
      '.hgKElc .BNeawe'
    ];

    let aiOverviewContent = null;
    let foundSelector = null;

    // Try each selector to find AI Overview content
    for (const selector of aiOverviewSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        const text = element.text().trim();
        if (text && text.length > 50) { // Ensure meaningful content
          aiOverviewContent = {
            text: text,
            html: element.html(),
            selector: selector
          };
          foundSelector = selector;
          break;
        }
      }
    }

    // Alternative approach: Look for specific AI Overview patterns
    if (!aiOverviewContent) {
      // Look for elements containing AI overview keywords
      const aiKeywords = ['AI-generated', 'Generative AI', 'Overview', 'Sources include'];
      
      for (const keyword of aiKeywords) {
        const elements = $(`*:contains("${keyword}")`);
        elements.each((i, el) => {
          const $el = $(el);
          const text = $el.text().trim();
          if (text && text.length > 100) {
            aiOverviewContent = {
              text: text,
              html: $el.html(),
              selector: 'keyword-based',
              keyword: keyword
            };
            return false; // Break out of each loop
          }
        });
        if (aiOverviewContent) break;
      }
    }

    return aiOverviewContent;
  }

  async scrapeAiOverview(query, options = {}) {
    let page = null;
    let browser = null;
    
    // Enforce minimum delay between requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minDelay) {
      const waitTime = this.minDelay - timeSinceLastRequest;
      console.log(`⏳ Waiting ${waitTime}ms to avoid detection...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
    
    try {
      browser = await this.initBrowser();
      page = await browser.newPage();
      
      // Additional stealth measures for the page
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
        
        delete navigator.__proto__.webdriver;
        
        // Mock chrome runtime
        window.chrome = {
          runtime: {}
        };
        
        // Mock permissions
        Object.defineProperty(navigator, 'permissions', {
          get: () => ({
            query: () => Promise.resolve({ state: 'granted' })
          })
        });
        
        // Mock plugins
        Object.defineProperty(navigator, 'plugins', {
          get: () => [
            {
              0: {
                type: 'application/x-google-chrome-pdf',
                suffixes: 'pdf',
                description: 'Portable Document Format',
                enabledPlugin: Plugin
              },
              description: 'Portable Document Format',
              filename: 'internal-pdf-viewer',
              length: 1,
              name: 'Chrome PDF Plugin'
            }
          ]
        });
      });
      
      // Set random user agent with more realistic options
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
      ];
      const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
      await page.setUserAgent(randomUA);
      console.log(`Using User Agent: ${randomUA.substring(0, 50)}...`);
      
      // Set randomized realistic viewport
      const viewports = [
        { width: 1920, height: 1080 },
        { width: 1366, height: 768 },
        { width: 1440, height: 900 },
        { width: 1536, height: 864 },
        { width: 1280, height: 720 }
      ];
      const randomViewport = viewports[Math.floor(Math.random() * viewports.length)];
      await page.setViewport({
        width: randomViewport.width,
        height: randomViewport.height,
        deviceScaleFactor: 1,
      });
      console.log(`Using viewport: ${randomViewport.width}x${randomViewport.height}`);

      // Set extra HTTP headers to appear more like a real browser
      await page.setExtraHTTPHeaders({
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'max-age=0',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      });

      // Build search URL
      const searchUrl = this.buildGoogleSearchUrl(query, options);
      
      // Add longer random delay to avoid detection
      const randomDelay = Math.floor(Math.random() * 3000) + 2000; // 2-5 seconds
      console.log(`⏳ Initial delay: ${randomDelay}ms`);
      await page.waitForTimeout(randomDelay);
      
      console.log(`Navigating to: ${searchUrl}`);
      
      // First, go to Google homepage to establish session
      console.log('ℹ️ Step 1: Visiting Google homepage...');
      await page.goto('https://www.google.com', {
        waitUntil: 'domcontentloaded',
        timeout: 20000
      });
      
      // Simulate human behavior - move mouse and wait
      await page.mouse.move(Math.random() * 100, Math.random() * 100);
      const homepageDelay = Math.floor(Math.random() * 2000) + 3000; // 3-5 seconds
      console.log(`⏳ Homepage delay: ${homepageDelay}ms`);
      await page.waitForTimeout(homepageDelay);
      
      // Then navigate to search results
      console.log('ℹ️ Step 2: Performing search...');
      await page.goto(searchUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 20000
      });

      // Wait longer for dynamic content to load
      const contentDelay = Math.floor(Math.random() * 2000) + 4000; // 4-6 seconds
      console.log(`⏳ Content loading delay: ${contentDelay}ms`);
      await page.waitForTimeout(contentDelay);
      
      // Add some mouse movement to simulate human behavior
      await page.mouse.move(Math.random() * 200, Math.random() * 200);

      // Check if we're blocked or redirected
      const currentUrl = page.url();
      console.log(`✅ Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('sorry/index') || currentUrl.includes('captcha') || currentUrl.includes('blocked')) {
        console.log('🚫 Detected blocking page');
        // Take screenshot for debugging
        try {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          await page.screenshot({ path: `blocked-${timestamp}.png` });
          console.log(`📸 Screenshot saved as blocked-${timestamp}.png`);
        } catch (e) {
          console.error('Failed to take screenshot:', e.message);
        }
        
        // Try to get page title and content for debugging
        try {
          const title = await page.title();
          console.log(`Page title: ${title}`);
        } catch (e) {
          console.log('Could not get page title');
        }
        
        throw new Error('🚫 BLOCKED: Google detected automation. Solutions: 1) Wait 10+ minutes 2) Change IP/VPN 3) Use different browser profile 4) Try simpler queries first');
      }
      
      // Check for other potential blocking indicators
      const pageText = await page.$eval('body', el => el.innerText.substring(0, 500)).catch(() => '');
      if (pageText.includes('unusual traffic') || pageText.includes('automated queries')) {
        throw new Error('🚫 SOFT BLOCK: Google detected unusual traffic. Wait and try again with different patterns.');
      }

      // Get page content
      const html = await page.content();
      
      // Extract AI Overview
      const aiOverview = this.extractAiOverview(html);
      
      return {
        success: true,
        query,
        searchUrl,
        aiOverview: aiOverview || null,
        hasAiOverview: !!aiOverview,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error scraping AI Overview:', error.message);
      
      return {
        success: false,
        query,
        error: error.message,
        aiOverview: null,
        hasAiOverview: false,
        timestamp: new Date().toISOString()
      };
    } finally {
      if (page && !page.isClosed()) {
        try {
          await page.close();
        } catch (e) {
          console.error('Error closing page:', e.message);
        }
      }
    }
  }

  // Method to handle multiple queries with delay
  async scrapeMultipleQueries(queries, options = {}, delay = 3000) {
    const results = [];
    
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      console.log(`Processing query ${i + 1}/${queries.length}: ${query}`);
      
      const result = await this.scrapeAiOverview(query, options);
      results.push(result);
      
      // Add delay between requests to avoid being blocked
      if (i < queries.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return results;
  }
}

export default GoogleScraperService;