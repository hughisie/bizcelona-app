-- Fix RLS on admins table
-- Run this in Supabase SQL Editor

-- Enable RLS on admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can view admin records" ON admins;
DROP POLICY IF EXISTS "Super admins can insert admins" ON admins;
DROP POLICY IF EXISTS "Super admins can manage admins" ON admins;
DROP POLICY IF EXISTS "Users can view their own admin status" ON admins;

-- Recreate policies with correct names and logic

-- 1. Admins can view all admin records
CREATE POLICY "Admins can view admin records"
  ON admins
  FOR SELECT
  TO authenticated
  USING (is_user_admin(auth.uid()));

-- 2. Super admins can insert new admins
CREATE POLICY "Super admins can insert admins"
  ON admins
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- 3. Super admins can update admins
CREATE POLICY "Super admins can update admins"
  ON admins
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- 4. Super admins can delete admins
CREATE POLICY "Super admins can delete admins"
  ON admins
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'admins';

-- Should return: tablename | rowsecurity
--               admins    | true

-- View all policies on admins table
SELECT * FROM pg_policies WHERE tablename = 'admins';
