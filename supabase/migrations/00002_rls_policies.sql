-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- These policies control who can access what data
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Anyone can view profiles (for member directory)
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- MEMBER SKILLS POLICIES
-- =====================================================

-- Anyone can view skills
CREATE POLICY "Skills are viewable by authenticated users"
  ON member_skills FOR SELECT
  TO authenticated
  USING (true);

-- Users can manage their own skills
CREATE POLICY "Users can insert their own skills"
  ON member_skills FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills"
  ON member_skills FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skills"
  ON member_skills FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- MEMBER HELP REQUESTS POLICIES
-- =====================================================

-- Anyone can view help requests
CREATE POLICY "Help requests are viewable by authenticated users"
  ON member_help_requests FOR SELECT
  TO authenticated
  USING (true);

-- Users can manage their own help requests
CREATE POLICY "Users can insert their own help requests"
  ON member_help_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own help requests"
  ON member_help_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own help requests"
  ON member_help_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- MEMBERS POLICIES
-- =====================================================

-- Authenticated users can view approved/active members
CREATE POLICY "Approved members are viewable by authenticated users"
  ON members FOR SELECT
  TO authenticated
  USING (status IN ('approved', 'active'));

-- Users can view their own member record
CREATE POLICY "Users can view their own member record"
  ON members FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can manage all member records
CREATE POLICY "Admins can manage members"
  ON members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- =====================================================
-- APPLICATIONS POLICIES
-- =====================================================

-- Users can view their own application
CREATE POLICY "Users can view their own application"
  ON applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can submit their own application
CREATE POLICY "Users can submit their own application"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending application
CREATE POLICY "Users can update their own pending application"
  ON applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'submitted')
  WITH CHECK (auth.uid() = user_id AND status = 'submitted');

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Admins can update applications (for review)
CREATE POLICY "Admins can update applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- =====================================================
-- ADMINS POLICIES
-- =====================================================

-- Admins can view all admin records
CREATE POLICY "Admins can view admin records"
  ON admins FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Only super admins can manage admin roles
CREATE POLICY "Super admins can manage admins"
  ON admins FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.role = 'super_admin'
    )
  );

-- =====================================================
-- WHATSAPP LINKS POLICIES
-- =====================================================

-- Authenticated users can view active links
CREATE POLICY "Users can view active WhatsApp links"
  ON whatsapp_links FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Only admins can manage WhatsApp links
CREATE POLICY "Admins can manage WhatsApp links"
  ON whatsapp_links FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- =====================================================
-- POSTS POLICIES
-- =====================================================

-- Anyone can view published posts
CREATE POLICY "Published posts are viewable by everyone"
  ON posts FOR SELECT
  TO authenticated
  USING (published = true);

-- Authors can view their own draft posts
CREATE POLICY "Authors can view their own posts"
  ON posts FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

-- Admins can manage all posts
CREATE POLICY "Admins can manage posts"
  ON posts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- =====================================================
-- ACTIVITY LOGS POLICIES
-- =====================================================

-- Users can view their own activity logs
CREATE POLICY "Users can view their own activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- System can insert activity logs
CREATE POLICY "System can insert activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = user_id
    AND admins.role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is approved member
CREATE OR REPLACE FUNCTION is_approved_member(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM members
    WHERE members.user_id = user_id
    AND members.status IN ('approved', 'active')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
