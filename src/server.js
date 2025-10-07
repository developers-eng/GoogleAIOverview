import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import AiOverviewController from './controllers/aiOverviewController.js';
import { generalRateLimit, scrapingRateLimit, batchRateLimit } from './middleware/rateLimiter.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize controller
const aiOverviewController = new AiOverviewController();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// General rate limiting
app.use(generalRateLimit);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => aiOverviewController.healthCheck(req, res));

// Root endpoint with API information
app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'AI Overview API',
    version: '1.0.0',
    description: 'API for scraping Google AI Overview results',
    endpoints: {
      health: 'GET /api/health',
      aiOverview: 'GET /api/ai-overview?q=your+query&gl=US&hl=en',
      batchAiOverview: 'POST /api/ai-overview/batch'
    },
    documentation: {
      singleQuery: {
        method: 'GET',
        endpoint: '/api/ai-overview',
        parameters: {
          q: 'Search query (required)',
          gl: 'Geographic location (optional, default: US)',
          hl: 'Language (optional, default: en)',
          num: 'Number of results (optional, default: 10)',
          start: 'Starting position (optional, default: 0)',
          pws: 'Personalized web search (optional, default: 0)'
        },
        example: '/api/ai-overview?q=seo+agency&gl=US&hl=en&num=10'
      },
      batchQuery: {
        method: 'POST',
        endpoint: '/api/ai-overview/batch',
        body: {
          queries: ['query1', 'query2'],
          options: { gl: 'US', hl: 'en' },
          delay: 3000
        },
        note: 'Maximum 10 queries per batch'
      }
    },
    rateLimits: {
      general: '100 requests per 15 minutes',
      scraping: '20 requests per 15 minutes',
      batch: '5 requests per hour'
    },
    timestamp: new Date().toISOString()
  });
});

// AI Overview endpoints
app.get('/api/ai-overview', scrapingRateLimit, (req, res) => {
  aiOverviewController.getAiOverview(req, res);
});

app.post('/api/ai-overview/batch', batchRateLimit, (req, res) => {
  aiOverviewController.batchAiOverview(req, res);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist.`,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/ai-overview',
      'POST /api/ai-overview/batch'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\\nReceived SIGINT, shutting down gracefully...');
  
  try {
    await aiOverviewController.cleanup();
    console.log('Cleanup completed');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
  
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  
  try {
    await aiOverviewController.cleanup();
    console.log('Cleanup completed');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
  
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Overview API server is running on port ${PORT}`);
  console.log(`📡 API Documentation: http://localhost:${PORT}/`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 AI Overview: http://localhost:${PORT}/api/ai-overview?q=your+search+query`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;