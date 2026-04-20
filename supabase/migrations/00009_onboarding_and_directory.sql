-- =====================================================
-- 00009: Onboarding, profiles, help_tags, directory
-- =====================================================

-- -----------------------------------------------------
-- PROFILES: add slug, onboarding gate, industry, headline
-- -----------------------------------------------------
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS headline TEXT;

-- Unique constraint on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_slug ON profiles(slug);

-- -----------------------------------------------------
-- APPLICATIONS: expand to match the 13-question form
-- -----------------------------------------------------
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS consent_guidelines BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_privacy BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_contact BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_selective BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_directory BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hopes_to_get TEXT,
  ADD COLUMN IF NOT EXISTS hopes_to_bring TEXT,
  ADD COLUMN IF NOT EXISTS contributor_interest BOOLEAN,
  ADD COLUMN IF NOT EXISTS heard_from TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS additional_info TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT;

-- Keep consent_given as derived convenience
CREATE OR REPLACE FUNCTION sync_consent_given()
RETURNS TRIGGER AS $$
BEGIN
  NEW.consent_given := (
    NEW.consent_guidelines AND NEW.consent_privacy AND
    NEW.consent_contact AND NEW.consent_selective AND NEW.consent_directory
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_consent_given_trigger ON applications;
CREATE TRIGGER sync_consent_given_trigger
  BEFORE INSERT OR UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION sync_consent_given();

-- -----------------------------------------------------
-- HELP TAGS
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS help_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('offered','needed')),
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, direction, tag)
);

CREATE INDEX IF NOT EXISTS idx_help_tags_user_id ON help_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_help_tags_direction_tag ON help_tags(direction, tag);

ALTER TABLE help_tags ENABLE ROW LEVEL SECURITY;

-- Owner can manage their own tags
DROP POLICY IF EXISTS help_tags_owner_all ON help_tags;
CREATE POLICY help_tags_owner_all ON help_tags
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Any authenticated user can read tags for approved, directory-visible members
DROP POLICY IF EXISTS help_tags_read_approved ON help_tags;
CREATE POLICY help_tags_read_approved ON help_tags
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members m
      JOIN profiles p ON p.id = m.user_id
      WHERE m.user_id = help_tags.user_id
        AND m.status = 'approved'
        AND p.show_in_directory = true
    )
  );

-- -----------------------------------------------------
-- SLUG GENERATOR
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION generate_profile_slug(p_full_name TEXT, p_id UUID)
RETURNS TEXT AS $$
DECLARE
  base TEXT;
  candidate TEXT;
  i INT := 0;
BEGIN
  -- Lowercase, strip non-ascii letters/numbers, hyphenate
  base := lower(regexp_replace(
    regexp_replace(coalesce(p_full_name, 'member'), '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  ));
  base := trim(both '-' from base);
  IF base = '' THEN
    base := 'member';
  END IF;

  candidate := base;
  WHILE EXISTS (SELECT 1 FROM profiles WHERE slug = candidate AND id <> p_id) LOOP
    i := i + 1;
    candidate := base || '-' || i;
  END LOOP;

  RETURN candidate;
END;
$$ LANGUAGE plpgsql;

-- Trigger to fill slug on insert/update when full_name changes
CREATE OR REPLACE FUNCTION profiles_set_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.slug IS NULL)
     OR (TG_OP = 'UPDATE' AND (NEW.full_name IS DISTINCT FROM OLD.full_name) AND NEW.slug IS NULL) THEN
    NEW.slug := generate_profile_slug(NEW.full_name, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_set_slug_trigger ON profiles;
CREATE TRIGGER profiles_set_slug_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION profiles_set_slug();

-- Backfill slug for existing profiles
UPDATE profiles SET slug = generate_profile_slug(full_name, id) WHERE slug IS NULL;

-- -----------------------------------------------------
-- PUBLIC SLUG LOOKUP
-- Allow anonymous read of (id, slug, profile_picture_url) only for approved,
-- directory-visible members. SECURITY INVOKER means the caller's policies apply,
-- so we separately grant anon/authenticated SELECT on the view itself below.
-- -----------------------------------------------------
-- security_invoker = false so anon users can read these narrow columns
-- (id, slug, profile_picture_url) without needing a permissive RLS policy
-- on the entire profiles table.
CREATE OR REPLACE VIEW public_profile_slugs
WITH (security_invoker = false) AS
SELECT p.id, p.slug, p.profile_picture_url
FROM profiles p
JOIN members m ON m.user_id = p.id
WHERE m.status = 'approved' AND p.show_in_directory = true;

GRANT SELECT ON public_profile_slugs TO anon, authenticated;

-- -----------------------------------------------------
-- APPROVE / REJECT TRANSACTION
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION approve_application(
  p_application_id UUID,
  p_reviewer_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id FROM applications WHERE id = p_application_id;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Application % not found', p_application_id;
  END IF;

  UPDATE applications
    SET status = 'approved',
        reviewed_by = p_reviewer_id,
        review_notes = p_notes
    WHERE id = p_application_id;

  INSERT INTO members (user_id, status, approved_by, approved_at, show_in_directory)
    VALUES (v_user_id, 'approved', p_reviewer_id, now(), true)
    ON CONFLICT (user_id) DO UPDATE
      SET status = 'approved',
          approved_by = p_reviewer_id,
          approved_at = now();

  PERFORM log_activity(p_reviewer_id, 'application_approved', 'application', p_application_id,
    jsonb_build_object('user_id', v_user_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reject_application(
  p_application_id UUID,
  p_reviewer_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id FROM applications WHERE id = p_application_id;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Application % not found', p_application_id;
  END IF;

  UPDATE applications
    SET status = 'rejected',
        reviewed_by = p_reviewer_id,
        review_notes = p_notes
    WHERE id = p_application_id;

  INSERT INTO members (user_id, status, approved_by, show_in_directory)
    VALUES (v_user_id, 'rejected', p_reviewer_id, false)
    ON CONFLICT (user_id) DO UPDATE
      SET status = 'rejected';

  PERFORM log_activity(p_reviewer_id, 'application_rejected', 'application', p_application_id,
    jsonb_build_object('user_id', v_user_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------
-- STORAGE BUCKET POLICIES (profile-pictures)
-- The bucket itself is created via the Supabase dashboard (see deployment notes).
-- -----------------------------------------------------

-- Allow authenticated users to upload their own picture (path = user_id/*)
DROP POLICY IF EXISTS profile_pictures_upload_own ON storage.objects;
CREATE POLICY profile_pictures_upload_own ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'profile-pictures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS profile_pictures_update_own ON storage.objects;
CREATE POLICY profile_pictures_update_own ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'profile-pictures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS profile_pictures_delete_own ON storage.objects;
CREATE POLICY profile_pictures_delete_own ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'profile-pictures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Anyone can read profile pictures (public bucket)
DROP POLICY IF EXISTS profile_pictures_read_all ON storage.objects;
CREATE POLICY profile_pictures_read_all ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'profile-pictures');
