#!/bin/bash

# FwdLink EC2 Deployment Script
# This script is executed on the EC2 server during deployment

set -e

APP_DIR=~/fwd-link
LOG_FILE=~/deploy.log

echo "$(date): Starting deployment..." | tee -a $LOG_FILE

cd $APP_DIR

# Pull latest changes
echo "Pulling latest changes from GitHub..."
git pull origin main

# Install dependencies
echo "Installing dependencies..."
npm ci --production=false

# Build the application
echo "Building application..."
npm run build

# Restart the application with PM2
echo "Restarting application..."
pm2 restart fwd-link || pm2 start npm --name "fwd-link" -- start

# Wait for app to start
sleep 5

# Health check
echo "Performing health check..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo "$(date): Deployment successful! App is healthy." | tee -a $LOG_FILE
else
    echo "$(date): Warning - Health check returned status $HTTP_STATUS" | tee -a $LOG_FILE
fi

pm2 save
echo "$(date): Deployment completed." | tee -a $LOG_FILE
