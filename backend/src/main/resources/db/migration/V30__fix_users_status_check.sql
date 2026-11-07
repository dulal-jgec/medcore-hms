-- Drop the old constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;

-- Add the new constraint with all the necessary statuses
ALTER TABLE users ADD CONSTRAINT users_status_check 
CHECK (status IN ('ACTIVE', 'INACTIVE', 'PENDING_VERIFICATION', 'INVITATION_EXPIRED', 'SUSPENDED', 'BLOCKED'));