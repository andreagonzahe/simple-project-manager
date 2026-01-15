#!/bin/bash

# Demo Setup Helper Script
# This script helps you set up a demo version of Simple Project Manager

set -e

echo "🎭 Simple Project Manager - Demo Setup"
echo "======================================"
echo ""

# Check if running in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "This script will help you set up a demo version with sample data."
echo ""
echo "You'll need:"
echo "  ✓ A Supabase account (free tier works!)"
echo "  ✓ 5-10 minutes of time"
echo ""

read -p "Ready to continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

# Step 1: Check for .env.local
echo ""
echo "Step 1: Environment Configuration"
echo "===================================="
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists."
    read -p "Overwrite with demo configuration? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp .env.demo.example .env.local
        echo "✓ Created .env.local from demo template"
    else
        echo "⚠️  Keeping existing .env.local - make sure NEXT_PUBLIC_IS_DEMO=true is set"
    fi
else
    cp .env.demo.example .env.local
    echo "✓ Created .env.local from demo template"
fi

# Step 2: Prompt for Supabase credentials
echo ""
echo "Step 2: Supabase Configuration"
echo "===================================="
echo "Create a new Supabase project at: https://supabase.com"
echo ""
read -p "Enter your Supabase Project URL: " supabase_url
read -p "Enter your Supabase Anon Key: " supabase_key

# Update .env.local
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$supabase_url|g" .env.local
    sed -i '' "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabase_key|g" .env.local
else
    # Linux
    sed -i "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$supabase_url|g" .env.local
    sed -i "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabase_key|g" .env.local
fi

echo "✓ Updated .env.local with your credentials"

# Step 3: Install dependencies
echo ""
echo "Step 3: Installing Dependencies"
echo "===================================="
if [ -d "node_modules" ]; then
    echo "⚠️  node_modules already exists, skipping install"
else
    echo "Installing npm packages..."
    npm install
    echo "✓ Dependencies installed"
fi

# Step 4: Database setup instructions
echo ""
echo "Step 4: Database Setup"
echo "===================================="
echo ""
echo "⚠️  IMPORTANT: You need to run the database migrations in Supabase"
echo ""
echo "Follow these steps:"
echo "  1. Go to your Supabase project dashboard"
echo "  2. Navigate to SQL Editor"
echo "  3. Run the following files IN ORDER:"
echo ""
echo "     First, run ALL migrations from supabase/migrations/ in chronological order:"
echo "     - 20260109_project_manager.sql (base schema)"
echo "     - 20260109_simplify_hierarchy.sql"
echo "     - 20260109_add_area_goals.sql"
echo "     - ... (all other 202601XX files in order)"
echo ""
echo "     Then run the demo seed data:"
echo "     - demo_seed_data.sql (realistic demo content)"
echo ""
echo "  4. Verify data loaded: SELECT COUNT(*) FROM areas_of_life;"
echo "     (Should return 5 areas)"
echo ""
read -p "Have you completed the database setup? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "⚠️  Please complete database setup before continuing"
    echo "See DEMO-SETUP-GUIDE.md for detailed instructions"
    exit 0
fi

# Step 5: Test locally
echo ""
echo "Step 5: Local Testing"
echo "===================================="
echo ""
echo "Starting development server..."
echo ""
echo "✓ Setup complete!"
echo ""
echo "The app should open at: http://localhost:3000"
echo ""
echo "You should see:"
echo "  ✓ Demo banner at the top"
echo "  ✓ 5 areas on the homepage"
echo "  ✓ Rich demo data throughout"
echo ""
echo "Next steps:"
echo "  1. Test the demo locally"
echo "  2. Deploy to Vercel (see DEMO-SETUP-GUIDE.md)"
echo "  3. Share your demo URL!"
echo ""

npm run dev
