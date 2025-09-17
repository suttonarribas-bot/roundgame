#!/bin/bash

# Miami Vice: Vice Streets - Netlify Deployment Script
# This script helps prepare and deploy the game to Netlify

echo "🌴 Miami Vice: Vice Streets - Deployment Script"
echo "=============================================="

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: Miami Vice Vice Streets game"
fi

# Check if netlify.toml exists
if [ ! -f "netlify.toml" ]; then
    echo "❌ netlify.toml not found. Please ensure it exists."
    exit 1
fi

# Check if all required files exist
required_files=("index.html" "styles.css" "game.js" "audio.js" "vehicles.js")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Required file $file not found."
        exit 1
    fi
done

echo "✅ All required files found."

# Create a simple test to ensure the game loads
echo "🧪 Testing game files..."

# Check if HTML is valid (basic check)
if grep -q "<!DOCTYPE html>" index.html; then
    echo "✅ HTML structure looks good."
else
    echo "❌ HTML structure issue detected."
    exit 1
fi

# Check if JavaScript files have basic syntax
if node -c game.js 2>/dev/null; then
    echo "✅ game.js syntax is valid."
else
    echo "❌ game.js has syntax errors."
    exit 1
fi

if node -c audio.js 2>/dev/null; then
    echo "✅ audio.js syntax is valid."
else
    echo "❌ audio.js has syntax errors."
    exit 1
fi

if node -c vehicles.js 2>/dev/null; then
    echo "✅ vehicles.js syntax is valid."
else
    echo "❌ vehicles.js has syntax errors."
    exit 1
fi

echo "🚀 Ready to deploy to Netlify!"

# Ask user if they want to deploy
read -p "Do you want to deploy to Netlify now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌐 Deploying to Netlify..."
    
    # Deploy to Netlify
    if netlify deploy --prod; then
        echo "✅ Successfully deployed to Netlify!"
        echo "🎮 Your game is now live on the web!"
        echo "🔗 Check your Netlify dashboard for the live URL."
    else
        echo "❌ Deployment failed. Check the error messages above."
        exit 1
    fi
else
    echo "📦 Project is ready for deployment."
    echo "To deploy manually:"
    echo "1. Go to https://netlify.com"
    echo "2. Drag and drop this folder"
    echo "3. Or use: netlify deploy --prod"
fi

echo "🎉 Deployment script completed!"
