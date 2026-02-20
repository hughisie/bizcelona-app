-- Fix admin access issue
-- This allows users to check their own admin status while preventing unauthorized access

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Super admins can manage admins" ON admins;

-- Create separate policies for different operations

-- 1. Allow users to check if THEY are an admin (for their own user_id only)
CREATE POLICY "Users can view their own admin status"
  ON admins
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 2. Super admins can view all admin records
CREATE POLICY "Super admins can view all admins"
  ON admins
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- 3. Super admins can insert new admins
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

-- 4. Super admins can update admin records
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

-- 5. Super admins can delete admin records
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

-- Now add Owen and Matthew as super admins
INSERT INTO admins (user_id, role, granted_at)
SELECT
  id,
  'super_admin',
  NOW()
FROM auth.users
WHERE email IN ('owen@bizcelona.com', 'matthew@bizcelona.com')
ON CONFLICT (user_id) DO UPDATE
SET role = 'super_admin',
    granted_at = NOW();

-- Verify the admins were added
SELECT
  u.email,
  a.role,
  a.granted_at
FROM admins a
JOIN auth.users u ON u.id = a.user_id
WHERE u.email IN ('owen@bizcelona.com', 'matthew@bizcelona.com')
ORDER BY u.email;
