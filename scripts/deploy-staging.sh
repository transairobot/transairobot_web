#!/bin/bash

# Deployment script for staging environment
echo "Deploying TransAIRobot website to staging environment..."

# Set variables
DEPLOY_PATH="./dist"
STAGING_SERVER="user@staging-server.transairobot.com"
STAGING_PATH="/var/www/staging.transairobot.com"

# Compress the dist folder
echo "Compressing build files..."
tar -czf dist.tar.gz -C $DEPLOY_PATH .

# Upload to staging server
echo "Uploading to staging server..."
scp dist.tar.gz $STAGING_SERVER:~

# Execute remote commands
echo "Deploying on staging server..."
ssh $STAGING_SERVER << EOF
  # Backup current version
  if [ -d "$STAGING_PATH" ]; then
    echo "Creating backup of current version..."
    timestamp=\$(date +%Y%m%d_%H%M%S)
    mkdir -p ${STAGING_PATH}_backups
    tar -czf ${STAGING_PATH}_backups/backup_\$timestamp.tar.gz -C $STAGING_PATH .
  fi

  # Clean and prepare directory
  echo "Preparing deployment directory..."
  mkdir -p $STAGING_PATH
  rm -rf $STAGING_PATH/*

  # Extract new version
  echo "Extracting new version..."
  tar -xzf ~/dist.tar.gz -C $STAGING_PATH

  # Clean up
  echo "Cleaning up..."
  rm ~/dist.tar.gz

  # Set permissions
  echo "Setting permissions..."
  chmod -R 755 $STAGING_PATH
EOF

# Clean up local tar file
echo "Cleaning up local files..."
rm dist.tar.gz

echo "Deployment to staging completed successfully!"
