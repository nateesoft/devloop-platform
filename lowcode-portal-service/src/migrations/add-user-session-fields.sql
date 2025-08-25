-- Migration: Add session tracking fields to users table
-- Date: 2025-01-25
-- Description: Add fields to support Redis session management and prevent duplicate logins

ALTER TABLE users 
ADD COLUMN current_session_id VARCHAR(255) NULL,
ADD COLUMN last_login_at TIMESTAMP NULL,
ADD COLUMN last_login_ip VARCHAR(45) NULL;

-- Add indexes for better performance
CREATE INDEX idx_users_current_session_id ON users(current_session_id);
CREATE INDEX idx_users_last_login_at ON users(last_login_at);

-- Comments
COMMENT ON COLUMN users.current_session_id IS 'Current active session ID stored in Redis';
COMMENT ON COLUMN users.last_login_at IS 'Timestamp of last successful login';
COMMENT ON COLUMN users.last_login_ip IS 'IP address of last login';