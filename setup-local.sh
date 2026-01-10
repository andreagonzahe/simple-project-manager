#!/bin/bash

# Andrea's Project Manager - Local Setup Helper
# This script helps you set up and run the project locally

echo "🚀 Andrea's Project Manager - Local Setup"
echo "========================================"
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ Environment file found!"
    echo ""
    echo "📝 Current configuration:"
    echo "------------------------"
    cat .env.local
    echo ""
    echo "------------------------"
    echo ""
    read -p "Do you want to update these credentials? (y/N): " update
    
    if [[ $update =~ ^[Yy]$ ]]; then
        echo ""
        echo "📝 Enter your Supabase credentials:"
        read -p "Project URL (https://xxxxx.supabase.co): " url
        read -p "Anon Key (eyJ...): " key
        
        cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=$url
NEXT_PUBLIC_SUPABASE_ANON_KEY=$key
EOF
        echo ""
        echo "✅ Credentials updated!"
    fi
else
    echo "⚠️  No environment file found!"
    echo ""
    echo "Let's set up your Supabase credentials:"
    echo ""
    echo "1. Go to https://supabase.com and log in"
    echo "2. Create a new project (or select existing)"
    echo "3. Go to Settings → API"
    echo "4. Copy your Project URL and anon/public key"
    echo ""
    read -p "Press Enter when ready to continue..."
    echo ""
    echo "📝 Enter your Supabase credentials:"
    read -p "Project URL (https://xxxxx.supabase.co): " url
    read -p "Anon Key (eyJ...): " key
    
    if [ -z "$url" ] || [ -z "$key" ]; then
        echo ""
        echo "❌ Error: Both URL and Key are required!"
        echo ""
        echo "Don't worry! You can manually create .env.local with:"
        echo ""
        echo "NEXT_PUBLIC_SUPABASE_URL=your_url"
        echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key"
        echo ""
        exit 1
    fi
    
    cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=$url
NEXT_PUBLIC_SUPABASE_ANON_KEY=$key
EOF
    echo ""
    echo "✅ Environment file created!"
fi

echo ""
echo "🔍 Next steps:"
echo "-------------"
echo ""
echo "1. Run the database migration in Supabase:"
echo "   → Go to your Supabase project → SQL Editor"
echo "   → Open: supabase/migrations/20260109_project_manager.sql"
echo "   → Copy all SQL and run it"
echo ""
echo "2. Start the development server:"
echo "   → Run: npm run dev"
echo ""
echo "3. Open in browser:"
echo "   → http://localhost:3000"
echo ""

read -p "Do you want to start the dev server now? (y/N): " start

if [[ $start =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Starting development server..."
    echo ""
    npm run dev
else
    echo ""
    echo "✅ Setup complete! Run 'npm run dev' when ready."
    echo ""
fi
