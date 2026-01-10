# 🚀 Quick Start Guide

Get Andrea's Project Manager running in 5 minutes!

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ A Supabase account (free tier works great!)

---

## Step 1: Supabase Setup (2 minutes)

### 1.1 Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New project"**
4. Choose organization, name, database password, and region
5. Wait for project to initialize (~2 minutes)

### 1.2 Get Your Credentials
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### 1.3 Run Database Migration
1. Go to **SQL Editor** in your Supabase dashboard
2. Open the file: `supabase/migrations/20260109_project_manager.sql`
3. Copy ALL the SQL code
4. Paste into Supabase SQL Editor
5. Click **"Run"** (bottom right)
6. You should see: **"Success. No rows returned"**

✅ Database is ready!

---

## Step 2: Project Setup (1 minute)

### 2.1 Install Dependencies
```bash
cd /Users/andreagonzalezh/Desktop/simple-project-manager
npm install
```

### 2.2 Configure Environment
Create `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Replace with YOUR actual credentials from Step 1.2!

---

## Step 3: Run the App (30 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🎉 You should see:

1. **Simple Project Manager** homepage
2. **5 default areas**: Career, Housing, Health, Immigration, Personal
3. **2 sample domains** under Career: Sparken, Freelancing
4. **2 sample projects** under Sparken: Neuromarketing, Client Portal

---

## 🎯 Try It Out!

### Create Your First Feature
1. Click on **"Career"** area
2. Click on **"Sparken"** domain
3. Click on **"Client Portal"** project
4. You'll see tabs: **Features | Bugs | Tasks**
5. Click **"Add Feature"** button
6. Fill in:
   - Title: "User Authentication"
   - Description: "Add login and signup forms"
   - Status: "In Progress"
   - Priority: "High"
7. Click **"Create Feature"**
8. Click on the new feature card
9. Click **"Add Subtask"**
10. Add: "Create login form"
11. See your subtask appear!

---

## 🎨 Customize Your Areas

### Add a New Area
1. Go to homepage (`/`)
2. Click **"Add Area"** button
3. Enter:
   - Name: "Fitness"
   - Choose a color (e.g., green)
   - Icon: "Dumbbell" (optional)
4. Click **"Create Area"**
5. See your new area card!

### Browse Icons
Visit [lucide.dev](https://lucide.dev) to find icon names like:
- Briefcase, Home, Heart, Plane, User
- Dumbbell, Book, Camera, Music, Code
- And 1000+ more!

---

## 🔍 Explore Features

### Sorting
- Click **"Sort by"** dropdown
- Choose: Status, Priority, Date Started, etc.
- Toggle ascending/descending with arrow button

### Filtering
- Click **"Filter"** button
- Check status filters: Backlog, In Progress, Completed
- Check priority filters: Low, Medium, High
- See filtered results instantly

### Navigation
- Use **breadcrumbs** at top to jump between levels
- Click **back arrow** buttons for previous page
- Or use browser back button

---

## 🐛 Troubleshooting

### "Failed to load areas" error
**Fix**: Check your `.env.local` file has correct Supabase credentials

### Database connection issues
**Fix**: 
1. Verify Supabase project is active (not paused)
2. Check credentials are correct in `.env.local`
3. Make sure migration was run successfully

### Build errors
**Fix**:
```bash
# Clean and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

### Can't find icons
**Fix**: Icons use Lucide React. Visit [lucide.dev](https://lucide.dev) and use exact PascalCase names (e.g., `Briefcase`, not `briefcase`)

---

## 📱 Mobile Testing

1. Find your local IP: `ipconfig getifaddr en0` (Mac) or `ipconfig` (Windows)
2. Update Next.js to allow external connections:
   ```bash
   npm run dev -- -H 0.0.0.0
   ```
3. Open `http://YOUR-IP:3000` on your phone
4. Test touch interactions!

---

## 🚀 Deploy to Production

When ready to deploy:

1. Push code to GitHub
2. Follow instructions in `DEPLOYMENT.md`
3. Deploy to Vercel (recommended) in 5 minutes
4. Add environment variables in Vercel dashboard
5. Done! Share your URL

---

## 💡 Tips for Best Experience

1. **Start Small**: Create 1-2 areas first, then expand
2. **Use Colors**: Assign unique colors to easily identify areas
3. **Add Icons**: Visual cues help quick navigation
4. **Break Down Work**: Use subtasks for big features/bugs
5. **Update Status**: Keep status current for accurate tracking
6. **Filter Smart**: Use filters to focus on what matters now

---

## 🎓 Next Steps

Once comfortable with basics:

1. **Customize colors**: Match your personal brand
2. **Add more areas**: Organize different life aspects
3. **Create domains**: Group related projects
4. **Track progress**: Use status and priority consistently
5. **Deploy online**: Access from anywhere!

---

## 📚 Documentation

- **Full Documentation**: See `README.md`
- **Deployment Guide**: See `DEPLOYMENT.md`
- **Project Status**: See `PROJECT-COMPLETE.md`

---

## ✅ Checklist

Before you start using:

- [ ] Supabase project created
- [ ] Database migration run successfully
- [ ] `.env.local` file configured
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server running (`npm run dev`)
- [ ] Opened [http://localhost:3000](http://localhost:3000)
- [ ] Saw 5 default areas
- [ ] Created your first item

---

## 🎉 Ready to Go!

You're all set! Start organizing your projects and enjoy your new Simple Project Manager.

**Questions?** Check the full README.md or documentation.

**Happy organizing!** 🚀

---

**Made with ❤️ for personal project management**
