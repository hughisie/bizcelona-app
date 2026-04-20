-- Fix admin access issue - FINAL VERSION
-- Removes recursive policies that cause infinite loops

-- Drop ALL existing policies on admins table
DROP POLICY IF EXISTS "Super admins can manage admins" ON admins;
DROP POLICY IF EXISTS "Users can view their own admin status" ON admins;
DROP POLICY IF EXISTS "Super admins can view all admins" ON admins;
DROP POLICY IF EXISTS "Super admins can insert admins" ON admins;
DROP POLICY IF EXISTS "Super admins can update admins" ON admins;
DROP POLICY IF EXISTS "Super admins can delete admins" ON admins;
DROP POLICY IF EXISTS "Admins can view admin records" ON admins;
DROP POLICY IF EXISTS "Super admins can manage admin records" ON admins;

-- Simple, non-recursive policy: Users can only view their own admin record
-- This is all we need for isUserAdmin() to work
CREATE POLICY "Users can view own admin record"
  ON admins
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- For INSERT/UPDATE/DELETE, we'll temporarily disable RLS restrictions
-- and handle permissions in application code, or we can use a service role
-- Let's keep it simple and only allow through service role for now
CREATE POLICY "Service role can manage admins"
  ON admins
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Verify the setup
SELECT
  u.email,
  a.role,
  a.granted_at
FROM admins a
JOIN auth.users u ON u.id = a.user_id
WHERE u.email IN ('owen@bizcelona.com', 'matthew@bizcelona.com')
ORDER BY u.email;
