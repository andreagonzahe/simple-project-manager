# 🎭 Demo Version Setup Guide

This guide will help you set up a public demo version of the Simple Project Manager with realistic sample data. Perfect for showcasing your project to potential users or on your portfolio!

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Setup (5 minutes)](#quick-setup)
3. [Detailed Setup](#detailed-setup)
4. [Configuration Options](#configuration-options)
5. [Deployment](#deployment)
6. [Maintenance](#maintenance)

---

## 🎯 Overview

The demo version includes:

- ✨ **Pre-populated realistic data** across 5 life areas
- 🎨 **All features enabled** (recurring tasks, reminders, goals, etc.)
- 🚀 **Fully functional** - users can interact with everything
- 🎭 **Demo banner** - clearly indicates it's a demo
- 🔄 **Optional data persistence** - choose whether changes persist
- 🎪 **Zero authentication** - anyone can access immediately

### What's Included in Demo Data:

- **5 Areas**: Career, Health & Fitness, Personal Projects, Home & Garden, Learning
- **12 Domains**: SaaS Product, Freelance Clients, Fitness Routine, Blog, etc.
- **12 Projects (Subdomains)**: User Authentication, Dashboard, Kitchen Remodel, etc.
- **14 Features**: OAuth Integration, Analytics Charts, etc.
- **6 Bugs**: Login issues, chart loading problems, etc.
- **16 Tasks**: Workouts, language practice, blog posts, etc.
- **23 Subtasks**: Breaking down complex features and bugs

---

## ⚡ Quick Setup

### Option A: Fresh Demo Database (Recommended)

1. **Create a new Supabase project** (separate from your personal one):
   - Go to [supabase.com](https://supabase.com)
   - Click "New project"
   - Name it: `simple-pm-demo` or similar
   - Wait for initialization

2. **Run all migrations in order**:
   ```bash
   # In Supabase SQL Editor, run these files in order:
   
   # 1. Base schema
   supabase/migrations/20260109_project_manager.sql
   
   # 2. All feature migrations (in chronological order)
   supabase/migrations/20260109_simplify_hierarchy.sql
   supabase/migrations/20260109_add_area_goals.sql
   supabase/migrations/20260109_add_domain_goals.sql
   supabase/migrations/20260109_add_do_dates.sql
   supabase/migrations/20260109_add_due_dates.sql
   supabase/migrations/20260110_add_area_description.sql
   supabase/migrations/20260110_add_domain_status.sql
   supabase/migrations/20260110_optional_projects.sql
   supabase/migrations/20260110_reminders.sql
   supabase/migrations/20260110_add_reminder_due_date.sql
   supabase/migrations/20260112_add_recurring_tasks.sql
   supabase/migrations/20260112_rename_domains_to_projects.sql
   supabase/migrations/20260113_daily_flow.sql
   supabase/migrations/20260113_add_commitment_level.sql
   supabase/migrations/20260114_set_optional_default.sql
   
   # 3. Demo seed data
   supabase/migrations/demo_seed_data.sql
   ```

3. **Create `.env.local` file**:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-demo-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-demo-anon-key
   NEXT_PUBLIC_IS_DEMO=true
   ```

4. **Deploy to Vercel**:
   - Push code to GitHub
   - Import to Vercel
   - Add environment variables
   - Deploy!

---

## 📚 Detailed Setup

### Step 1: Prepare Your Repository

If you want to keep demo and production separate:

```bash
# Option A: Create a demo branch
git checkout -b demo
git push origin demo

# Option B: Create a separate repository
# (fork or duplicate your repo)
```

### Step 2: Configure Demo Mode

The demo banner will automatically show when `NEXT_PUBLIC_IS_DEMO=true` is set.

Update your environment variables:

```bash
# .env.local (for local testing)
NEXT_PUBLIC_SUPABASE_URL=https://your-demo-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-demo-anon-key
NEXT_PUBLIC_IS_DEMO=true
```

### Step 3: Add Demo Banner to Layout

Open `app/layout.tsx` and add the demo banner:

```typescript
import DemoBanner from '@/app/components/ui/DemoBanner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDemo = process.env.NEXT_PUBLIC_IS_DEMO === 'true';

  return (
    <html lang="en">
      <body>
        {isDemo && <DemoBanner />}
        {children}
      </body>
    </html>
  );
}
```

### Step 4: Set Up Supabase Demo Project

#### 4.1 Create Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project: `simple-pm-demo`
3. Choose region closest to your target audience
4. Set a strong database password (save it!)

#### 4.2 Run Migrations

In the Supabase SQL Editor:

1. **Run base schema** (`20260109_project_manager.sql`)
   - Creates all tables, types, triggers
   - Adds basic sample data (5 areas, 2 domains, 2 projects)

2. **Run all feature migrations** (in order by date)
   - Each adds a new feature (goals, reminders, recurring tasks, etc.)
   - Run them one by one

3. **Run demo seed data** (`demo_seed_data.sql`)
   - Adds comprehensive realistic demo content
   - Showcases all features

#### 4.3 Verify Data

In Supabase Table Editor:

```sql
-- Check areas
SELECT name FROM areas_of_life ORDER BY sort_order;

-- Check domains
SELECT d.name, a.name as area
FROM domains d
JOIN areas_of_life a ON d.area_id = a.id;

-- Check items
SELECT COUNT(*) as features FROM features;
SELECT COUNT(*) as bugs FROM bugs;
SELECT COUNT(*) as tasks FROM tasks;
```

You should see:
- 5 areas
- 12 domains
- 12 projects (subdomains)
- 14 features
- 6 bugs
- 16 tasks

### Step 5: Test Locally

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Open http://localhost:3000
# You should see:
# - Demo banner at top
# - 5 areas on homepage
# - Rich demo data throughout
```

### Step 6: Deploy to Production

#### Deploy to Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Set up demo version"
   git push origin demo  # or main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Choose the `demo` branch (if you created one)

3. **Configure Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-demo-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-demo-anon-key
   NEXT_PUBLIC_IS_DEMO=true
   ```

4. **Deploy**!
   - Click "Deploy"
   - Wait 2-3 minutes
   - Get your demo URL: `your-project.vercel.app`

#### Other Platforms

- **Netlify**: Similar process, add env vars in site settings
- **Railway**: Connect GitHub, add env vars, deploy
- **Render**: Use "Static Site", add env vars

---

## ⚙️ Configuration Options

### Option 1: Read-Only Demo

To prevent users from modifying data, update Supabase RLS policies:

```sql
-- Make all tables read-only
DROP POLICY IF EXISTS "Enable all operations for everyone" ON areas_of_life;
CREATE POLICY "Enable read access for everyone" ON areas_of_life FOR SELECT USING (true);

-- Repeat for all tables: domains, subdomains, features, bugs, tasks, subtasks
```

**Pros**: Data stays pristine
**Cons**: Users can't test full functionality

### Option 2: Session-Based Demo

Allow changes but reset on page refresh (requires more setup):

1. Use Supabase Edge Functions to reset data
2. Or implement client-side state management
3. Or accept that changes persist

### Option 3: Full Demo (Recommended)

Let users make changes - data persists:

**Pros**: 
- Users can fully test features
- Shows real-world usage
- Zero maintenance

**Cons**:
- Demo data gets messy over time
- Need to occasionally reset

**How to Reset Demo Data**:

```bash
# In Supabase SQL Editor, delete all data:
DELETE FROM subtasks;
DELETE FROM tasks;
DELETE FROM bugs;
DELETE FROM features;
DELETE FROM subdomains;
DELETE FROM domains;
DELETE FROM areas_of_life;

# Then re-run:
# supabase/migrations/demo_seed_data.sql
```

---

## 🚀 Deployment

### Custom Domain

1. **Buy a domain**: `yourdomain.com` or `demo.yourdomain.com`
2. **Add to Vercel**:
   - Go to Project Settings → Domains
   - Add your domain
   - Update DNS records (Vercel provides instructions)
3. **SSL**: Automatic with Vercel

### Update Demo Banner

Edit `app/components/ui/DemoBanner.tsx` to point to your repo:

```typescript
<a
  href="https://github.com/YOUR-USERNAME/simple-project-manager"
  target="_blank"
  rel="noopener noreferrer"
  // ...
>
  Get Your Own
</a>
```

### Analytics (Optional)

Add Vercel Analytics or Google Analytics to track demo usage:

```bash
npm install @vercel/analytics

# In app/layout.tsx:
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 🔧 Maintenance

### Resetting Demo Data (Monthly)

```bash
# 1. Backup first (optional)
# In Supabase, go to Database → Backups

# 2. Clear all data
# Run in SQL Editor:
DELETE FROM subtasks;
DELETE FROM tasks;
DELETE FROM bugs;
DELETE FROM features;
DELETE FROM subdomains;
DELETE FROM domains;
DELETE FROM areas_of_life;

# 3. Re-run seed data
# Copy and paste demo_seed_data.sql
```

### Monitoring

Keep an eye on:
- **Supabase usage**: Free tier has limits (500MB database, 50MB file storage)
- **Vercel bandwidth**: Free tier is generous but monitor if traffic grows
- **Database size**: Demo should stay under 50MB easily

### Updating Demo

When you add new features:

1. Update your production version first
2. Test thoroughly
3. Update demo branch/repo
4. Add new demo data if relevant
5. Redeploy demo

---

## 🎨 Customization

### Custom Demo Data

Edit `supabase/migrations/demo_seed_data.sql`:

```sql
-- Add your own areas
INSERT INTO areas_of_life (id, name, color, icon, sort_order) VALUES
    ('custom-id', 'Your Area', '#FF6B9D', 'YourIcon', 6);

-- Add your own projects
-- Add your own tasks
-- etc.
```

### Branding

1. **Update README** with demo link
2. **Add to portfolio** with screenshots
3. **Create demo video** showing features
4. **Tweet about it** with demo link

### Demo Banner Variations

Show different messages:

```typescript
// Show a trial CTA
<p>Try it free for 7 days! No credit card required.</p>

// Show a waitlist
<p>Join the waitlist for early access!</p>

// Show feature highlights
<p>Now with recurring tasks and smart reminders!</p>
```

---

## 📊 Success Metrics

Track these to measure demo success:

- **Visitors**: How many people view the demo
- **Engagement**: Time spent, pages viewed
- **Actions**: Items created, tasks completed
- **Conversions**: "Get Your Own" clicks
- **Sign-ups**: If you add a waitlist

---

## 🤝 Sharing Your Demo

### On GitHub README

```markdown
## 🎭 [View Live Demo](https://your-demo.vercel.app)

Try out all features with realistic sample data!
```

### On Twitter/X

```
Just launched a demo of my project manager! 

✨ Beautiful girly UI
📊 Full task management
🎯 Smart organization
🔄 Recurring tasks

Try it: https://your-demo.vercel.app

Built with #NextJS #TypeScript #Supabase
```

### On Portfolio

```html
<div class="project">
  <h3>Simple Project Manager</h3>
  <p>A beautiful, full-featured task management system</p>
  <a href="https://your-demo.vercel.app">View Demo</a>
  <a href="https://github.com/you/repo">View Code</a>
</div>
```

---

## ❓ Troubleshooting

### Demo Banner Not Showing

Check:
1. `NEXT_PUBLIC_IS_DEMO=true` in environment variables
2. Demo banner is imported in `app/layout.tsx`
3. Clear browser cache and reload

### No Data Showing

Check:
1. Supabase credentials are correct
2. All migrations were run in order
3. `demo_seed_data.sql` was run successfully
4. RLS policies allow SELECT operations

### Slow Performance

Check:
1. Indexes exist (they should from migrations)
2. Supabase project is not paused (free tier pauses after 7 days inactivity)
3. Too many requests (upgrade Supabase tier if needed)

### Demo Data Got Messy

Reset it:
1. Run DELETE statements (see Maintenance section)
2. Re-run `demo_seed_data.sql`
3. Takes 2 minutes

---

## 🎉 Next Steps

Once your demo is live:

1. ✅ **Test thoroughly** - click through all features
2. ✅ **Share on social media** - get feedback
3. ✅ **Add to portfolio** - showcase your work
4. ✅ **Monitor usage** - see what people interact with most
5. ✅ **Iterate** - improve based on feedback

---

## 📝 Checklist

Before launching demo:

- [ ] Supabase demo project created
- [ ] All migrations run successfully
- [ ] Demo seed data loaded
- [ ] Environment variables configured
- [ ] Demo banner shows and works
- [ ] Tested locally (`npm run dev`)
- [ ] Deployed to Vercel/hosting platform
- [ ] Custom domain configured (optional)
- [ ] "Get Your Own" link points to your repo
- [ ] README updated with demo link
- [ ] Tested on mobile devices
- [ ] Shared on social media

---

## 🌟 Pro Tips

1. **Keep demo data relatable**: Use examples people understand (fitness, projects, etc.)
2. **Show variety**: Include all statuses, priorities, severities
3. **Add personality**: Make descriptions fun and realistic
4. **Update regularly**: Keep demo data fresh and current
5. **Monitor feedback**: Pay attention to how users interact
6. **A/B test**: Try different messaging in demo banner
7. **Add analytics**: Track what features get used most

---

## 🎯 Conversion Strategies

To turn demo users into real users:

1. **Clear CTA**: Make "Get Your Own" prominent
2. **Show benefits**: Highlight features in banner
3. **Create urgency**: "Limited spots available"
4. **Reduce friction**: Make setup look easy (link to Quick Start)
5. **Capture interest**: Add waitlist or newsletter signup
6. **Follow up**: Email users with tips and updates

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Main README](./README.md)
- [Quick Start Guide](./QUICK-START.md)

---

**Made with ❤️ - Happy demoing!** 🎭

Questions? Issues? Open an issue on GitHub or reach out!
