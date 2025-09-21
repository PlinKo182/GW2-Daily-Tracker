#!/bin/bash

echo "🚀 Tyria Tracker - Deployment Script"
echo "====================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Build frontend
echo "🔨 Building frontend..."
cd frontend
yarn install
yarn build
cd ..

echo "✅ Build completed successfully!"
echo ""
echo "🌐 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Run 'vercel' to deploy"
echo "2. Set environment variables in Vercel dashboard:"
echo "   - MONGO_URL (your MongoDB connection string)"
echo "   - DB_NAME (tyria_tracker)"
echo "   - REACT_APP_BACKEND_URL (your Vercel app URL)"
echo "3. Deploy with 'vercel --prod'"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"