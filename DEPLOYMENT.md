# 🚀 Quick Deployment Guide
## Andrea's Project Manager

## Prerequisites

✅ Supabase project created  
✅ Database migration applied  
✅ Environment variables configured  
✅ Code pushed to GitHub  

## 1. Deploy to Vercel (5 minutes)

### Step 1: Prepare Your Project

```bash
# Make sure everything is committed
git add .
git commit -m "Initial commit: Simple Project Manager"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### Step 3: Add Environment Variables

In the Vercel dashboard, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Deploy

Click **"Deploy"** and wait ~2 minutes.

### Step 5: Test

Visit your deployed URL (e.g., `https://your-project.vercel.app`)

---

## 2. Update Supabase (Optional but Recommended)

### Enable Additional Security

In your Supabase dashboard:

1. Go to **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Site URL** and **Redirect URLs**

### Monitor Usage

- Go to **Database** → **Logs** to see queries
- Check **API** → **Usage** for traffic stats

---

## 3. Custom Domain (Optional)

### In Vercel:

1. Go to **Settings** → **Domains**
2. Add your custom domain (e.g., `projects.yourdomain.com`)
3. Follow DNS instructions

---

## 4. Alternative Deployment Options

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

Add environment variables in Netlify dashboard.

### Railway

```bash
# Install Railway CLI
npm install -g railway-cli

# Login and deploy
railway login
railway init
railway up
```

Add environment variables in Railway dashboard.

### Self-Hosted (Docker)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t simple-project-manager .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  simple-project-manager
```

---

## 5. Post-Deployment Checklist

- [ ] Test all pages load correctly
- [ ] Create a test area/domain/project
- [ ] Add a feature/bug/task
- [ ] Test filtering and sorting
- [ ] Check mobile responsiveness
- [ ] Verify environment variables are working
- [ ] Check browser console for errors
- [ ] Test breadcrumb navigation
- [ ] Try adding subtasks

---

## 🐛 Troubleshooting

### "Failed to load areas" error

**Solution**: Check environment variables in Vercel dashboard. Make sure they start with `NEXT_PUBLIC_`.

### Database connection issues

**Solution**: 
1. Verify Supabase URL and key in `.env.local`
2. Check Supabase project is not paused (free tier auto-pauses after 7 days inactivity)
3. Ensure migration was applied correctly

### Build errors

**Solution**:
```bash
# Clear cache and rebuild locally first
rm -rf .next
npm run build

# If successful locally, push and redeploy
git push origin main
```

### Slow loading

**Solution**: 
- Check Supabase region (should be close to your users)
- Consider upgrading Supabase plan for better performance
- Enable caching in Next.js config

---

## 📊 Monitoring

### Vercel Analytics (Optional)

Add to `app/layout.tsx`:

```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Supabase Monitoring

- **Dashboard** → **Database** → **Table Editor**: View data
- **Dashboard** → **API** → **Logs**: See all queries
- **Dashboard** → **Reports**: Usage and performance stats

---

## 🔄 Continuous Deployment

Every push to `main` branch automatically deploys to Vercel!

```bash
git add .
git commit -m "Add new feature"
git push origin main
# ✨ Auto-deploys in ~2 minutes
```

---

## 🎉 You're Live!

Your Simple Project Manager is now deployed and accessible worldwide!

Share your deployed URL with confidence: `https://your-project.vercel.app`

---

**Need help?** Check the main README.md or Vercel/Supabase documentation.
