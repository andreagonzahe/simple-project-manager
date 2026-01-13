# Database Rename: domains → projects

**Date**: January 12, 2026  
**Status**: Ready to Execute ⚠️

## ⚠️ IMPORTANT - READ BEFORE RUNNING

This migration will rename core database tables and columns. **Make a backup first!**

## What This Migration Does

Renames everything from "domain" terminology to "project" terminology:

### Database Changes:
1. **Table**: `domains` → `projects`
2. **Foreign Keys**: 
   - `tasks.domain_id` → `tasks.project_id`
   - `bugs.domain_id` → `bugs.project_id`
   - `features.domain_id` → `features.project_id`
3. **Constraints**: `*_domain_or_area_check` → `*_project_or_area_check`
4. **Indexes**: `idx_*_domain_id` → `idx_*_project_id`

### Code Changes Needed:
- Type definitions updated (`Domain` → `Project`, `DomainWithCounts` → `ProjectWithCounts`)
- All Supabase queries need to use new names
- Components need to reference `projects` table
- Update `project_id` references

## Pre-Migration Checklist

- [ ] **Backup your database** (Export from Supabase dashboard)
- [ ] **No users are actively using the app**
- [ ] **You have time to fix any issues** (~30 min)
- [ ] **You've committed all current code changes**

## Running the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open file: `supabase/migrations/20260112_rename_domains_to_projects.sql`
4. Copy all contents
5. Paste into SQL Editor
6. Click **RUN**
7. Verify no errors

### Option 2: Using the Script

```bash
# Make script executable
chmod +x scripts/run-rename-migration.mjs

# Run migration (requires .env.local)
node scripts/run-rename-migration.mjs
```

## Post-Migration Steps

After running the database migration, you need to update your codebase:

### 1. Update All Component Files

Search and replace across your codebase:
- `domains` → `projects` (in queries)
- `domain_id` → `project_id` (in queries)
- `Domain` → `Project` (type names)
- `DomainWithCounts` → `ProjectWithCounts`
- `DomainFormData` → `ProjectFormData`

**Files that need updates:**
- `app/projects/[areaId]/page.tsx`
- `app/projects/[areaId]/[domainId]/page.tsx` (rename to `[projectId]`)
- `app/page.tsx`
- `app/components/cards/*`
- `app/components/modals/*`
- Any other files that query the database

### 2. Rename Directory

```bash
# Rename the dynamic route folder
mv app/projects/[areaId]/[domainId] app/projects/[areaId]/[projectId]
```

### 3. Update Route References

Update any navigation/links that use `/projects/[areaId]/[domainId]` to use `/projects/[areaId]/[projectId]`

### 4. Clear Next.js Cache

```bash
# Remove build cache
rm -rf .next

# Restart dev server
npm run dev
```

## Testing After Migration

- [ ] Can view areas
- [ ] Can view projects  
- [ ] Can create new project
- [ ] Can edit project
- [ ] Can delete project
- [ ] Can create tasks in project
- [ ] Can view tasks in project
- [ ] No console errors
- [ ] All queries working

## If Something Goes Wrong

### Rollback Steps:

1. **Stop the app** (Ctrl+C)
2. **Restore from backup** (Supabase dashboard → Database → Backups)
3. **Revert code changes** (`git reset --hard HEAD`)
4. **Restart** (`npm run dev`)

### Common Issues:

**"Table doesn't exist"**
- Migration didn't run completely
- Run it again or restore backup

**"Column doesn't exist"**
- Some queries still use old names
- Search codebase for `domain_id` and update

**TypeScript errors**
- Import statements need updating
- Type names need changing

## Benefits After Migration

✅ **Clarity** - "Project" is immediately understood  
✅ **Consistency** - Same terminology everywhere  
✅ **Professional** - Industry standard naming  
✅ **Maintainable** - Easier for others to understand  
✅ **Self-documenting** - Schema matches business logic  

## Migration SQL Preview

```sql
-- Rename main table
ALTER TABLE domains RENAME TO projects;

-- Rename foreign keys
ALTER TABLE tasks RENAME COLUMN domain_id TO project_id;
ALTER TABLE bugs RENAME COLUMN domain_id TO project_id;
ALTER TABLE features RENAME COLUMN domain_id TO project_id;

-- Rename constraints
ALTER TABLE tasks RENAME CONSTRAINT tasks_domain_or_area_check 
  TO tasks_project_or_area_check;
-- (and similar for bugs, features)

-- Rename indexes
ALTER INDEX idx_tasks_domain_id RENAME TO idx_tasks_project_id;
-- (and similar for bugs, features)
```

## Estimated Time

- **Database migration**: 1-2 minutes
- **Code updates**: 15-30 minutes
- **Testing**: 10 minutes
- **Total**: ~30-45 minutes

## Support

If you encounter issues:
1. Check the error message carefully
2. Verify migration completed (check Supabase dashboard)
3. Ensure all code updates are done
4. Clear caches and restart

---

**Ready?** Make your backup, then run the migration! 🚀
