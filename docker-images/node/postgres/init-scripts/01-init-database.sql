-- TON Lowcode Platform - Database Initialization Script
-- This script sets up the initial database structure

-- Set timezone to UTC
SET timezone = 'UTC';

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- For text search
CREATE EXTENSION IF NOT EXISTS "unaccent";   -- For text normalization
CREATE EXTENSION IF NOT EXISTS "btree_gin";  -- For better indexing
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- For query statistics

-- Create application user (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'lowcode_app') THEN
        CREATE ROLE lowcode_app WITH LOGIN PASSWORD 'lowcode_app_password_2024';
    END IF;
END
$$;

-- Grant permissions to application user
GRANT CONNECT ON DATABASE lowcode_db TO lowcode_app;
GRANT USAGE ON SCHEMA public TO lowcode_app;
GRANT CREATE ON SCHEMA public TO lowcode_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO lowcode_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO lowcode_app;

-- Create enum types for the lowcode platform
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
CREATE TYPE component_type AS ENUM ('ui', 'logic', 'data', 'custom');
CREATE TYPE flow_status AS ENUM ('draft', 'active', 'inactive', 'archived');
CREATE TYPE node_type AS ENUM ('start', 'end', 'action', 'condition', 'loop', 'parallel');
CREATE TYPE execution_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE media_type AS ENUM ('image', 'video', 'audio', 'document', 'archive');
CREATE TYPE secret_type AS ENUM ('api_key', 'database_url', 'oauth_token', 'certificate', 'other');

-- Create core tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    password_hash VARCHAR(255), -- For local auth, nullable if using Keycloak only
    avatar_url TEXT,
    status user_status DEFAULT 'pending',
    keycloak_id VARCHAR(255) UNIQUE,
    preferences JSONB DEFAULT '{}',
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User groups table
CREATE TABLE IF NOT EXISTS user_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User group memberships
CREATE TABLE IF NOT EXISTS user_group_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    added_by UUID REFERENCES users(id),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, group_id)
);

-- Projects table
CREATE TABLE IF NOT EXISTS my_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    settings JSONB DEFAULT '{}',
    owner_id UUID NOT NULL REFERENCES users(id),
    team_id UUID REFERENCES user_groups(id),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Components table
CREATE TABLE IF NOT EXISTS components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    type component_type NOT NULL,
    description TEXT,
    definition JSONB NOT NULL,
    version VARCHAR(20) DEFAULT '1.0.0',
    is_template BOOLEAN DEFAULT false,
    tags TEXT[],
    created_by UUID NOT NULL REFERENCES users(id),
    project_id UUID REFERENCES my_projects(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Component history for versioning
CREATE TABLE IF NOT EXISTS component_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    definition JSONB NOT NULL,
    change_summary TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Flows table
CREATE TABLE IF NOT EXISTS flows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    definition JSONB NOT NULL,
    status flow_status DEFAULT 'draft',
    version VARCHAR(20) DEFAULT '1.0.0',
    tags TEXT[],
    created_by UUID NOT NULL REFERENCES users(id),
    project_id UUID REFERENCES my_projects(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Flow history for versioning
CREATE TABLE IF NOT EXISTS flow_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    definition JSONB NOT NULL,
    change_summary TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Flow executions table
CREATE TABLE IF NOT EXISTS flow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flow_id UUID NOT NULL REFERENCES flows(id),
    execution_id VARCHAR(100) UNIQUE NOT NULL, -- For external tracking
    input_data JSONB,
    output_data JSONB,
    status execution_status DEFAULT 'pending',
    error_message TEXT,
    started_by UUID REFERENCES users(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    execution_time_ms INTEGER,
    metadata JSONB DEFAULT '{}'
);

-- Pages table
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    content JSONB NOT NULL,
    layout JSONB DEFAULT '{}',
    seo_meta JSONB DEFAULT '{}',
    is_published BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES users(id),
    project_id UUID REFERENCES my_projects(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, slug)
);

-- Page history for versioning
CREATE TABLE IF NOT EXISTS page_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content JSONB NOT NULL,
    layout JSONB DEFAULT '{}',
    change_summary TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Services table (external API integrations)
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    service_type VARCHAR(50) NOT NULL,
    configuration JSONB NOT NULL,
    credentials JSONB, -- Encrypted sensitive data
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    project_id UUID REFERENCES my_projects(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Media files table
CREATE TABLE IF NOT EXISTS media_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(500) NOT NULL,
    original_name VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_path TEXT NOT NULL,
    media_type media_type NOT NULL,
    metadata JSONB DEFAULT '{}',
    folder_id UUID REFERENCES media_folders(id),
    uploaded_by UUID NOT NULL REFERENCES users(id),
    project_id UUID REFERENCES my_projects(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Media folders table
CREATE TABLE IF NOT EXISTS media_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    parent_id UUID REFERENCES media_folders(id),
    path TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    project_id UUID REFERENCES my_projects(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Secret keys table (for Vault integration)
CREATE TABLE IF NOT EXISTS secret_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_name VARCHAR(200) NOT NULL,
    description TEXT,
    secret_type secret_type DEFAULT 'other',
    vault_path TEXT, -- Path in Vault if using Vault storage
    encrypted_value TEXT, -- Fallback encrypted storage if Vault unavailable
    is_vault_stored BOOLEAN DEFAULT false,
    tags TEXT[],
    created_by UUID NOT NULL REFERENCES users(id),
    project_id UUID REFERENCES my_projects(id),
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notes table (documentation system)
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'markdown',
    tags TEXT[],
    is_public BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES users(id),
    project_id UUID REFERENCES my_projects(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Database connections table
CREATE TABLE IF NOT EXISTS database_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    connection_type VARCHAR(50) NOT NULL,
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL,
    database_name VARCHAR(200) NOT NULL,
    username VARCHAR(100) NOT NULL,
    password_encrypted TEXT NOT NULL,
    ssl_config JSONB DEFAULT '{}',
    connection_params JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_tested_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES users(id),
    project_id UUID REFERENCES my_projects(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Database queries table (saved queries)
CREATE TABLE IF NOT EXISTS database_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    sql_query TEXT NOT NULL,
    parameters JSONB DEFAULT '[]',
    connection_id UUID NOT NULL REFERENCES database_connections(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    project_id UUID REFERENCES my_projects(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_keycloak_id ON users(keycloak_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_group_memberships_user_id ON user_group_memberships(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_group_memberships_group_id ON user_group_memberships(group_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_my_projects_owner_id ON my_projects(owner_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_my_projects_team_id ON my_projects(team_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_my_projects_status ON my_projects(status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_components_created_by ON components(created_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_components_project_id ON components(project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_components_type ON components(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_components_is_template ON components(is_template);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flows_created_by ON flows(created_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flows_project_id ON flows(project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flows_status ON flows(status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flow_executions_flow_id ON flow_executions(flow_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flow_executions_status ON flow_executions(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flow_executions_started_by ON flow_executions(started_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flow_executions_started_at ON flow_executions(started_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pages_project_id ON pages(project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pages_is_published ON pages(is_published);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_created_by ON services(created_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_project_id ON services(project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_is_active ON services(is_active);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_files_folder_id ON media_files(folder_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_files_uploaded_by ON media_files(uploaded_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_files_project_id ON media_files(project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_files_media_type ON media_files(media_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_secret_keys_created_by ON secret_keys(created_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_secret_keys_project_id ON secret_keys(project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_secret_keys_is_vault_stored ON secret_keys(is_vault_stored);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Create GIN indexes for JSONB columns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_preferences_gin ON users USING gin(preferences);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_components_definition_gin ON components USING gin(definition);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flows_definition_gin ON flows USING gin(definition);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pages_content_gin ON pages USING gin(content);

-- Create text search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_name_trgm ON users USING gin((first_name || ' ' || last_name) gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_components_name_trgm ON components USING gin(name gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flows_name_trgm ON flows USING gin(name gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pages_title_trgm ON pages USING gin(title gin_trgm_ops);

-- Create functions for updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_groups_updated_at ON user_groups;
CREATE TRIGGER update_user_groups_updated_at 
    BEFORE UPDATE ON user_groups 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_my_projects_updated_at ON my_projects;
CREATE TRIGGER update_my_projects_updated_at 
    BEFORE UPDATE ON my_projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_components_updated_at ON components;
CREATE TRIGGER update_components_updated_at 
    BEFORE UPDATE ON components 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_flows_updated_at ON flows;
CREATE TRIGGER update_flows_updated_at 
    BEFORE UPDATE ON flows 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at 
    BEFORE UPDATE ON pages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON services 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_media_files_updated_at ON media_files;
CREATE TRIGGER update_media_files_updated_at 
    BEFORE UPDATE ON media_files 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_media_folders_updated_at ON media_folders;
CREATE TRIGGER update_media_folders_updated_at 
    BEFORE UPDATE ON media_folders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_secret_keys_updated_at ON secret_keys;
CREATE TRIGGER update_secret_keys_updated_at 
    BEFORE UPDATE ON secret_keys 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at 
    BEFORE UPDATE ON notes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_database_connections_updated_at ON database_connections;
CREATE TRIGGER update_database_connections_updated_at 
    BEFORE UPDATE ON database_connections 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_database_queries_updated_at ON database_queries;
CREATE TRIGGER update_database_queries_updated_at 
    BEFORE UPDATE ON database_queries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create audit logging trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (action, entity_type, entity_id, old_values)
        VALUES (TG_OP, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (action, entity_type, entity_id, old_values, new_values)
        VALUES (TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (action, entity_type, entity_id, new_values)
        VALUES (TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers for important tables
DROP TRIGGER IF EXISTS audit_users ON users;
CREATE TRIGGER audit_users
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_flows ON flows;
CREATE TRIGGER audit_flows
    AFTER INSERT OR UPDATE OR DELETE ON flows
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_components ON components;
CREATE TRIGGER audit_components
    AFTER INSERT OR UPDATE OR DELETE ON components
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Log successful initialization
INSERT INTO audit_logs (action, entity_type, entity_id, new_values) 
VALUES ('DATABASE_INITIALIZED', 'system', uuid_generate_v4(), '{"message": "Lowcode platform database initialized successfully"}');

-- Display initialization summary
DO $$ 
DECLARE
    table_count INTEGER;
    index_count INTEGER;
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count FROM information_schema.tables WHERE table_schema = 'public';
    SELECT COUNT(*) INTO index_count FROM pg_indexes WHERE schemaname = 'public';
    SELECT COUNT(*) INTO trigger_count FROM information_schema.triggers WHERE trigger_schema = 'public';
    
    RAISE NOTICE '=== TON Lowcode Platform Database Initialization Complete ===';
    RAISE NOTICE 'Database: lowcode_db';
    RAISE NOTICE 'Schema: public';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Indexes created: %', index_count;
    RAISE NOTICE 'Triggers created: %', trigger_count;
    RAISE NOTICE 'Extensions: uuid-ossp, pgcrypto, pg_trgm, unaccent, btree_gin';
    RAISE NOTICE 'Timezone: UTC';
    RAISE NOTICE '==================================================';
END $$;