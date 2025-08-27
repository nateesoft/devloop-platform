-- Reset Database Script for UUID Migration
-- This script will drop and recreate the database with UUID support

-- Connect to postgres database first
\c postgres;

-- Drop existing database (this will remove all data!)
DROP DATABASE IF EXISTS lowcode_db;

-- Recreate the database
CREATE DATABASE lowcode_db WITH 
  ENCODING = 'UTF8' 
  LC_COLLATE = 'en_US.utf8' 
  LC_CTYPE = 'en_US.utf8' 
  TEMPLATE = template0;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE lowcode_db TO lowcode_app;

-- Connect to new database
\c lowcode_db;

-- Create schema (if using schema other than public)
-- CREATE SCHEMA IF NOT EXISTS lowcode;
-- GRANT USAGE ON SCHEMA lowcode TO lowcode_app;
-- GRANT CREATE ON SCHEMA lowcode TO lowcode_app;

-- Note: After running this script, restart your NestJS application
-- TypeORM will automatically create the new schema with UUID support