# Migration 00008: Security and Performance Fixes

## Overview

This migration addresses **critical security vulnerabilities** and **performance issues** identified in the Supabase database schema.

**SEVERITY**: CRITICAL
**RECOMMENDED ACTION**: Apply immediately to production

---

## Security Issues Fixed

### 1. CRITICAL: RLS Enabled on Admins Table ✓
**Issue**: The `public.admins` table had RLS policies defined but RLS was potentially disabled.
**Risk**: Without RLS enabled, all authenticated users could potentially read/write admin records.
**Fix**: Explicitly enables RLS on the admins table.

### 2. CRITICAL: Unrestricted Activity Logs INSERT ✓
**Issue**: The policy "System can insert activity logs" allowed ANY authenticated user to insert logs for ANY user.
**Risk**: Users could inject false activity logs for other users, corrupting audit trails.
**Fix**: Replaced with "Users can insert their own activity logs" which restricts users to only log their own activities. System logging still works via the `log_activity()` SECURITY DEFINER function.

### 3. CRITICAL: Mutable search_path on SECURITY DEFINER Functions ✓
**Issue**: All SECURITY DEFINER functions lacked `SET search_path`, making them vulnerable to search path attacks.
**Risk**: Attackers could create malicious schemas/functions that get called instead of intended ones.
**Functions Fixed**:
- `public.is_admin`
- `public.is_super_admin`
- `public.is_approved_member`
- `public.is_user_admin`
- `public.update_updated_at_column`
- `public.log_activity`

**Fix**: Added `SET search_path = public, pg_temp` to all SECURITY DEFINER functions.

---

## Performance Optimizations

### RLS Policy Optimization
**Issue**: Using `auth.uid()` directly in RLS policies causes the function to be called multiple times per query.
**Impact**: Slower query execution, especially on complex queries with multiple policy checks.
**Fix**: Replaced `auth.uid()` with `(select auth.uid())` to cache the result.

**Tables Optimized**:
- `public.profiles` (2 policies)
- `public.member_skills` (3 policies)
- `public.member_help_requests` (3 policies)
- `public.members` (2 policies)
- `public.applications` (5 policies)
- `public.whatsapp_links` (1 policy)
- `public.posts` (2 policies)
- `public.activity_logs` (2 policies)

**Total**: 20 policies optimized

---

## How to Apply This Migration

### Option 1: Supabase Dashboard (Recommended for Production)

1. **Backup your database first!**
   ```bash
   # If using Supabase CLI
   supabase db dump -f backup_before_00008.sql
   ```

2. Log into your Supabase project dashboard

3. Navigate to **SQL Editor**

4. Create a **New Query**

5. Copy the entire contents of `00008_fix_security_and_performance.sql`

6. Paste into the SQL Editor

7. Click **Run** (or press Cmd/Ctrl + Enter)

8. Wait for completion - you should see:
   - Multiple "NOTICE" messages showing "RLS enabled on table: [table_name]"
   - Success message at the end

9. Verify the migration by running this query:
   ```sql
   -- Check RLS is enabled on all critical tables
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename IN ('admins', 'activity_logs', 'profiles', 'members', 'applications')
   ORDER BY tablename;
   ```
   All tables should show `rowsecurity = true`

10. Check function security:
    ```sql
    -- Verify functions have search_path set
    SELECT
      proname as function_name,
      prosecdef as is_security_definer,
      proconfig as config
    FROM pg_proc
    WHERE proname IN ('is_admin', 'is_super_admin', 'log_activity', 'update_updated_at_column')
    AND pronamespace = 'public'::regnamespace;
    ```
    All should show `is_security_definer = true` and config should contain search_path setting.

### Option 2: Supabase CLI

```bash
# Navigate to your project directory
cd /path/to/bizcelona-app

# Link to your Supabase project (if not already linked)
supabase link --project-ref your-project-ref

# Apply the migration
supabase db push

# Or apply specific migration
supabase migration up
```

---

## Testing After Migration

### 1. Test RLS on Admins Table
```sql
-- As a non-admin user, try to view admins (should return nothing)
SELECT * FROM public.admins;

-- As an admin user, should see all admin records
SELECT * FROM public.admins;
```

### 2. Test Activity Logs Security
```sql
-- Try to insert a log for a different user (should fail)
INSERT INTO public.activity_logs (user_id, action)
VALUES ('00000000-0000-0000-0000-000000000000', 'test_action');
-- Should error: new row violates row-level security policy

-- Insert a log for your own user (should succeed)
INSERT INTO public.activity_logs (user_id, action)
VALUES (auth.uid(), 'test_action');
-- Should succeed
```

### 3. Test Performance
Run a complex query before and after to verify performance improvement:
```sql
EXPLAIN ANALYZE
SELECT
  p.*,
  m.status,
  (SELECT COUNT(*) FROM public.member_skills WHERE user_id = p.id) as skill_count
FROM public.profiles p
LEFT JOIN public.members m ON m.user_id = p.id
WHERE p.id = auth.uid();
```

Compare execution time before and after migration.

---

## Rollback Plan

If you need to rollback this migration (not recommended unless critical issues):

1. **DO NOT** just delete the migration file
2. Create a new migration that reverses the changes
3. **WARNING**: Rolling back these security fixes will re-introduce vulnerabilities

**Rollback script** (use only if absolutely necessary):
```sql
-- This rollback is NOT RECOMMENDED as it re-introduces security vulnerabilities
-- Only use if the migration causes critical application failures

-- Rollback to old activity logs policy
DROP POLICY IF EXISTS "Users can insert their own activity logs" ON public.activity_logs;
CREATE POLICY "System can insert activity logs"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Note: We do NOT rollback the search_path fixes or RLS enablement
-- as those are critical security measures
```

---

## Expected Impact

### Minimal Impact
- ✅ No schema changes (no columns added/removed)
- ✅ No data migration required
- ✅ Policies are dropped and recreated (atomic operation)
- ✅ Functions are replaced (existing queries continue to work)

### Potential Breaking Changes
- ❌ If any code was directly inserting activity logs for other users, this will now fail
  - **Fix**: Use the `log_activity()` function instead of direct INSERT
- ❌ If any triggers were dropping when we recreate `update_updated_at_column()`
  - **Fix**: This migration recreates all triggers automatically

---

## Verification Checklist

After applying the migration, verify:

- [ ] All tables have RLS enabled (especially `admins`)
- [ ] Activity logs can only be inserted for the current user
- [ ] All SECURITY DEFINER functions have `SET search_path`
- [ ] Admin users can still access admin functionality
- [ ] Regular users cannot access admin-only resources
- [ ] Triggers on `updated_at` columns still work
- [ ] Application logs activities correctly
- [ ] No errors in Supabase logs

---

## Support

If you encounter issues with this migration:

1. Check the Supabase logs in the dashboard
2. Review the error messages carefully
3. Ensure you're running PostgreSQL 12+
4. Verify your Supabase project is up to date
5. Check the verification queries above

For questions or issues, check:
- Supabase documentation: https://supabase.com/docs
- PostgreSQL RLS documentation: https://www.postgresql.org/docs/current/ddl-rowsecurity.html

---

## Migration Metadata

- **Migration Number**: 00008
- **Created**: 2026-02-14
- **Author**: System
- **Type**: Security & Performance
- **Estimated Duration**: < 1 minute
- **Downtime Required**: No
- **Reversible**: Yes (not recommended)

---

## Additional Notes

### Why This Migration is Important

1. **Regulatory Compliance**: Proper audit logs are required for GDPR and other regulations
2. **Security Best Practices**: PostgreSQL SECURITY DEFINER functions must have search_path set
3. **Data Integrity**: Preventing unauthorized access to admin functions protects your platform
4. **Performance**: Caching auth.uid() can improve query performance by 10-30% on complex queries

### Post-Migration Best Practices

1. Monitor Supabase logs for any RLS policy violations
2. Review activity logs regularly for suspicious activity
3. Keep all SECURITY DEFINER functions with search_path set
4. Always test RLS policies with different user roles
5. Document any new policies added in future migrations
