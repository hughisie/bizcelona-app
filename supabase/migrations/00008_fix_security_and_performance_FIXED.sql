-- =====================================================
-- SECURITY AND PERFORMANCE FIXES (FIXED VERSION)
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

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 2: DROP ALL POLICIES THAT WILL BE RECREATED
-- =====================================================

-- Drop activity_logs policies
DROP POLICY IF EXISTS "System can insert activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.activity_logs;

-- Drop profiles policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Drop member_skills policies
DROP POLICY IF EXISTS "Users can insert their own skills" ON public.member_skills;
DROP POLICY IF EXISTS "Users can update their own skills" ON public.member_skills;
DROP POLICY IF EXISTS "Users can delete their own skills" ON public.member_skills;

-- Drop member_help_requests policies
DROP POLICY IF EXISTS "Users can insert their own help requests" ON public.member_help_requests;
DROP POLICY IF EXISTS "Users can update their own help requests" ON public.member_help_requests;
DROP POLICY IF EXISTS "Users can delete their own help requests" ON public.member_help_requests;

-- Drop members policies
DROP POLICY IF EXISTS "Users can view their own member record" ON public.members;
DROP POLICY IF EXISTS "Admins can manage members" ON public.members;

-- Drop applications policies
DROP POLICY IF EXISTS "Users can view their own application" ON public.applications;
DROP POLICY IF EXISTS "Users can submit their own application" ON public.applications;
DROP POLICY IF EXISTS "Users can update their own pending application" ON public.applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON public.applications;
DROP POLICY IF EXISTS "Admins can update applications" ON public.applications;

-- Drop whatsapp_links policies
DROP POLICY IF EXISTS "Admins can manage WhatsApp links" ON public.whatsapp_links;

-- Drop posts policies
DROP POLICY IF EXISTS "Authors can view their own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can manage posts" ON public.posts;

-- =====================================================
-- PART 3: SECURITY - FIX MUTABLE SEARCH_PATH ON FUNCTIONS
-- =====================================================

-- Now that policies are dropped, we can safely drop and recreate functions

-- Fix is_admin function
DROP FUNCTION IF EXISTS public.is_admin(UUID) CASCADE;
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
DROP FUNCTION IF EXISTS public.is_super_admin(UUID) CASCADE;
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
DROP FUNCTION IF EXISTS public.is_approved_member(UUID) CASCADE;
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
DROP FUNCTION IF EXISTS public.is_user_admin(UUID) CASCADE;
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
DROP FUNCTION IF EXISTS public.log_activity(UUID, TEXT, TEXT, UUID, JSONB, TEXT) CASCADE;
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
-- PART 4: RECREATE POLICIES WITH PERFORMANCE OPTIMIZATIONS
-- =====================================================

-- =====================================================
-- ACTIVITY_LOGS TABLE POLICIES
-- =====================================================

-- More restrictive policy that only allows users to log their own activities
CREATE POLICY "Users can insert their own activity logs"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can view their own activity logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

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
-- PROFILES TABLE POLICIES
-- =====================================================

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- =====================================================
-- MEMBER_SKILLS TABLE POLICIES
-- =====================================================

CREATE POLICY "Users can insert their own skills"
  ON public.member_skills FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own skills"
  ON public.member_skills FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own skills"
  ON public.member_skills FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- MEMBER_HELP_REQUESTS TABLE POLICIES
-- =====================================================

CREATE POLICY "Users can insert their own help requests"
  ON public.member_help_requests FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own help requests"
  ON public.member_help_requests FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own help requests"
  ON public.member_help_requests FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- MEMBERS TABLE POLICIES
-- =====================================================

CREATE POLICY "Users can view their own member record"
  ON public.members FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

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

CREATE POLICY "Users can view their own application"
  ON public.applications FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can submit their own application"
  ON public.applications FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own pending application"
  ON public.applications FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id AND status = 'submitted')
  WITH CHECK ((select auth.uid()) = user_id AND status = 'submitted');

CREATE POLICY "Admins can view all applications"
  ON public.applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = (select auth.uid())
    )
  );

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

CREATE POLICY "Authors can view their own posts"
  ON public.posts FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = author_id);

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
-- VERIFICATION - ENSURE RLS ENABLED ON ALL TABLES
-- =====================================================

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
