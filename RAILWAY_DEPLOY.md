# Railway Deployment Guide

## Quick Fix for Build Timeouts

### Step 1: Force Nixpacks Builder
1. In Railway dashboard, go to your service settings
2. Under "Build", make sure builder is set to **NIXPACKS** (not Docker)
3. If it's using Docker, change to Nixpacks

### Step 2: Set Environment Variables
In Railway dashboard, add these environment variables:
```
NODE_ENV=production
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
NODE_OPTIONS=--max-old-space-size=1024
```

### Step 3: Deploy Options

#### Option A: Use Nixpacks (Recommended - Fastest)
- Railway should automatically use `nixpacks.toml`
- Expected build time: 2-3 minutes

#### Option B: Use Docker (Fallback)
- Railway will use the optimized `Dockerfile` (Alpine-based)
- Expected build time: 3-5 minutes

### Step 4: Alternative Quick Deploy
If still having issues, temporarily remove Puppeteer dependency:
1. Comment out puppeteer in package.json
2. Deploy successfully
3. Add back puppeteer and redeploy

### Troubleshooting
- **Still timing out?** Check Railway logs for specific step that's slow
- **Docker build issues?** Delete Dockerfile to force Nixpacks
- **NPM install stuck?** Clear Railway build cache in dashboard

## Build Time Expectations
- **Before optimization**: 10+ minutes (timeout)
- **After optimization**: 2-4 minutes ✅