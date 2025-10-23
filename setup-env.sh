#!/bin/bash
# Setup script for environment commands

echo "🔧 Installing cross-platform dependencies..."
cd apps/web
npm install cross-env rimraf
cd ../..

echo "✅ Dependencies installed!"
echo ""
echo "📋 Available commands:"
echo ""
echo "🔧 LOCAL DEVELOPMENT:"
echo "  npm run dev          # Uses .env.local (localhost URLs)"
echo "  npm run dev:local    # Explicitly uses local environment"
echo ""
echo "🚀 PRODUCTION:"
echo "  npm run build:prod   # Build with production environment"
echo "  npm run start:prod   # Start with production environment"  
echo "  npm run preview:prod # Build + Start with production URLs"
echo ""
echo "⚙️ DEFAULT (uses .env fallback):"
echo "  npm run build        # Build with default environment"
echo "  npm run start        # Start with default environment"
echo ""
echo "🧪 To test the setup:"
echo "  npm run build:prod   # Should build successfully"
echo "  npm run start:prod   # Should start with Railway URLs"