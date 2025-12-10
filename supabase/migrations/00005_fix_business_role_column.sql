-- Fix business_role column - make it nullable since it's no longer used in the new form
ALTER TABLE applications
  ALTER COLUMN business_role DROP NOT NULL,
  ALTER COLUMN company DROP NOT NULL,
  ALTER COLUMN message DROP NOT NULL;

-- These old columns are kept for historical data but are optional now
COMMENT ON COLUMN applications.business_role IS 'Legacy field - replaced by job_title';
COMMENT ON COLUMN applications.company IS 'Legacy field - replaced by employer_business';
COMMENT ON COLUMN applications.message IS 'Legacy field - replaced by specific questions';
