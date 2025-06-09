-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    manager_email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status BOOLEAN DEFAULT true
);

-- Create index on manager_email for faster lookups
CREATE INDEX idx_companies_manager_email ON companies(manager_email);

-- Add comment to table
COMMENT ON TABLE companies IS 'Stores company information and their manager details'; 