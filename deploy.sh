#!/bin/bash

# =================================================================
# FULL PROJECT DEPLOYMENT SCRIPT (Frontend + Backend + Admin)
# =================================================================

# --- CONFIGURATION ---
REMOTE_USER="root"
REMOTE_HOST="187.127.129.143"

# BASE PATHS ON VPS
BASE_PATH="/var/www/annecreations"
BACKEND_REMOTE="$BASE_PATH/Backend"
FRONTEND_REMOTE="$BASE_PATH/Frontend"
ADMIN_REMOTE="$BASE_PATH/Admin"
BROCHURE_REMOTE="$BASE_PATH/brochure"

# PM2 NAMES (must match exactly what's on the VPS)
BACKEND_PM2="backend"
FRONTEND_PM2="frontend"
ADMIN_PM2="admin"
BROCHURE_PM2="brochure"
# ---------------------

echo "--------------------------------------------------"
echo "🚀 Starting FULL Project Deployment to $REMOTE_HOST"
echo "--------------------------------------------------"

# 1. BUILD BACKEND
echo "📦 Building BACKEND..."
cd Backend && npm run build && cd ..

# 2. BUILD FRONTEND
echo "📦 Building FRONTEND..."
cd Frontend && npm run build && cd ..

# 3. BUILD ADMIN
echo "📦 Building ADMIN PORTAL..."
cd Admin && npm run build && cd ..

# 4. BUILD BROCHURE
echo "📦 Building BROCHURE..."
cd brochure && npm run build && cd ..

# --- SYNCING ---

echo "🔄 Syncing BACKEND..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.env' --exclude 'src' \
    ./Backend/dist ./Backend/package.json \
    $REMOTE_USER@$REMOTE_HOST:$BACKEND_REMOTE

echo "🔄 Syncing FRONTEND..."
# Syncing the .next folder for Next.js production
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.env' \
    ./Frontend/.next ./Frontend/public ./Frontend/package.json \
    $REMOTE_USER@$REMOTE_HOST:$FRONTEND_REMOTE

echo "🔄 Syncing ADMIN..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.env' \
    ./Admin/.next ./Admin/public ./Admin/package.json \
    $REMOTE_USER@$REMOTE_HOST:$ADMIN_REMOTE

echo "🔄 Syncing BROCHURE..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.env' \
    ./brochure/.next ./brochure/public ./brochure/package.json \
    $REMOTE_USER@$REMOTE_HOST:$BROCHURE_REMOTE

# --- REMOTE RESTART ---

echo "🔄 Restarting all services on VPS..."
ssh $REMOTE_USER@$REMOTE_HOST << EOF
    # Update Backend
    cd $BACKEND_REMOTE && npm install --production
    pm2 restart $BACKEND_PM2 || pm2 start dist/main.js --name $BACKEND_PM2

    # Update Frontend
    cd $FRONTEND_REMOTE && npm install --production
    pm2 restart $FRONTEND_PM2 || pm2 start "npm run start" --name $FRONTEND_PM2

    # Update Admin
    cd $ADMIN_REMOTE && npm install --production
    pm2 restart $ADMIN_PM2 || pm2 start "npm run start" --name $ADMIN_PM2

    # Update Brochure
    cd $BROCHURE_REMOTE && npm install --production
    pm2 restart $BROCHURE_PM2 || pm2 start "npm run start" --name $BROCHURE_PM2

    pm2 save
EOF

echo "--------------------------------------------------"
echo "✅ FULL Project Deployment Successful!"
echo "--------------------------------------------------"
