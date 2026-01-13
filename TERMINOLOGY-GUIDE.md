# Terminology Guide

**Important**: Throughout this codebase, we use "**project**" terminology for user-facing content and clarity.

## Consistent Terms

### Use These Terms:
- ✅ **Project** (not "domain")
- ✅ **Area** (area of life)
- ✅ **Task/Bug/Feature** (work items)

### Database Schema Note:
- The database table is named `domains` for technical/legacy reasons
- The field is `domain_id` in the database
- **Always refer to it as "project" in:**
  - User interface
  - Comments
  - Documentation
  - Variable names (where possible)
  - Function names

## Hierarchy

```
Area (areas_of_life table)
  └── Project (domains table)
       └── Task/Bug/Feature (tasks/bugs/features tables)
```

## Examples

### ✅ Good:
```typescript
// Fetch all projects for this area
const projects = await fetchProjects(areaId);

// Get project details
const project = await getProject(projectId);
```

### ❌ Avoid:
```typescript
// Fetch all domains for this area
const domains = await fetchDomains(areaId);

// Get domain details
const domain = await getDomain(domainId);
```

## Why?

- **Clarity**: "Project" is universally understood
- **User-friendly**: Less technical jargon
- **Industry standard**: Most project management tools use "project"
- **Less confusion**: "Domain" has multiple meanings in software

## When You See "Domain" in Code

If you see `domain` in:
- **Database fields** (domain_id): Leave as-is for consistency
- **Table names** (domains): Leave as-is (database schema)
- **Comments/docs**: Should be changed to "project"
- **Variable names**: Should be changed to "project" where possible
- **User-facing text**: Must be "project"

---

**Remember**: Domain = Project. Always use "project" in user-facing contexts!
