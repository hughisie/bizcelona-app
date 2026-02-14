# Migration 00008 - Deployment Checklist

## Pre-Deployment

- [ ] **Read** `00008_QUICK_REFERENCE.md` for overview
- [ ] **Review** security issues being fixed
- [ ] **Notify** team of upcoming deployment
- [ ] **Schedule** deployment window (recommend off-peak hours)
- [ ] **Prepare** rollback plan (see guide)

---

## Backup Phase

- [ ] **Verify** you have access to Supabase dashboard
- [ ] **Check** current database size (Dashboard → Database)
- [ ] **Create** backup:
  ```bash
  cd "/Users/m4owen/01. Apps/10. Claude Code/09. Bizcelona/bizcelona-app"
  supabase db dump -f "backup_$(date +%Y%m%d_%H%M%S).sql"
  ```
  **OR** via Dashboard: Database → Backups → Download
- [ ] **Verify** backup file was created successfully
- [ ] **Store** backup in safe location

**Time estimate**: 1-2 minutes

---

## Deployment Phase

### Option A: Using Supabase CLI (Recommended)

- [ ] **Navigate** to project directory
  ```bash
  cd "/Users/m4owen/01. Apps/10. Claude Code/09. Bizcelona/bizcelona-app"
  ```
- [ ] **Link** to Supabase project (if not already)
  ```bash
  supabase link --project-ref <your-project-ref>
  ```
- [ ] **Apply** migration
  ```bash
  supabase db push
  ```
- [ ] **Check** for success message
- [ ] **Review** any warnings or errors

### Option B: Using Supabase Dashboard

- [ ] **Login** to Supabase dashboard
- [ ] **Navigate** to SQL Editor
- [ ] **Create** new query
- [ ] **Open** `supabase/migrations/00008_fix_security_and_performance.sql`
- [ ] **Copy** entire contents
- [ ] **Paste** into SQL Editor
- [ ] **Click** "Run" (or Cmd/Ctrl + Enter)
- [ ] **Wait** for completion (30-60 seconds)
- [ ] **Check** for success message
- [ ] **Review** NOTICE messages for "RLS enabled on table" confirmations

**Time estimate**: 1-2 minutes

---

## Verification Phase

- [ ] **Run** verification script:
  ```bash
  supabase db execute -f supabase/migrations/00008_verification.sql
  ```
  **OR** via Dashboard SQL Editor:
  - Open `00008_verification.sql`
  - Copy and paste into SQL Editor
  - Run

- [ ] **Check** summary shows "ALL CHECKS PASSED"

- [ ] **Verify** individual checks:
  - [ ] RLS enabled on all 9 tables
  - [ ] All 6 functions have search_path configured
  - [ ] Activity logs policy is restrictive
  - [ ] Policies are optimized
  - [ ] All 5 triggers recreated
  - [ ] Admin policies exist

- [ ] **Quick manual checks** (via SQL Editor):
  ```sql
  -- Check RLS on admins table
  SELECT tablename, rowsecurity
  FROM pg_tables
  WHERE tablename = 'admins';
  -- Should return: admins | true

  -- Check activity logs policy
  SELECT policyname
  FROM pg_policies
  WHERE tablename = 'activity_logs' AND cmd = 'a';
  -- Should return: "Users can insert their own activity logs"
  ```

**Time estimate**: 1 minute

---

## Functional Testing Phase

### Test 1: Admin Access (requires admin user)

- [ ] **Login** as admin user in app
- [ ] **Navigate** to admin dashboard
- [ ] **Verify** you can see admin features
- [ ] **Check** you can view applications
- [ ] **Test** updating an application status
- [ ] **Confirm** no RLS errors

### Test 2: Regular User Access

- [ ] **Login** as regular (non-admin) user
- [ ] **Verify** you cannot access admin routes
- [ ] **Check** profile updates still work
- [ ] **Test** viewing member directory
- [ ] **Confirm** can add/edit skills
- [ ] **Verify** can view own application

### Test 3: Activity Logs

- [ ] **Perform** an action that creates a log (e.g., update profile)
- [ ] **Check** activity log was created:
  ```sql
  SELECT * FROM public.activity_logs
  ORDER BY created_at DESC
  LIMIT 5;
  ```
- [ ] **Verify** log belongs to correct user
- [ ] **Confirm** no errors in Supabase logs

### Test 4: Performance Check

- [ ] **Run** a complex query with EXPLAIN ANALYZE:
  ```sql
  EXPLAIN ANALYZE
  SELECT p.*, m.status
  FROM public.profiles p
  LEFT JOIN public.members m ON m.user_id = p.id
  WHERE p.id = auth.uid();
  ```
- [ ] **Note** execution time
- [ ] **Compare** with previous baseline (if available)
- [ ] **Look** for efficient execution plan

**Time estimate**: 5-10 minutes

---

## Post-Deployment Monitoring

### Immediate (First 15 minutes)

- [ ] **Monitor** Supabase logs (Dashboard → Logs)
- [ ] **Watch** for RLS policy violations
- [ ] **Check** error rate hasn't increased
- [ ] **Verify** no unexpected errors
- [ ] **Test** critical user flows work

### Short-term (First hour)

- [ ] **Review** activity log creation rate
- [ ] **Check** admin functionality still works
- [ ] **Monitor** query performance metrics
- [ ] **Watch** for user-reported issues
- [ ] **Verify** authentication working correctly

### Medium-term (First 24 hours)

- [ ] **Analyze** query performance trends
- [ ] **Review** any error spikes in logs
- [ ] **Check** activity log completeness
- [ ] **Verify** no RLS policy violations
- [ ] **Confirm** admin workflows functioning

**Time estimate**: 15 minutes active, 24 hours monitoring

---

## Rollback (Only if Critical Issues)

⚠️ **Only perform if migration causes critical application failures**

- [ ] **Identify** specific issue
- [ ] **Determine** if rollback necessary
- [ ] **Read** rollback section in `MIGRATION_00008_GUIDE.md`
- [ ] **Apply** minimal rollback (activity logs policy only):
  ```sql
  DROP POLICY IF EXISTS "Users can insert their own activity logs" ON activity_logs;
  CREATE POLICY "System can insert activity logs"
    ON activity_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);
  ```
- [ ] **DO NOT** rollback search_path fixes (security critical)
- [ ] **DO NOT** disable RLS on admins table (security critical)
- [ ] **Document** issue for future investigation
- [ ] **Schedule** fix for root cause

---

## Completion

- [ ] **Document** deployment in change log
- [ ] **Update** team on successful deployment
- [ ] **Note** any issues encountered
- [ ] **Archive** old SQL files from root directory
- [ ] **Update** documentation if needed
- [ ] **Schedule** follow-up check in 1 week

---

## Sign-off

**Deployed by**: ___________________________

**Date/Time**: ___________________________

**Database**: ☐ Development  ☐ Staging  ☐ Production

**Backup location**: ___________________________

**Verification**: ☐ All checks passed  ☐ Minor issues (documented)  ☐ Failed (rolled back)

**Issues encountered**:
```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

**Notes**:
```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

---

## Emergency Contacts

**Supabase Support**: support@supabase.io
**Documentation**: See `MIGRATION_00008_GUIDE.md`
**Project Path**: `/Users/m4owen/01. Apps/10. Claude Code/09. Bizcelona/bizcelona-app`

---

## Total Time Estimate

| Phase | Duration |
|-------|----------|
| Pre-deployment | 5 min |
| Backup | 1-2 min |
| Deployment | 1-2 min |
| Verification | 1 min |
| Testing | 5-10 min |
| Monitoring (active) | 15 min |
| **Total Active Time** | **~30 min** |
| **Total Monitoring** | **24 hours** |

---

**Migration**: 00008_fix_security_and_performance
**Version**: 1.0
**Last Updated**: 2026-02-14
**Status**: Ready for Deployment
