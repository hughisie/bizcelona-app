# Migration 00008 - Quick Reference Card

## TL;DR
**Critical security fixes** - Apply ASAP to production.

---

## What This Fixes

| Issue | Severity | Impact |
|-------|----------|--------|
| RLS not enforced on `admins` table | 🔴 CRITICAL | Unauthorized admin access |
| Unrestricted activity log insertion | 🔴 CRITICAL | Audit trail corruption |
| Mutable search_path on functions | 🔴 CRITICAL | SQL injection vulnerability |
| Unoptimized RLS policies | 🟡 MEDIUM | Slow query performance |

---

## Quick Apply (Production)

```bash
# 1. Backup first!
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Apply migration
supabase db push

# 3. Verify
supabase db execute -f supabase/migrations/00008_verification.sql
```

**OR** via Supabase Dashboard:
1. SQL Editor → New Query
2. Paste contents of `00008_fix_security_and_performance.sql`
3. Run
4. Check for success message

---

## Files in This Migration

```
supabase/migrations/
├── 00008_fix_security_and_performance.sql  ← Main migration file
├── 00008_verification.sql                  ← Run this to verify success
├── MIGRATION_00008_GUIDE.md                ← Detailed documentation
└── 00008_QUICK_REFERENCE.md                ← This file
```

---

## Verification Checklist

After applying, verify:

```sql
-- ✓ RLS is enabled on admins table
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'admins';
-- Should return: admins | true

-- ✓ Activity logs policy is restrictive
SELECT policyname
FROM pg_policies
WHERE tablename = 'activity_logs' AND cmd = 'a';
-- Should return: "Users can insert their own activity logs"
-- Should NOT return: "System can insert activity logs"

-- ✓ Functions have search_path set
SELECT proname, proconfig
FROM pg_proc
WHERE proname IN ('is_admin', 'log_activity')
AND pronamespace = 'public'::regnamespace;
-- proconfig should contain '{search_path=public,pg_temp}'
```

---

## Breaking Changes?

**NO** - This migration is backwards compatible.

**EXCEPT**: If you were directly inserting activity logs for other users (which you shouldn't have been doing), that will now fail. Use the `log_activity()` function instead.

---

## Performance Impact

**Expected improvement**: 10-30% faster queries on tables with RLS policies.

**Why?**: Caching `auth.uid()` prevents redundant function calls.

**Example**:
```sql
-- Before (slow):
USING (auth.uid() = user_id)  -- auth.uid() called multiple times

-- After (fast):
USING ((select auth.uid()) = user_id)  -- auth.uid() cached
```

---

## Common Issues & Solutions

### Issue: "Policy already exists"
**Solution**: The migration handles this with `DROP POLICY IF EXISTS`. If you still get this error, manually drop the policy first.

### Issue: "Function does not exist"
**Solution**: Make sure previous migrations (00001-00007) were applied first.

### Issue: "Triggers not firing"
**Solution**: The migration recreates all triggers. Run the verification script to confirm.

### Issue: "Users can't insert activity logs"
**Solution**: This is expected! They can only insert logs for themselves. System logs should use `log_activity()` function.

---

## Rollback (Emergency Only)

**⚠️ WARNING**: Rolling back re-introduces security vulnerabilities!

```sql
-- Only if absolutely necessary
DROP POLICY IF EXISTS "Users can insert their own activity logs" ON activity_logs;
CREATE POLICY "System can insert activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

**Do NOT rollback**:
- RLS enablement on admins table
- search_path fixes on functions
- Policy optimizations

---

## Support

**Questions?** Check:
- `MIGRATION_00008_GUIDE.md` for detailed documentation
- Supabase docs: https://supabase.com/docs/guides/auth/row-level-security
- PostgreSQL RLS: https://www.postgresql.org/docs/current/ddl-rowsecurity.html

**Issues?** Run the verification script:
```bash
supabase db execute -f supabase/migrations/00008_verification.sql
```

---

## Timeline

| Step | Duration | Downtime |
|------|----------|----------|
| Backup database | 1-2 min | No |
| Apply migration | 30-60 sec | No |
| Verify migration | 10 sec | No |
| **Total** | **~3 min** | **0 min** |

---

## Key Takeaways

1. ✅ **Apply immediately** - These are critical security fixes
2. ✅ **Zero downtime** - Safe to apply during business hours
3. ✅ **No schema changes** - Only policy and function updates
4. ✅ **Performance boost** - Queries will be faster
5. ✅ **Backwards compatible** - Existing code continues to work

---

## Next Steps After Applying

1. Monitor Supabase logs for any RLS policy violations
2. Test admin functionality to ensure access still works
3. Verify activity logs are being created correctly
4. Run the verification script weekly as part of maintenance
5. Update your documentation to reflect these security improvements

---

**Last Updated**: 2026-02-14
**Migration Version**: 00008
**Status**: Ready for Production
