-- Add company relationship and verification fields to users table
ALTER TABLE authentication_user
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id),
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP WITH TIME ZONE;

-- Create index on company_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_authentication_user_company_id ON authentication_user(company_id);

-- Add comment to new columns
COMMENT ON COLUMN authentication_user.company_id IS 'Reference to the company the user belongs to';
COMMENT ON COLUMN authentication_user.is_verified IS 'Indicates if the trucker account has been verified by the manager';
COMMENT ON COLUMN authentication_user.verification_date IS 'Timestamp when the trucker account was verified'; 