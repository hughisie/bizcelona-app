-- =====================================================
-- VERIFICATION SCRIPT FOR MIGRATION 00008
-- Run this after applying migration 00008 to verify all fixes
-- =====================================================

-- Set output format for better readability
\x on

-- =====================================================
-- 1. VERIFY RLS IS ENABLED ON ALL TABLES
-- =====================================================

SELECT
  '1. RLS Enabled Check' as test_name,
  tablename,
  rowsecurity,
  CASE
    WHEN rowsecurity THEN '✓ PASS'
    ELSE '✗ FAIL - RLS NOT ENABLED!'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'profiles', 'member_skills', 'member_help_requests',
  'members', 'applications', 'admins',
  'whatsapp_links', 'posts', 'activity_logs'
)
ORDER BY tablename;

-- =====================================================
-- 2. VERIFY SECURITY DEFINER FUNCTIONS HAVE search_path SET
-- =====================================================

SELECT
  '2. Function Security Check' as test_name,
  p.proname as function_name,
  p.prosecdef as is_security_definer,
  p.proconfig as configuration,
  CASE
    WHEN p.prosecdef AND p.proconfig IS NOT NULL
         AND array_to_string(p.proconfig, ',') LIKE '%search_path%'
    THEN '✓ PASS'
    WHEN p.prosecdef AND (p.proconfig IS NULL
         OR array_to_string(p.proconfig, ',') NOT LIKE '%search_path%')
    THEN '✗ FAIL - Missing search_path!'
    ELSE '⚠ WARNING - Not SECURITY DEFINER'
  END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
  'is_admin',
  'is_super_admin',
  'is_approved_member',
  'is_user_admin',
  'update_updated_at_column',
  'log_activity'
)
ORDER BY p.proname;

-- =====================================================
-- 3. VERIFY ACTIVITY_LOGS POLICY IS RESTRICTIVE
-- =====================================================

SELECT
  '3. Activity Logs Policy Check' as test_name,
  polname as policy_name,
  polcmd as command,
  CASE polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END as operation,
  pg_get_expr(polqual, polrelid) as using_expression,
  pg_get_expr(polwithcheck, polrelid) as with_check_expression,
  CASE
    WHEN polname = 'Users can insert their own activity logs'
         AND polcmd = 'a'
         AND pg_get_expr(polwithcheck, polrelid) LIKE '%auth.uid()%user_id%'
    THEN '✓ PASS - Policy is restrictive'
    WHEN polname = 'System can insert activity logs'
         AND pg_get_expr(polwithcheck, polrelid) = 'true'
    THEN '✗ FAIL - Old insecure policy still exists!'
    ELSE '⚠ CHECK MANUALLY'
  END as status
FROM pg_policy
WHERE polrelid = 'public.activity_logs'::regclass
AND polcmd = 'a'  -- INSERT policies
ORDER BY polname;

-- =====================================================
-- 4. COUNT OPTIMIZED POLICIES (using cached auth.uid)
-- =====================================================

SELECT
  '4. Policy Optimization Check' as test_name,
  schemaname,
  tablename,
  policyname,
  CASE
    WHEN pg_get_expr(qual, tablename::regclass) LIKE '%(SELECT auth.uid())%'
         OR pg_get_expr(with_check, tablename::regclass) LIKE '%(SELECT auth.uid())%'
    THEN '✓ OPTIMIZED - Uses cached auth.uid()'
    WHEN pg_get_expr(qual, tablename::regclass) LIKE '%auth.uid()%'
         OR pg_get_expr(with_check, tablename::regclass) LIKE '%auth.uid()%'
    THEN '⚠ NOT OPTIMIZED - Uses direct auth.uid()'
    ELSE '- N/A'
  END as optimization_status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'profiles', 'member_skills', 'member_help_requests',
  'members', 'applications', 'whatsapp_links',
  'posts', 'activity_logs'
)
ORDER BY tablename, policyname;

-- =====================================================
-- 5. VERIFY TRIGGERS WERE RECREATED
-- =====================================================

SELECT
  '5. Trigger Recreation Check' as test_name,
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  CASE
    WHEN tgname LIKE 'update_%_updated_at' THEN '✓ PASS - Trigger exists'
    ELSE '⚠ CHECK'
  END as status
FROM pg_trigger
WHERE tgname LIKE 'update_%_updated_at'
AND tgrelid::regclass::text IN (
  'public.profiles',
  'public.members',
  'public.applications',
  'public.whatsapp_links',
  'public.posts'
)
ORDER BY table_name;

-- =====================================================
-- 6. VERIFY ADMIN POLICIES EXIST
-- =====================================================

SELECT
  '6. Admin Table Policies Check' as test_name,
  polname as policy_name,
  CASE polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END as operation,
  CASE
    WHEN polname IN (
      'Admins can view admin records',
      'Super admins can insert admins',
      'Super admins can update admins',
      'Super admins can delete admins'
    ) THEN '✓ PASS'
    ELSE '⚠ UNEXPECTED POLICY'
  END as status
FROM pg_policy
WHERE polrelid = 'public.admins'::regclass
ORDER BY polname;

-- =====================================================
-- SUMMARY REPORT
-- =====================================================

DO $$
DECLARE
  rls_enabled_count INTEGER;
  rls_total_count INTEGER;
  secure_function_count INTEGER;
  function_total_count INTEGER;
  optimized_policy_count INTEGER;
  policy_total_count INTEGER;
  trigger_count INTEGER;
  trigger_expected_count INTEGER := 5;
BEGIN
  -- Count RLS enabled tables
  SELECT COUNT(*) INTO rls_enabled_count
  FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'member_skills', 'member_help_requests',
    'members', 'applications', 'admins',
    'whatsapp_links', 'posts', 'activity_logs'
  )
  AND rowsecurity = true;

  SELECT COUNT(*) INTO rls_total_count
  FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'member_skills', 'member_help_requests',
    'members', 'applications', 'admins',
    'whatsapp_links', 'posts', 'activity_logs'
  );

  -- Count secure functions
  SELECT COUNT(*) INTO secure_function_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname IN (
    'is_admin', 'is_super_admin', 'is_approved_member',
    'is_user_admin', 'update_updated_at_column', 'log_activity'
  )
  AND p.prosecdef
  AND p.proconfig IS NOT NULL
  AND array_to_string(p.proconfig, ',') LIKE '%search_path%';

  SELECT COUNT(*) INTO function_total_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname IN (
    'is_admin', 'is_super_admin', 'is_approved_member',
    'is_user_admin', 'update_updated_at_column', 'log_activity'
  );

  -- Count optimized policies
  SELECT COUNT(*) INTO optimized_policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'member_skills', 'member_help_requests',
    'members', 'applications', 'whatsapp_links',
    'posts', 'activity_logs'
  )
  AND (
    pg_get_expr(qual, tablename::regclass) LIKE '%(SELECT auth.uid())%'
    OR pg_get_expr(with_check, tablename::regclass) LIKE '%(SELECT auth.uid())%'
  );

  SELECT COUNT(*) INTO policy_total_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'member_skills', 'member_help_requests',
    'members', 'applications', 'whatsapp_links',
    'posts', 'activity_logs'
  );

  -- Count triggers
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger
  WHERE tgname LIKE 'update_%_updated_at';

  -- Print summary
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║         MIGRATION 00008 VERIFICATION SUMMARY                   ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '1. RLS Enabled:         %/% tables      %',
    rls_enabled_count,
    rls_total_count,
    CASE WHEN rls_enabled_count = rls_total_count THEN '✓ PASS' ELSE '✗ FAIL' END;

  RAISE NOTICE '2. Secure Functions:    %/% functions  %',
    secure_function_count,
    function_total_count,
    CASE WHEN secure_function_count = function_total_count THEN '✓ PASS' ELSE '✗ FAIL' END;

  RAISE NOTICE '3. Optimized Policies:  %/% policies   %',
    optimized_policy_count,
    policy_total_count,
    CASE WHEN optimized_policy_count >= 15 THEN '✓ PASS' ELSE '⚠ PARTIAL' END;

  RAISE NOTICE '4. Triggers Recreated:  %/% triggers   %',
    trigger_count,
    trigger_expected_count,
    CASE WHEN trigger_count = trigger_expected_count THEN '✓ PASS' ELSE '✗ FAIL' END;

  RAISE NOTICE '';

  IF rls_enabled_count = rls_total_count
     AND secure_function_count = function_total_count
     AND trigger_count = trigger_expected_count
     AND optimized_policy_count >= 15
  THEN
    RAISE NOTICE '╔════════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║  ✓ ALL CHECKS PASSED - Migration successful!                  ║';
    RAISE NOTICE '╚════════════════════════════════════════════════════════════════╝';
  ELSE
    RAISE NOTICE '╔════════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║  ✗ SOME CHECKS FAILED - Review output above                   ║';
    RAISE NOTICE '╚════════════════════════════════════════════════════════════════╝';
  END IF;

  RAISE NOTICE '';
END $$;

-- =====================================================
-- DETAILED POLICY LISTING (for reference)
-- =====================================================

\echo ''
\echo '==============================================================='
\echo 'DETAILED POLICY LISTING'
\echo '==============================================================='

SELECT
  schemaname,
  tablename,
  policyname,
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END as command,
  roles,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
