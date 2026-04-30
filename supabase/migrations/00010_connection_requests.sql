-- =====================================================
-- 00010: connection_requests table
-- Tracks WhatsApp connection clicks between members
-- =====================================================

CREATE TABLE IF NOT EXISTS connection_requests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  clicked_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reminder_sent_at TIMESTAMPTZ,           -- when the 48h email went out
  reply_confirmed  BOOLEAN,               -- null=unknown, true=replied, false=no reply
  confirmed_at     TIMESTAMPTZ            -- when they answered the reminder email
);

-- Index for quick lookups by initiator and recipient
CREATE INDEX IF NOT EXISTS idx_connection_requests_initiator ON connection_requests(initiator_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_recipient ON connection_requests(recipient_id);

-- -----------------------------------------------------
-- RLS
-- -----------------------------------------------------
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;

-- Initiators can read their own rows
DROP POLICY IF EXISTS connection_requests_select_own ON connection_requests;
CREATE POLICY connection_requests_select_own ON connection_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = initiator_id);

-- Admins can read all rows
DROP POLICY IF EXISTS connection_requests_select_admin ON connection_requests;
CREATE POLICY connection_requests_select_admin ON connection_requests
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Authenticated users can insert their own rows
DROP POLICY IF EXISTS connection_requests_insert_own ON connection_requests;
CREATE POLICY connection_requests_insert_own ON connection_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = initiator_id);

-- Admins can update any row (e.g. mark reminder_sent_at, reply_confirmed)
DROP POLICY IF EXISTS connection_requests_update_admin ON connection_requests;
CREATE POLICY connection_requests_update_admin ON connection_requests
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- UPDATE is admin-only via RLS.
-- The /api/connections/confirm and /api/cron/connection-reminders endpoints
-- use the Supabase service_role key (server-side), which bypasses RLS.
-- Do NOT add an anon or authenticated UPDATE policy — service role is correct here.

COMMENT ON TABLE connection_requests IS
  'Tracks WhatsApp connection clicks between members. Each row represents one click by initiator_id on recipient_id''s connect button.';

COMMENT ON COLUMN connection_requests.reminder_sent_at IS
  'Timestamp of the 48-hour follow-up email sent to the initiator asking if the recipient replied.';

COMMENT ON COLUMN connection_requests.reply_confirmed IS
  'NULL = not yet asked / unknown; TRUE = initiator confirmed recipient replied; FALSE = no reply.';
