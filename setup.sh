#!/bin/bash

# Shnayim Mikra Tracker - Automated Setup Script
# This script will install dependencies, setup the database, and start the app

set -e  # Exit on any error

echo "🕎 Shnayim Mikra Tracker - Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Setup database
echo "🗄️  Setting up database..."
npm run db:push
echo ""

echo "🌱 Seeding database with Parshat Bereishit..."
npm run db:seed
echo ""

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the app, run:"
echo ""
echo "   npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser."
echo ""
