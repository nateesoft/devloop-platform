-- TON Low-code Platform - PostgreSQL Database Initialization Script
-- This script creates the necessary databases and users for the platform

-- Create additional databases if needed
CREATE DATABASE tonlowcode_dev;
CREATE DATABASE tonlowcode_test;

-- Create application-specific user with limited privileges
CREATE USER app_user WITH PASSWORD 'app_password123';

-- Grant necessary privileges to the application user
GRANT CONNECT ON DATABASE tonlowcode TO app_user;
GRANT CONNECT ON DATABASE tonlowcode_dev TO app_user;
GRANT CONNECT ON DATABASE tonlowcode_test TO app_user;

-- Switch to tonlowcode database to create schema
\c tonlowcode;

-- Create schema for the application
CREATE SCHEMA IF NOT EXISTS app_schema;

-- Grant schema usage and creation privileges
GRANT USAGE ON SCHEMA app_schema TO app_user;
GRANT CREATE ON SCHEMA app_schema TO app_user;

-- Grant privileges on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA app_schema GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA app_schema GRANT USAGE, SELECT ON SEQUENCES TO app_user;

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create extension for full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create basic audit log table
CREATE TABLE IF NOT EXISTS app_schema.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(255) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON app_schema.audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON app_schema.audit_log(timestamp);

-- Create basic users table for the low-code platform
CREATE TABLE IF NOT EXISTS app_schema.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_username ON app_schema.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON app_schema.users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON app_schema.users(is_active);

-- Insert default admin user (password should be changed in production)
INSERT INTO app_schema.users (username, email, password_hash, first_name, last_name, is_admin)
VALUES ('admin', 'admin@tonlowcode.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewDyYmvOHnkpY4qC', 'Admin', 'User', TRUE)
ON CONFLICT (username) DO NOTHING;

-- Create applications table for low-code platform
CREATE TABLE IF NOT EXISTS app_schema.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    configuration JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES app_schema.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for applications
CREATE INDEX IF NOT EXISTS idx_applications_name ON app_schema.applications(name);
CREATE INDEX IF NOT EXISTS idx_applications_active ON app_schema.applications(is_active);
CREATE INDEX IF NOT EXISTS idx_applications_created_by ON app_schema.applications(created_by);

COMMENT ON DATABASE tonlowcode IS 'TON Low-code Platform Main Database';
COMMENT ON SCHEMA app_schema IS 'Main application schema for TON Low-code Platform';