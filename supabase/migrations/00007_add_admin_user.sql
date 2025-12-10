-- Add your user as super admin
-- Replace the email below with your actual email address

INSERT INTO admins (user_id, role, granted_at)
SELECT
  id,
  'super_admin',
  NOW()
FROM auth.users
WHERE email = 'YOUR_EMAIL_HERE'
ON CONFLICT (user_id) DO NOTHING;

-- Create a helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_user_admin(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = user_id_param
  );
END;
$$;

-- Add RLS policies for admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admins can view all admin records
CREATE POLICY "Admins can view admin records"
  ON admins
  FOR SELECT
  TO authenticated
  USING (is_user_admin(auth.uid()));

-- Only super admins can insert new admins
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

-- Add RLS policies for applications table (admin access)
CREATE POLICY "Admins can view all applications"
  ON applications
  FOR SELECT
  TO authenticated
  USING (
    is_user_admin(auth.uid()) OR user_id = auth.uid()
  );

CREATE POLICY "Admins can update applications"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (is_user_admin(auth.uid()));

-- Add comments
COMMENT ON FUNCTION is_user_admin IS 'Helper function to check if a user has admin privileges';
