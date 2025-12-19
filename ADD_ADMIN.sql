-- Add Owen Hughes as super admin
-- Run this in your Supabase SQL Editor

INSERT INTO admins (user_id, role, granted_at)
SELECT
  id,
  'super_admin',
  NOW()
FROM auth.users
WHERE email = 'owen@bizcelona.com'
ON CONFLICT (user_id) DO NOTHING;

-- Verify it worked
SELECT
  u.email,
  a.role,
  a.granted_at
FROM admins a
JOIN auth.users u ON u.id = a.user_id
WHERE u.email = 'owen@bizcelona.com';
