-- =====================================================
-- 00012: fix events INSERT policy — enforce organiser ownership
-- Closes a spoofing vector where any organiser could insert
-- an event row with an arbitrary organiser_id value.
-- =====================================================

-- Drop and recreate the events INSERT policy to enforce organiser ownership
DROP POLICY IF EXISTS events_insert ON events;

CREATE POLICY events_insert ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (public.is_organiser(auth.uid()) AND auth.uid() = organiser_id)
    OR public.is_admin(auth.uid())
  );
