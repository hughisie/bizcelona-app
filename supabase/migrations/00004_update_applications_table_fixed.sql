-- Update applications table to match Google Form structure
-- This migration handles existing data gracefully

-- Step 1: Add new columns first (all nullable initially)
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS job_title TEXT,
  ADD COLUMN IF NOT EXISTS employer_business TEXT,
  ADD COLUMN IF NOT EXISTS industry_sector TEXT,
  ADD COLUMN IF NOT EXISTS what_do_you_do TEXT,
  ADD COLUMN IF NOT EXISTS hoping_to_get TEXT,
  ADD COLUMN IF NOT EXISTS hope_to_bring TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_profile TEXT,
  ADD COLUMN IF NOT EXISTS how_heard_about TEXT,
  ADD COLUMN IF NOT EXISTS contributor_interest BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS additional_info TEXT;

-- Step 2: Update existing rows with placeholder data (if any exist)
UPDATE applications
SET
  job_title = COALESCE(job_title, business_role, 'Not provided'),
  employer_business = COALESCE(employer_business, company, 'Not provided'),
  industry_sector = COALESCE(industry_sector, 'Not provided'),
  what_do_you_do = COALESCE(what_do_you_do, message, 'Migration placeholder - awaiting update'),
  hoping_to_get = COALESCE(hoping_to_get, 'Migration placeholder - awaiting update'),
  hope_to_bring = COALESCE(hope_to_bring, 'Migration placeholder - awaiting update'),
  linkedin_profile = COALESCE(linkedin_profile, 'https://linkedin.com'),
  how_heard_about = COALESCE(how_heard_about, 'Not provided'),
  whatsapp_number = COALESCE(whatsapp_number, phone_number, 'Not provided')
WHERE
  job_title IS NULL
  OR employer_business IS NULL
  OR industry_sector IS NULL
  OR what_do_you_do IS NULL
  OR hoping_to_get IS NULL
  OR hope_to_bring IS NULL
  OR linkedin_profile IS NULL
  OR how_heard_about IS NULL
  OR whatsapp_number IS NULL;

-- Step 3: Now safe to set NOT NULL constraints
ALTER TABLE applications
  ALTER COLUMN whatsapp_number SET NOT NULL,
  ALTER COLUMN what_do_you_do SET NOT NULL,
  ALTER COLUMN hoping_to_get SET NOT NULL,
  ALTER COLUMN hope_to_bring SET NOT NULL,
  ALTER COLUMN linkedin_profile SET NOT NULL,
  ALTER COLUMN how_heard_about SET NOT NULL,
  ALTER COLUMN industry_sector SET NOT NULL;

-- Step 4: Drop old constraint and phone_number column
ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_message_check,
  DROP COLUMN IF EXISTS phone_number;

-- Step 5: Add length constraints (only for new submissions)
ALTER TABLE applications
  ADD CONSTRAINT whatsapp_min_length CHECK (char_length(whatsapp_number) >= 9),
  ADD CONSTRAINT what_do_you_do_min_length CHECK (char_length(what_do_you_do) >= 20),
  ADD CONSTRAINT hoping_to_get_min_length CHECK (char_length(hoping_to_get) >= 20),
  ADD CONSTRAINT hope_to_bring_min_length CHECK (char_length(hope_to_bring) >= 20);

-- Step 6: Add helpful comments for documentation
COMMENT ON COLUMN applications.job_title IS 'Job title of the applicant';
COMMENT ON COLUMN applications.employer_business IS 'Business name or employer';
COMMENT ON COLUMN applications.industry_sector IS 'Industry or sector of work';
COMMENT ON COLUMN applications.what_do_you_do IS 'One or two sentence intro about what the applicant does';
COMMENT ON COLUMN applications.hoping_to_get IS 'What the applicant hopes to get from Bizcelona';
COMMENT ON COLUMN applications.hope_to_bring IS 'What the applicant hopes to bring to Bizcelona (give first model)';
COMMENT ON COLUMN applications.how_heard_about IS 'How they heard about Bizcelona, include referrer name if applicable';
COMMENT ON COLUMN applications.contributor_interest IS 'Whether they want to be an integral part of the new community';
COMMENT ON COLUMN applications.additional_info IS 'Any other relevant information (optional)';
