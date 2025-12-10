-- Update applications table to match Google Form structure
ALTER TABLE applications
  -- Remove phone_number (not in Google Form)
  DROP COLUMN IF EXISTS phone_number,

  -- Update/rename existing columns
  ALTER COLUMN business_role SET DATA TYPE TEXT,
  ALTER COLUMN company SET DATA TYPE TEXT,

  -- Rename columns to match new structure
  ADD COLUMN IF NOT EXISTS job_title TEXT,
  ADD COLUMN IF NOT EXISTS employer_business TEXT,
  ADD COLUMN IF NOT EXISTS industry_sector TEXT,

  -- Replace single message with specific questions
  ADD COLUMN IF NOT EXISTS what_do_you_do TEXT,
  ADD COLUMN IF NOT EXISTS hoping_to_get TEXT,
  ADD COLUMN IF NOT EXISTS hope_to_bring TEXT,

  -- New fields from Google Form
  ADD COLUMN IF NOT EXISTS linkedin_profile TEXT,
  ADD COLUMN IF NOT EXISTS how_heard_about TEXT,
  ADD COLUMN IF NOT EXISTS contributor_interest BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS additional_info TEXT;

-- Update the message column check constraint
ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_message_check;

-- Make new columns required (NOT NULL) except optional ones
ALTER TABLE applications
  ALTER COLUMN whatsapp_number SET NOT NULL,
  ALTER COLUMN what_do_you_do SET NOT NULL,
  ALTER COLUMN hoping_to_get SET NOT NULL,
  ALTER COLUMN hope_to_bring SET NOT NULL,
  ALTER COLUMN linkedin_profile SET NOT NULL,
  ALTER COLUMN how_heard_about SET NOT NULL,
  ALTER COLUMN industry_sector SET NOT NULL;

-- Add length constraints
ALTER TABLE applications
  ADD CONSTRAINT whatsapp_min_length CHECK (char_length(whatsapp_number) >= 9),
  ADD CONSTRAINT what_do_you_do_min_length CHECK (char_length(what_do_you_do) >= 20),
  ADD CONSTRAINT hoping_to_get_min_length CHECK (char_length(hoping_to_get) >= 20),
  ADD CONSTRAINT hope_to_bring_min_length CHECK (char_length(hope_to_bring) >= 20);

-- Comments for documentation
COMMENT ON COLUMN applications.what_do_you_do IS 'One or two sentence intro about what the applicant does';
COMMENT ON COLUMN applications.hoping_to_get IS 'What the applicant hopes to get from Bizcelona';
COMMENT ON COLUMN applications.hope_to_bring IS 'What the applicant hopes to bring to Bizcelona (give first model)';
COMMENT ON COLUMN applications.how_heard_about IS 'How they heard about Bizcelona, include referrer name if applicable';
COMMENT ON COLUMN applications.contributor_interest IS 'Whether they want to be an integral part of the new community';
COMMENT ON COLUMN applications.additional_info IS 'Any other relevant information (optional)';
