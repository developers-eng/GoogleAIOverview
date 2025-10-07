# AI Overview API

A lightweight Node.js API for scraping Google AI Overview results. This API allows you to programmatically extract AI-generated overviews from Google search results.

## Features

- 🔍 Extract AI Overviews from Google search results
- 🌍 Support for different geographic locations and languages
- 📦 Batch processing for multiple queries
- ⚡ Rate limiting to prevent abuse
- 🛡️ Built-in security headers and CORS support
- 🔧 Easy to integrate with other applications

## Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd aioverview

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env

# Start the development server
npm run dev
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
NODE_ENV=development

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Puppeteer settings
HEADLESS_MODE=true
TIMEOUT_MS=30000
```

## API Endpoints

### Health Check
```http
GET /api/health
```

Returns the API status and health information.

### Single AI Overview Query
```http
GET /api/ai-overview?q=your+search+query&gl=US&hl=en
```

**Parameters:**
- `q` (required): Search query
- `gl` (optional): Geographic location (default: US)
- `hl` (optional): Language (default: en)
- `num` (optional): Number of results (default: 10)
- `start` (optional): Starting position (default: 0)
- `pws` (optional): Personalized web search (default: 0)

**Example Response:**
```json
{
  "success": true,
  "query": "seo agency",
  "searchUrl": "https://www.google.com/search?q=seo+agency&gl=US&hl=en&num=10&start=0&pws=0",
  "aiOverview": {
    "text": "AI-generated overview content...",
    "html": "<div>AI-generated HTML content...</div>",
    "selector": "[data-attrid=\"FeaturedSnippet\"]"
  },
  "hasAiOverview": true,
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

### Batch AI Overview Queries
```http
POST /api/ai-overview/batch
```

**Request Body:**
```json
{
  "queries": ["seo agency", "digital marketing", "web development"],
  "options": {
    "gl": "US",
    "hl": "en"
  },
  "delay": 3000
}
```

**Response:**
```json
{
  "success": true,
  "totalQueries": 3,
  "results": [
    {
      "success": true,
      "query": "seo agency",
      "aiOverview": { ... },
      "hasAiOverview": true,
      "timestamp": "2023-12-07T10:30:00.000Z"
    }
    // ... more results
  ],
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

## Rate Limits

- **General API**: 100 requests per 15 minutes
- **Scraping endpoints**: 20 requests per 15 minutes
- **Batch endpoints**: 5 requests per hour

## Usage Examples

### cURL Examples

```bash
# Single query
curl "http://localhost:3000/api/ai-overview?q=seo+agency&gl=US&hl=en"

# Batch query
curl -X POST http://localhost:3000/api/ai-overview/batch \
  -H "Content-Type: application/json" \
  -d '{
    "queries": ["seo agency", "digital marketing"],
    "options": {"gl": "US", "hl": "en"},
    "delay": 3000
  }'
```

### JavaScript/Node.js Example

```javascript
// Single query
const response = await fetch('http://localhost:3000/api/ai-overview?q=seo+agency&gl=US&hl=en');
const data = await response.json();

if (data.success && data.hasAiOverview) {
  console.log('AI Overview:', data.aiOverview.text);
} else {
  console.log('No AI Overview found for this query');
}

// Batch query
const batchResponse = await fetch('http://localhost:3000/api/ai-overview/batch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    queries: ['seo agency', 'digital marketing'],
    options: { gl: 'US', hl: 'en' },
    delay: 3000
  })
});

const batchData = await batchResponse.json();
console.log(`Processed ${batchData.totalQueries} queries`);
```

### Python Example

```python
import requests

# Single query
response = requests.get('http://localhost:3000/api/ai-overview', params={
    'q': 'seo agency',
    'gl': 'US',
    'hl': 'en'
})

data = response.json()
if data['success'] and data['hasAiOverview']:
    print('AI Overview:', data['aiOverview']['text'])
else:
    print('No AI Overview found for this query')

# Batch query
batch_response = requests.post('http://localhost:3000/api/ai-overview/batch', json={
    'queries': ['seo agency', 'digital marketing'],
    'options': {'gl': 'US', 'hl': 'en'},
    'delay': 3000
})

batch_data = batch_response.json()
print(f"Processed {batch_data['totalQueries']} queries")
```

## Response Format

### Success Response
When an AI Overview is found:
```json
{
  "success": true,
  "query": "search query",
  "searchUrl": "https://google.com/search?...",
  "aiOverview": {
    "text": "Plain text content of AI Overview",
    "html": "HTML content of AI Overview",
    "selector": "CSS selector used to find the content"
  },
  "hasAiOverview": true,
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

### No AI Overview Found
When no AI Overview is available for the query:
```json
{
  "success": true,
  "query": "search query",
  "searchUrl": "https://google.com/search?...",
  "aiOverview": null,
  "hasAiOverview": false,
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "query": "search query",
  "error": "Error message",
  "aiOverview": null,
  "hasAiOverview": false,
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

## Development

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests (when available)

### Project Structure

```
src/
├── controllers/
│   └── aiOverviewController.js    # Request handlers
├── services/
│   └── googleScraper.js          # Google scraping logic
├── middleware/
│   └── rateLimiter.js            # Rate limiting middleware
└── server.js                     # Main application file
```

## Important Notes

- 🚨 **Legal Compliance**: Make sure to comply with Google's Terms of Service and robots.txt when using this API
- 🔄 **Rate Limiting**: The API includes rate limiting to prevent abuse and avoid being blocked by Google
- 🎯 **AI Overview Availability**: Not all search queries return AI Overviews - the API will indicate when none is found
- 🔧 **Customization**: The AI Overview extraction logic may need updates as Google changes their HTML structure

## Troubleshooting

### Common Issues

1. **Puppeteer Installation Issues**
   ```bash
   npm install puppeteer --unsafe-perm=true --allow-root
   ```

2. **Rate Limit Exceeded**
   - Wait for the rate limit window to reset
   - Reduce request frequency
   - Consider implementing request queuing

3. **No AI Overview Found**
   - Try different search queries
   - Check if AI Overviews are available in your region
   - Verify the query matches typical AI Overview patterns

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions, please open an issue on the GitHub repository.