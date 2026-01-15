# Demo Version - Quick Reference

## 🚀 Quick Setup

1. **Create Supabase demo project**
2. **Copy environment variables**:
   ```bash
   cp .env.demo.example .env.local
   # Edit with your Supabase credentials
   ```
3. **Run migrations** (in Supabase SQL Editor in order):
   - All `20260109_*.sql` through `20260114_*.sql`
   - Then `demo_seed_data.sql`
4. **Install & run**:
   ```bash
   npm install
   npm run dev
   ```
5. **Deploy to Vercel** with env vars

## 📋 Files Created for Demo

- `supabase/migrations/demo_seed_data.sql` - Comprehensive demo data
- `app/components/ui/DemoBanner.tsx` - Demo mode banner
- `DEMO-SETUP-GUIDE.md` - Full setup instructions
- `.env.demo.example` - Demo environment template
- `setup-demo.sh` - Automated setup helper

## 🎯 What's Included in Demo Data

- **5 Areas**: Career, Health & Fitness, Personal Projects, Home & Garden, Learning
- **12 Domains**: Various projects across all areas
- **12 Projects**: Specific subdomains
- **14 Features**: Including OAuth, analytics, etc.
- **6 Bugs**: Various severities and states
- **16 Tasks**: Including recurring tasks, reminders
- **23 Subtasks**: Breaking down complex items

## ⚙️ Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your-demo-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-demo-anon-key
NEXT_PUBLIC_IS_DEMO=true  # Shows demo banner
```

## 🔄 Resetting Demo Data

In Supabase SQL Editor:

```sql
-- Clear all data
DELETE FROM subtasks;
DELETE FROM tasks;
DELETE FROM bugs;
DELETE FROM features;
DELETE FROM subdomains;
DELETE FROM domains;
DELETE FROM areas_of_life;

-- Re-run: demo_seed_data.sql
```

## 📚 Full Documentation

See [DEMO-SETUP-GUIDE.md](./DEMO-SETUP-GUIDE.md) for complete setup instructions.

## ✨ Demo vs Personal Use

| Feature | Demo Version | Personal Version |
|---------|-------------|-----------------|
| **Purpose** | Public showcase | Private use |
| **Data** | Sample data | Your real data |
| **Auth** | None | Optional |
| **Banner** | Shows | Hidden |
| **Setup** | 10 minutes | 5 minutes |
| **Best For** | Portfolio, sharing | Daily work |

---

**Ready to deploy?** Follow the [Demo Setup Guide](./DEMO-SETUP-GUIDE.md)!
