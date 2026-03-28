#!/bin/bash

# Quick Setup Script for Render Deployment

echo "======================================"
echo "Untitled Phone - Backend Setup"
echo "======================================"
echo ""

# Step 1: Verify Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not installed. Install from https://nodejs.org"
    exit 1
fi

echo "✓ Node.js installed: $(node -v)"
echo ""

# Step 2: Install dependencies
echo "Installing dependencies..."
npm install
echo "✓ Dependencies installed"
echo ""

# Step 3: Create .env file
if [ ! -f .env ]; then
    echo "Creating .env file..."
    echo "SECRET_KEY=change-this-to-a-random-string" > .env
    echo "PORT=3000" >> .env
    echo "✓ .env file created (edit SECRET_KEY)"
else
    echo "✓ .env file already exists"
fi
echo ""

# Step 4: Instructions
echo "======================================"
echo "Next Steps:"
echo "======================================"
echo ""
echo "1. Local Testing:"
echo "   npm start"
echo "   Then open http://localhost:3000"
echo ""
echo "2. Deploy to Render:"
echo "   a) Push to GitHub"
echo "   b) Go to https://render.com"
echo "   c) Create Web Service from this repo"
echo "   d) Add SECRET_KEY environment variable"
echo ""
echo "3. Update Frontend:"
echo "   In auth.js, set:"
echo "   const API_BASE_URL = 'https://your-render-url.onrender.com';"
echo ""
echo "======================================"
