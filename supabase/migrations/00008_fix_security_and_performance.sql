-- =====================================================
-- SECURITY AND PERFORMANCE FIXES
-- Migration: 00008_fix_security_and_performance.sql
--
-- This migration addresses critical security and performance issues:
-- 1. Ensures RLS is enabled on admins table (CRITICAL SECURITY)
-- 2. Fixes unrestricted INSERT policy on activity_logs (CRITICAL SECURITY)
-- 3. Fixes mutable search_path on functions (SECURITY)
-- 4. Optimizes RLS policies by caching auth.uid() calls (PERFORMANCE)
-- =====================================================

-- =====================================================
-- PART 1: CRITICAL SECURITY - ENABLE RLS ON ADMINS TABLE
-- =====================================================

-- Ensure RLS is enabled on admins table
-- Note: This should already be done by migration 00002 and 00007,
-- but we verify it here to ensure it's not disabled in production
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 2: CRITICAL SECURITY - FIX UNRESTRICTED ACTIVITY LOGS POLICY
-- =====================================================

-- Drop the existing unrestricted policy that allows any authenticated user
-- to insert activity logs without validation
DROP POLICY IF EXISTS "System can insert activity logs" ON public.activity_logs;

-- Create a more restrictive policy that only allows users to log their own activities
-- This prevents users from injecting false logs for other users
CREATE POLICY "Users can insert their own activity logs"
  ON public.activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Note: For system-level logging that doesn't have a user_id,
-- the log_activity() function uses SECURITY DEFINER to bypass RLS

-- =====================================================
-- PART 3: SECURITY - FIX MUTABLE SEARCH_PATH ON FUNCTIONS
-- =====================================================

-- Fix is_admin function
-- Setting search_path prevents malicious schema injection attacks
DROP FUNCTION IF EXISTS public.is_admin(UUID);
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = $1
  );
END;
$$;

-- Fix is_super_admin function
DROP FUNCTION IF EXISTS public.is_super_admin(UUID);
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = $1
    AND admins.role = 'super_admin'
  );
END;
$$;

-- Fix is_approved_member function
DROP FUNCTION IF EXISTS public.is_approved_member(UUID);
CREATE OR REPLACE FUNCTION public.is_approved_member(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.members
    WHERE members.user_id = $1
    AND members.status IN ('approved', 'active')
  );
END;
$$;

-- Fix is_user_admin function
DROP FUNCTION IF EXISTS public.is_user_admin(UUID);
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE user_id = user_id_param
  );
END;
$$;

-- Fix update_updated_at_column function
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate triggers that were dropped when we dropped the function with CASCADE
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_whatsapp_links_updated_at BEFORE UPDATE ON public.whatsapp_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fix log_activity function
DROP FUNCTION IF EXISTS public.log_activity(UUID, TEXT, TEXT, UUID, JSONB, TEXT);
CREATE OR REPLACE FUNCTION public.log_activity(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.activity_logs (user_id, action, resource_type, resource_id, metadata, ip_address)
  VALUES (p_user_id, p_action, p_resource_type, p_resource_id, p_metadata, p_ip_address)
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- =====================================================
-- PART 4: PERFORMANCE - OPTIMIZE RLS POLICIES WITH CACHED auth.uid()
-- =====================================================

-- PERFORMANCE EXPLANATION:
-- Using (select auth.uid()) instead of auth.uid() directly caches the result
-- of the auth.uid() function call, preventing it from being executed multiple
-- times per policy check. This can significantly improve query performance.

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- =====================================================
-- MEMBER_SKILLS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can insert their own skills" ON public.member_skills;
CREATE POLICY "Users can insert their own skills"
  ON public.member_skills FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own skills" ON public.member_skills;
CREATE POLICY "Users can update their own skills"
  ON public.member_skills FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own skills" ON public.member_skills;
CREATE POLICY "Users can delete their own skills"
  ON public.member_skills FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- MEMBER_HELP_REQUESTS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can insert their own help requests" ON public.member_help_requests;
CREATE POLICY "Users can insert their own help requests"
  ON public.member_help_requests FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own help requests" ON public.member_help_requests;
CREATE POLICY "Users can update their own help requests"
  ON public.member_help_requests FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own help requests" ON public.member_help_requests;
CREATE POLICY "Users can delete their own help requests"
  ON public.member_help_requests FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- MEMBERS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own member record" ON public.members;
CREATE POLICY "Users can view their own member record"
  ON public.members FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins can manage members" ON public.members;
CREATE POLICY "Admins can manage members"
  ON public.members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = (select auth.uid())
    )
  );

-- =====================================================
-- APPLICATIONS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own application" ON public.applications;
CREATE POLICY "Users can view their own application"
  ON public.applications FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can submit their own application" ON public.applications;
CREATE POLICY "Users can submit their own application"
  ON public.applications FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own pending application" ON public.applications;
CREATE POLICY "Users can update their own pending application"
  ON public.applications FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id AND status = 'submitted')
  WITH CHECK ((select auth.uid()) = user_id AND status = 'submitted');

DROP POLICY IF EXISTS "Admins can view all applications" ON public.applications;
CREATE POLICY "Admins can view all applications"
  ON public.applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can update applications" ON public.applications;
CREATE POLICY "Admins can update applications"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = (select auth.uid())
    )
  );

-- =====================================================
-- WHATSAPP_LINKS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admins can manage WhatsApp links" ON public.whatsapp_links;
CREATE POLICY "Admins can manage WhatsApp links"
  ON public.whatsapp_links FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = (select auth.uid())
    )
  );

-- =====================================================
-- POSTS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Authors can view their own posts" ON public.posts;
CREATE POLICY "Authors can view their own posts"
  ON public.posts FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = author_id);

DROP POLICY IF EXISTS "Admins can manage posts" ON public.posts;
CREATE POLICY "Admins can manage posts"
  ON public.posts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = (select auth.uid())
    )
  );

-- =====================================================
-- ACTIVITY_LOGS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.activity_logs;
CREATE POLICY "Users can view their own activity logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.activity_logs;
CREATE POLICY "Admins can view all activity logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = (select auth.uid())
    )
  );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify RLS is enabled on all tables
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'member_skills', 'member_help_requests', 'members',
                      'applications', 'admins', 'whatsapp_links', 'posts', 'activity_logs')
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
    RAISE NOTICE 'RLS enabled on table: %', r.tablename;
  END LOOP;
END $$;

-- Add comments documenting the changes
COMMENT ON POLICY "Users can insert their own activity logs" ON public.activity_logs IS
  'Restricts activity log insertion to only the user''s own logs. System logs use the log_activity() SECURITY DEFINER function.';

COMMENT ON FUNCTION public.is_admin IS
  'Helper function to check if a user has admin privileges. Uses SET search_path for security.';

COMMENT ON FUNCTION public.is_super_admin IS
  'Helper function to check if a user has super admin privileges. Uses SET search_path for security.';

COMMENT ON FUNCTION public.is_approved_member IS
  'Helper function to check if a user is an approved member. Uses SET search_path for security.';

COMMENT ON FUNCTION public.is_user_admin IS
  'Helper function to check if a user has admin privileges. Uses SET search_path for security.';

COMMENT ON FUNCTION public.log_activity IS
  'Logs user activity. Uses SECURITY DEFINER to bypass RLS for system logging. Uses SET search_path for security.';

-- Log this migration
SELECT public.log_activity(
  NULL,
  'migration_applied',
  'migration',
  NULL,
  jsonb_build_object(
    'migration', '00008_fix_security_and_performance',
    'description', 'Applied critical security and performance fixes',
    'fixes', jsonb_build_array(
      'Enabled RLS on admins table',
      'Fixed unrestricted activity_logs INSERT policy',
      'Fixed mutable search_path on all SECURITY DEFINER functions',
      'Optimized RLS policies with cached auth.uid() calls'
    )
  ),
  NULL
);
