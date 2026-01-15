# 🔧 Demo Database Schema Fix Guide

Your demo database has schema mismatches that prevent data from displaying. This guide will fix that!

## 🎯 The Problem

Your demo database was missing columns and had incorrect enum values because migrations were run out of order. The frontend code expects certain columns (like `commitment_level`, `is_recurring`, etc.) that don't exist in your current demo database.

## ✅ The Solution

Run a complete schema setup script that creates everything from scratch with all the correct columns.

---

## 📋 Step-by-Step Instructions

### **Step 1: Open Your DEMO Supabase Project**

1. Go to [supabase.com](https://supabase.com/dashboard)
2. Select your **DEMO** project (not your personal one!)
3. Click **SQL Editor** in the left sidebar

### **Step 2: Run the Complete Setup Script**

1. Click **New Query** button
2. Copy the ENTIRE contents of `supabase/migrations/DEMO_COMPLETE_SETUP.sql`
3. Paste it into the SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. Wait for it to complete (should take ~2 seconds)
6. You should see "Success. No rows returned"

### **Step 3: Run the Demo Seed Data**

1. Click **New Query** button again
2. Copy the ENTIRE contents of `supabase/migrations/demo_seed_data.sql`
3. Paste it into the SQL Editor
4. Click **Run**
5. You should see "Success. No rows returned"

### **Step 4: Verify the Data**

1. In Supabase, click **Table Editor** in the left sidebar
2. Check these tables have data:
   - `areas_of_life` - should have 5 rows
   - `projects` - should have 12 rows
   - `features` - should have 14 rows
   - `bugs` - should have 6 rows
   - `tasks` - should have 16 rows

### **Step 5: Test Your Demo**

1. Go to your demo URL (e.g., `https://simple-pm-demo.vercel.app`)
2. The page should load with data
3. You should see:
   - 5 areas (Career, Housing, Health, Immigration, Personal)
   - Multiple projects under each area
   - Tasks, bugs, and features
   - No 400 errors in the browser console

---

## 🐛 Troubleshooting

### Problem: "ERROR: relation already exists"
**Solution:** The script drops everything first, so this shouldn't happen. But if it does:
1. Go to **Database** → **Tables** in Supabase
2. Manually delete all tables
3. Run the script again

### Problem: "ERROR: type already exists"
**Solution:** Run this first to clean up:
```sql
DROP TYPE IF EXISTS commitment_level CASCADE;
DROP TYPE IF EXISTS domain_status CASCADE;
DROP TYPE IF EXISTS item_status CASCADE;
DROP TYPE IF EXISTS item_priority CASCADE;
DROP TYPE IF EXISTS bug_severity CASCADE;
```

### Problem: Still seeing 400 errors
**Solution:**
1. Open browser console (F12)
2. Look for the specific error message
3. Check that your Vercel environment variables are correct:
   - `NEXT_PUBLIC_SUPABASE_URL` points to DEMO database
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` is from DEMO database
   - `NEXT_PUBLIC_IS_DEMO=true`

### Problem: Data inserted but not showing
**Solution:** Clear your browser cache and hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

---

## 📊 What This Script Does

The `DEMO_COMPLETE_SETUP.sql` script:

1. **Drops everything** - Clean slate
2. **Creates all enums** with correct values:
   - `item_status`: backlog, in_progress, completed
   - `domain_status`: planning, active, paused, completed
   - `commitment_level`: must_do, optional
3. **Creates all tables** with ALL columns the code expects:
   - `areas_of_life` (with goals)
   - `projects` (with status, goal)
   - `features`, `bugs`, `tasks` (with commitment_level, recurring fields, dates)
   - `reminders` (with due_date)
   - `daily_flow_completions`
4. **Creates all indexes** for performance
5. **Sets up triggers** for updated_at timestamps
6. **Enables RLS** with open policies for demo use

---

## ✨ After This Works

Once your demo is working:

1. **Test thoroughly** - Click around, make sure everything works
2. **Share the demo URL** - It's ready for the public!
3. **Keep separate databases** - Your personal DB and demo DB stay independent

---

## 🚀 Need Help?

If you're still stuck:
1. Check the browser console for specific error messages
2. Check the Supabase logs: **Logs** → **API** in the left sidebar
3. Verify your Vercel environment variables match your demo database

Good luck! 🎉
