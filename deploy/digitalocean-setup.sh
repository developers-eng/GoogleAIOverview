#!/bin/bash
# DigitalOcean Droplet Setup Script for AI Overview API

echo "🚀 Setting up AI Overview API on DigitalOcean"

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Chrome dependencies
sudo apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    xdg-utils

# Install Google Chrome
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google.list
sudo apt-get update
sudo apt-get install -y google-chrome-stable

# Install PM2 for process management
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /var/www/ai-overview-api
sudo chown $USER:$USER /var/www/ai-overview-api

echo "✅ Server setup complete!"
echo "Next steps:"
echo "1. Upload your code to /var/www/ai-overview-api"
echo "2. Run: cd /var/www/ai-overview-api && npm install"
echo "3. Run: pm2 start src/server.js --name ai-overview-api"
echo "4. Run: pm2 startup && pm2 save"