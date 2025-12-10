-- Update validation constraints to match user requirements

-- Drop old constraints
ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS what_do_you_do_min_length,
  DROP CONSTRAINT IF EXISTS hoping_to_get_min_length,
  DROP CONSTRAINT IF EXISTS hope_to_bring_min_length,
  DROP CONSTRAINT IF EXISTS whatsapp_min_length;

-- Add new constraints with updated requirements
ALTER TABLE applications
  -- WhatsApp: must start with + and have at least 10 digits after
  ADD CONSTRAINT whatsapp_format_check CHECK (whatsapp_number ~ '^\+[0-9]{10,}$'),

  -- Text responses: minimum 50 characters
  ADD CONSTRAINT what_do_you_do_min_length CHECK (char_length(what_do_you_do) >= 50),
  ADD CONSTRAINT hoping_to_get_min_length CHECK (char_length(hoping_to_get) >= 50),
  ADD CONSTRAINT hope_to_bring_min_length CHECK (char_length(hope_to_bring) >= 50);
