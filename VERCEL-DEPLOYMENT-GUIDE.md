# 🚀 Deployment Guide - Vercel with Password Protection

## ✅ What's Been Completed

- ✅ All code committed to Git
- ✅ TypeScript errors fixed
- ✅ Project ready to deploy
- ✅ Delete functionality for projects added

---

## 📋 Pre-Deployment Checklist

### 1. Run Database Migrations in Supabase

Go to **Supabase SQL Editor** and run these migrations in order:

#### Migration 1: Main Schema
File: `supabase/migrations/20260109_project_manager.sql`

#### Migration 2: Hierarchy Simplification
```sql
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS domain_id UUID REFERENCES domains(id) ON DELETE CASCADE;
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS domain_id UUID REFERENCES domains(id) ON DELETE CASCADE;
ALTER TABLE features ADD COLUMN IF NOT EXISTS domain_id UUID REFERENCES domains(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_tasks_domain_id ON tasks(domain_id);
CREATE INDEX IF NOT EXISTS idx_bugs_domain_id ON bugs(domain_id);
CREATE INDEX IF NOT EXISTS idx_features_domain_id ON features(domain_id);

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_subdomain_id_fkey;
ALTER TABLE bugs DROP CONSTRAINT IF EXISTS bugs_subdomain_id_fkey;
ALTER TABLE features DROP CONSTRAINT IF EXISTS features_subdomain_id_fkey;

ALTER TABLE tasks DROP COLUMN IF EXISTS subdomain_id;
ALTER TABLE bugs DROP COLUMN IF EXISTS subdomain_id;
ALTER TABLE features DROP COLUMN IF EXISTS subdomain_id;

DROP TABLE IF EXISTS subdomains CASCADE;
DROP TABLE IF EXISTS subtasks CASCADE;
```

#### Migration 3: Due Dates
```sql
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE features ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS due_date DATE;

CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_features_due_date ON features(due_date);
CREATE INDEX IF NOT EXISTS idx_bugs_due_date ON bugs(due_date);
```

#### Migration 4: Do Dates
```sql
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS do_date DATE;
ALTER TABLE features ADD COLUMN IF NOT EXISTS do_date DATE;
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS do_date DATE;

CREATE INDEX IF NOT EXISTS idx_tasks_do_date ON tasks(do_date);
CREATE INDEX IF NOT EXISTS idx_features_do_date ON features(do_date);
CREATE INDEX IF NOT EXISTS idx_bugs_do_date ON bugs(do_date);
```

#### Migration 5: Area Goals
```sql
ALTER TABLE areas_of_life ADD COLUMN IF NOT EXISTS goals JSONB DEFAULT '[]'::jsonb;
CREATE INDEX IF NOT EXISTS idx_areas_of_life_goals ON areas_of_life USING GIN (goals);
```

#### Migration 6: Project Goals
```sql
ALTER TABLE domains ADD COLUMN IF NOT EXISTS goals JSONB DEFAULT '[]'::jsonb;
CREATE INDEX IF NOT EXISTS idx_domains_goals ON domains USING GIN (goals);
```

### 2. Create GitHub Repository (if not done)

```bash
# If you haven't created a GitHub repo yet:
gh repo create simple-project-manager --public --source=. --remote=origin
```

### 3. Push to GitHub

```bash
cd /Users/andreagonzalezh/Desktop/simple-project-manager
git push -u origin main
```

---

## 🔐 Deploy to Vercel with Password Protection

### Step 1: Install Vercel CLI (Optional)
```bash
npm i -g vercel
```

### Step 2: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com
2. **Click "Add New"** → "Project"
3. **Import your GitHub repository**
4. **Configure Project**:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

### Step 3: Add Environment Variables

In Vercel Project Settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://xbsecvuveadhdklrynkc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhic2VjdnV2ZWFkaGRrbHJ5bmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MjIzMTUsImV4cCI6MjA4MzQ5ODMxNX0.BygZJ_MHGsuvW9GSbLMQLwd1E88hgg8OiYvHB8khkz4
```

### Step 4: Enable Password Protection

#### Option 1: Vercel Standard Protection
1. Go to Project Settings → **Deployment Protection**
2. Enable **Vercel Authentication**
3. Choose "Password Protection"
4. Set a password
5. Click Save

#### Option 2: Custom Middleware (More Control)

Create `middleware.ts` in the root:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const basicAuth = request.headers.get('authorization');
  const url = request.nextUrl;

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    // Replace with your desired credentials
    if (user === 'admin' && pwd === 'your-secure-password') {
      return NextResponse.next();
    }
  }

  url.pathname = '/api/auth';

  return NextResponse.rewrite(url, {
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
    status: 401,
  });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Step 5: Deploy

Click **"Deploy"** and wait for build to complete (~2-3 minutes)

---

## 🎉 Post-Deployment

### Your App Will Be Available At:
```
https://simple-project-manager-[random].vercel.app
```

### Custom Domain (Optional):
1. Go to Project Settings → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

---

## 🔧 Update Deployment

Every time you push to `main`, Vercel will automatically redeploy:

```bash
git add .
git commit -m "Update features"
git push origin main
```

---

## 🛡️ Security Notes

- ✅ Supabase credentials are safe (client-side keys)
- ✅ RLS (Row Level Security) should be configured in Supabase
- ✅ Password protection prevents unauthorized access
- ⚠️ Don't commit sensitive passwords to git

---

## 📱 Testing Password Protection

1. Visit your deployed URL
2. Browser will prompt for password
3. Enter credentials
4. Access granted ✅

---

## 🆘 Troubleshooting

### Build Fails
- Check Vercel build logs
- Verify all environment variables are set
- Ensure migrations ran successfully in Supabase

### Can't Connect to Database
- Verify Supabase URL and key are correct
- Check Supabase project is running
- Test connection locally first

### Password Protection Not Working
- Ensure you saved Deployment Protection settings
- Clear browser cache and try again
- Check middleware.ts is in root directory

---

## ✨ Your App is Ready!

You now have a fully functional, password-protected project management system deployed on Vercel! 🎊
