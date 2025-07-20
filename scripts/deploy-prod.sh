#!/bin/bash

# Deployment script for production environment
echo "Deploying TransAIRobot website to production environment..."

# Set variables
DEPLOY_PATH="./dist"
PROD_SERVER="admin@8.137.160.32"
PROD_PATH="/var/www/transairobot.com"

# Compress the dist folder
echo "Compressing build files..."
tar -czf dist.tar.gz -C $DEPLOY_PATH .

# Upload to production server
echo "Uploading to production server..."
scp dist.tar.gz $PROD_SERVER:~

# Execute remote commands
echo "Deploying on production server..."
ssh $PROD_SERVER << EOF
  # Backup current version
  if [ -d "$PROD_PATH" ]; then
    echo "Creating backup of current version..."
    timestamp=\$(date +%Y%m%d_%H%M%S)
    mkdir -p ${PROD_PATH}_backups
    tar -czf ${PROD_PATH}_backups/backup_\$timestamp.tar.gz -C $PROD_PATH .
  fi

  # Clean and prepare directory
  echo "Preparing deployment directory..."
  mkdir -p $PROD_PATH
  rm -rf $PROD_PATH/*

  # Extract new version
  echo "Extracting new version..."
  tar -xzf ~/dist.tar.gz -C $PROD_PATH

  # Clean up
  echo "Cleaning up..."
  rm ~/dist.tar.gz

  # Set permissions
  echo "Setting permissions..."
  chmod -R 755 $PROD_PATH

  # Invalidate CDN cache if applicable
  # aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
EOF

# Clean up local tar file
echo "Cleaning up local files..."
rm dist.tar.gz

echo "Deployment to production completed successfully!"