import GoogleScraperService from '../services/googleScraper.js';

class AiOverviewController {
  constructor() {
    this.scraperService = new GoogleScraperService();
  }

  // GET /api/ai-overview
  async getAiOverview(req, res) {
    try {
      const { q: query, gl, hl, num, start, pws } = req.query;

      // Validate required parameters
      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Query parameter "q" is required',
          example: '/api/ai-overview?q=seo+agency&gl=US&hl=en'
        });
      }

      // Prepare search options
      const options = {};
      if (gl) options.gl = gl;
      if (hl) options.hl = hl;
      if (num) options.num = parseInt(num);
      if (start) options.start = parseInt(start);
      if (pws !== undefined) options.pws = parseInt(pws);

      console.log(`Processing AI Overview request for: "${query}"`);

      // Scrape AI Overview
      const result = await this.scraperService.scrapeAiOverview(query, options);

      // Return result
      res.json(result);

    } catch (error) {
      console.error('Controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // POST /api/ai-overview/batch
  async batchAiOverview(req, res) {
    try {
      const { queries, options = {}, delay = 3000 } = req.body;

      // Validate required parameters
      if (!queries || !Array.isArray(queries) || queries.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Array of queries is required',
          example: {
            queries: ['seo agency', 'digital marketing'],
            options: { gl: 'US', hl: 'en' },
            delay: 3000
          }
        });
      }

      // Limit batch size to prevent abuse
      if (queries.length > 10) {
        return res.status(400).json({
          success: false,
          error: 'Maximum 10 queries allowed per batch request'
        });
      }

      console.log(`Processing batch AI Overview request for ${queries.length} queries`);

      // Process batch
      const results = await this.scraperService.scrapeMultipleQueries(queries, options, delay);

      // Return results
      res.json({
        success: true,
        totalQueries: queries.length,
        results,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Batch controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/health
  async healthCheck(req, res) {
    try {
      res.json({
        success: true,
        status: 'healthy',
        service: 'AI Overview API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Clean up resources
  async cleanup() {
    if (this.scraperService) {
      await this.scraperService.closeBrowser();
    }
  }
}

export default AiOverviewController;