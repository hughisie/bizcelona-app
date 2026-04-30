-- =====================================================
-- 00011: organiser_roles + events tables
-- Lets approved organisers post events to the community
-- =====================================================

-- -----------------------------------------------------
-- ORGANISER_ROLES
-- Tracks which members have been granted organiser rights
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS organiser_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organiser_roles_user_id ON organiser_roles(user_id);

-- -----------------------------------------------------
-- HELPER FUNCTION: is_organiser
-- Same pattern as is_admin() in migration 00008
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_organiser(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organiser_roles WHERE organiser_roles.user_id = $1
  )
$$;

COMMENT ON FUNCTION public.is_organiser IS
  'Helper function to check if a user has organiser privileges. Uses SET search_path for security.';

-- -----------------------------------------------------
-- RLS: organiser_roles
-- -----------------------------------------------------
ALTER TABLE organiser_roles ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read organiser roles (so members can see who can post events)
DROP POLICY IF EXISTS organiser_roles_select_authenticated ON organiser_roles;
CREATE POLICY organiser_roles_select_authenticated ON organiser_roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can grant organiser roles
DROP POLICY IF EXISTS organiser_roles_insert_admin ON organiser_roles;
CREATE POLICY organiser_roles_insert_admin ON organiser_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Only admins can revoke organiser roles
DROP POLICY IF EXISTS organiser_roles_delete_admin ON organiser_roles;
CREATE POLICY organiser_roles_delete_admin ON organiser_roles
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- -----------------------------------------------------
-- EVENTS
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  event_date      TIMESTAMPTZ NOT NULL,
  end_date        TIMESTAMPTZ,
  location        TEXT,
  cover_image_url TEXT,
  external_url    TEXT NOT NULL,
  platform        TEXT NOT NULL CHECK (platform IN ('luma', 'eventbrite', 'meetup', 'other')),
  category        TEXT NOT NULL CHECK (category IN ('networking', 'workshop', 'social', 'other')),
  organiser_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_published    BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_organiser_id ON events(organiser_id);
CREATE INDEX IF NOT EXISTS idx_events_event_date    ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_is_published  ON events(is_published);

-- -----------------------------------------------------
-- AUTO-UPDATE updated_at TRIGGER
-- Same pattern as profiles trigger
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.events_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS events_set_updated_at_trigger ON events;
CREATE TRIGGER events_set_updated_at_trigger
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION public.events_set_updated_at();

-- -----------------------------------------------------
-- SLUG GENERATOR FOR EVENTS
-- Produces a URL-safe slug from the event title
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_event_slug(p_title TEXT, p_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  base      TEXT;
  candidate TEXT;
  i         INT := 0;
BEGIN
  base := lower(regexp_replace(
    regexp_replace(coalesce(p_title, 'event'), '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  ));
  base := trim(both '-' from base);
  IF base = '' THEN
    base := 'event';
  END IF;

  candidate := base;
  WHILE EXISTS (SELECT 1 FROM public.events WHERE slug = candidate AND id <> p_id) LOOP
    i         := i + 1;
    candidate := base || '-' || i;
  END LOOP;

  RETURN candidate;
END;
$$;

-- Trigger to auto-set slug from title on insert (or when title changes and slug is null)
CREATE OR REPLACE FUNCTION public.events_set_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.slug IS NULL)
     OR (TG_OP = 'UPDATE' AND (NEW.title IS DISTINCT FROM OLD.title) AND NEW.slug IS NULL) THEN
    NEW.slug := public.generate_event_slug(NEW.title, NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS events_set_slug_trigger ON events;
CREATE TRIGGER events_set_slug_trigger
  BEFORE INSERT OR UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION public.events_set_slug();

-- -----------------------------------------------------
-- RLS: events
-- -----------------------------------------------------
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- No TO clause intentionally — applies to both anon and authenticated roles.
-- Required: the public marketing website embed (/api/events/public) fetches
-- events without auth tokens. Anonymous access to published events is by design.
-- Anyone (including anonymous) can read published events
DROP POLICY IF EXISTS events_select_published ON events;
CREATE POLICY events_select_published ON events
  FOR SELECT
  USING (is_published = true);

-- Admins can read all events including unpublished
DROP POLICY IF EXISTS events_select_admin ON events;
CREATE POLICY events_select_admin ON events
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Organisers can read their own unpublished events
DROP POLICY IF EXISTS events_select_own ON events;
CREATE POLICY events_select_own ON events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = organiser_id);

-- Organisers or admins can create events
DROP POLICY IF EXISTS events_insert ON events;
CREATE POLICY events_insert ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_organiser(auth.uid()) OR public.is_admin(auth.uid())
  );

-- Organisers can update their own events; admins can update any
DROP POLICY IF EXISTS events_update ON events;
CREATE POLICY events_update ON events
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = organiser_id OR public.is_admin(auth.uid())
  );

-- Organisers can delete their own events; admins can delete any
DROP POLICY IF EXISTS events_delete ON events;
CREATE POLICY events_delete ON events
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = organiser_id OR public.is_admin(auth.uid())
  );

-- -----------------------------------------------------
-- COMMENTS
-- -----------------------------------------------------
COMMENT ON TABLE organiser_roles IS
  'Tracks which members have been granted permission to post events. Admins manage this list.';

COMMENT ON TABLE events IS
  'Community events posted by organisers. Published events are publicly visible without auth.';

COMMENT ON COLUMN events.slug IS
  'URL-friendly identifier. Auto-generated from title on insert if not supplied.';

COMMENT ON COLUMN events.external_url IS
  'Link to the actual event on Luma, Eventbrite, Meetup, etc. Bizcelona is a directory, not a ticketing platform.';

COMMENT ON COLUMN events.platform IS
  'Source platform: luma | eventbrite | meetup | other.';

COMMENT ON COLUMN events.category IS
  'Event type: networking | workshop | social | other.';
