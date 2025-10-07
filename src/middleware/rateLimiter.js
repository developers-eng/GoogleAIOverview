import rateLimit from 'express-rate-limit';

// Rate limiter for general API requests
export const generalRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 'Check the Retry-After header for when you can make requests again'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: res.get('Retry-After')
    });
  }
});

// Stricter rate limiter for scraping endpoints
export const scrapingRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 scraping requests per 15 minutes
  message: {
    success: false,
    error: 'Scraping rate limit exceeded',
    message: 'Too many scraping requests. Please reduce your request frequency.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Scraping rate limit exceeded',
      message: 'Too many scraping requests from this IP. Please try again later.',
      retryAfter: res.get('Retry-After')
    });
  }
});

// Even stricter rate limiter for batch endpoints
export const batchRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 batch requests per hour
  message: {
    success: false,
    error: 'Batch rate limit exceeded',
    message: 'Too many batch requests. Batch processing is limited to prevent abuse.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Batch rate limit exceeded',
      message: 'Too many batch requests from this IP. Please try again later.',
      retryAfter: res.get('Retry-After')
    });
  }
});