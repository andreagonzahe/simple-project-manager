# 🚀 ONE-CLICK DEMO SETUP

## Instructions

1. Open your **DEMO** Supabase project at [supabase.com](https://supabase.com/dashboard)
2. Click **SQL Editor** in the sidebar
3. Click **New Query**
4. Copy/paste the **ENTIRE** file: `supabase/migrations/DEMO_ONE_CLICK_SETUP.sql`
5. Click **Run** (or Cmd/Ctrl + Enter)
6. Wait ~3 seconds
7. Done! Visit your demo URL

## What You Get

- ✅ Complete database schema (all tables, indexes, triggers)
- ✅ 5 Areas of Life (Career, Health, Personal, Home, Learning)
- ✅ 12 Projects across different areas
- ✅ 14 Features showing various work
- ✅ 6 Bugs with different severities
- ✅ 22 Tasks with realistic scenarios
- ✅ **43 total items** to showcase your app!

## Verify It Worked

In Supabase, click **Table Editor** and check:
- `areas_of_life` → 5 rows
- `projects` → 12 rows
- `features` → 14 rows
- `bugs` → 6 rows
- `tasks` → 22 rows

Then visit your demo URL - you should see all the data!

## If Something Goes Wrong

**Error: "relation already exists"**
- Your tables already exist from before
- The script drops everything first, so this shouldn't happen
- If it does: manually delete all tables in Database → Tables, then run again

**Still see 400 errors in browser:**
1. Check Vercel environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your DEMO database URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your DEMO anon key
   - `NEXT_PUBLIC_IS_DEMO=true`
2. Redeploy in Vercel after setting variables
3. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)

That's it! 🎉
