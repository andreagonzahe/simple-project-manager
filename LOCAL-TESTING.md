# 🖥️ View Locally - Complete Guide
## Andrea's Project Manager

## Step 1: Set Up Supabase (One-Time Setup)

### Option A: Use Existing Supabase Project (If you have one)
1. Go to [supabase.com](https://supabase.com) and log in
2. Select your project OR create a new one
3. Go to **Settings** → **API**
4. Copy your credentials

### Option B: Create New Supabase Project (5 minutes)
1. Go to [supabase.com](https://supabase.com)
2. Click **"New project"**
3. Fill in:
   - **Name**: simple-project-manager (or any name)
   - **Database Password**: (create a strong password)
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. Wait ~2 minutes for setup
6. Go to **Settings** → **API**
7. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJ...` (long string)

---

## Step 2: Run Database Migration

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open this file in a text editor:
   ```
   /Users/andreagonzalezh/Desktop/simple-project-manager/supabase/migrations/20260109_project_manager.sql
   ```
4. Copy ALL the SQL code (Cmd+A, Cmd+C)
5. Paste into Supabase SQL Editor (Cmd+V)
6. Click **"Run"** button (bottom right)
7. Wait for success message: ✅ "Success. No rows returned"

**This creates:**
- 7 database tables
- Sample data (5 areas, 2 domains, 2 projects)
- All necessary indexes and security policies

---

## Step 3: Configure Environment Variables

Create a file named `.env.local` in the project root:

```bash
cd /Users/andreagonzalezh/Desktop/simple-project-manager
touch .env.local
```

Then add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-step-1
```

**Replace with your actual values from Step 1!**

---

## Step 4: Start Development Server

```bash
cd /Users/andreagonzalezh/Desktop/simple-project-manager
npm run dev
```

You should see:
```
▲ Next.js 16.1.1
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Starting...
✓ Ready in 2.5s
```

---

## Step 5: Open in Browser

Open your browser and go to:

**http://localhost:3000**

---

## 🎉 What You Should See

### Homepage (Areas Dashboard)
- **5 colored area cards**: Career, Housing, Health, Immigration, Personal
- **Statistics bar**: Total Areas (5), Total Domains (2), Total Items (0)
- **"Add Area"** button in top right

### Try These Actions:

#### 1. Navigate the Hierarchy
- Click **"Career"** → See 2 domains (Sparken, Freelancing)
- Click **"Sparken"** → See 2 projects (Neuromarketing, Client Portal)
- Click **"Client Portal"** → See tabs (Features, Bugs, Tasks)

#### 2. Create Your First Feature
- On the Features tab, click **"Add Feature"**
- Fill in:
  - **Title**: "User Authentication"
  - **Description**: "Add login system"
  - **Status**: In Progress
  - **Priority**: High
- Click **"Create Feature"**
- See your new feature card appear!

#### 3. Add Subtasks
- Click on your new feature card
- Click **"Add Subtask"**
- Enter: "Create login form"
- Press Enter or click "Add Subtask"
- See subtask appear!

#### 4. Test Filtering & Sorting
- Go back to Features list
- Click **"Sort by"** → Try different options
- Click **"Filter"** → Select statuses and priorities
- See real-time filtering!

---

## 🔧 Troubleshooting

### Error: "Failed to load areas"
**Problem**: Environment variables not set correctly

**Solution**:
1. Check `.env.local` file exists in project root
2. Verify it has correct Supabase URL and key
3. Restart dev server: Stop (Ctrl+C) and run `npm run dev` again

### Error: "Missing Supabase environment variables"
**Problem**: `.env.local` not found or has wrong format

**Solution**:
```bash
cd /Users/andreagonzalezh/Desktop/simple-project-manager
cat .env.local  # Check if file exists and has content
```

Should show:
```
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Empty page or "No areas yet"
**Problem**: Database migration not run or sample data missing

**Solution**:
1. Go to Supabase → **Table Editor**
2. Check if `areas_of_life` table exists and has 5 rows
3. If empty, re-run the migration SQL file

### Port 3000 already in use
**Problem**: Another app is using port 3000

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
# Then open http://localhost:3001
```

### Build errors after changes
**Solution**:
```bash
# Clean cache and rebuild
rm -rf .next
npm run dev
```

---

## 🧪 Testing Checklist

Before deploying, test these features:

- [ ] Homepage loads with 5 areas
- [ ] Click through: Area → Domain → Project
- [ ] Create a new area (custom name and color)
- [ ] Create a new feature in a project
- [ ] Add a subtask to a feature
- [ ] Use sorting (Status, Priority, etc.)
- [ ] Use filtering (multiple filters at once)
- [ ] Switch between tabs (Features, Bugs, Tasks)
- [ ] Test breadcrumb navigation
- [ ] Test back buttons
- [ ] Try on mobile (if possible)
- [ ] Check toast notifications appear
- [ ] Verify empty states show when appropriate

---

## 📱 View on Mobile (Same Network)

To test on your phone while on same WiFi:

1. Find your computer's IP address:
   ```bash
   # Mac
   ipconfig getifaddr en0
   
   # Windows
   ipconfig
   ```

2. Start dev server with external access:
   ```bash
   npm run dev -- -H 0.0.0.0
   ```

3. On your phone, open:
   ```
   http://YOUR-IP-ADDRESS:3000
   ```
   Example: `http://192.168.1.100:3000`

---

## ⚡ Quick Commands Reference

```bash
# Start development server
npm run dev

# Stop server
Ctrl + C

# Build for production (test before deploying)
npm run build

# Start production server
npm start

# Clean build cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules && npm install
```

---

## 🎨 Customization While Testing

### Change Colors
- Click "Add Area" → Choose from 8 colors
- Or edit areas in Supabase Table Editor

### Add Icons
- Visit [lucide.dev](https://lucide.dev)
- Find icon name (e.g., "Briefcase", "Heart")
- Use exact PascalCase name when creating areas

### Sample Data
- Pre-loaded: 5 areas, 2 domains, 2 projects
- Add more through the UI
- Or insert via Supabase Table Editor

---

## 🚀 Next Steps

Once everything works locally:

1. **Ready to deploy?** → See `DEPLOYMENT.md`
2. **Need help?** → Check `README.md`
3. **Quick reference?** → See `QUICK-START.md`

---

## 💡 Pro Tips

1. **Keep dev server running** while making changes - hot reload works!
2. **Check browser console** (F12) for any errors
3. **Use Supabase Table Editor** to view/edit data directly
4. **Test on mobile** before deploying
5. **Clear browser cache** if styles don't update (Cmd+Shift+R)

---

## ✅ You're Ready When...

- [ ] Homepage loads with areas
- [ ] Can navigate through all levels
- [ ] Can create areas, domains, projects
- [ ] Can add features/bugs/tasks
- [ ] Filtering and sorting work
- [ ] No console errors
- [ ] Looks good on mobile (if tested)

---

**Happy testing! Your Simple Project Manager is ready to use locally.** 🎉

Need help? All documentation is in the project folder.
