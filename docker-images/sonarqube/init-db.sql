-- TON Lowcode Platform - SonarQube Database Initialization

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

-- Database configuration for SonarQube
ALTER DATABASE sonarqubedb SET search_path TO public;

-- Grant permissions to sonarqube user
GRANT ALL PRIVILEGES ON DATABASE sonarqubedb TO sonarqube;
GRANT ALL PRIVILEGES ON SCHEMA public TO sonarqube;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sonarqube;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sonarqube;

-- Optimize database settings for SonarQube
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- Reload configuration
SELECT pg_reload_conf();

-- Create initial audit table for tracking SonarQube usage
CREATE TABLE IF NOT EXISTS sonarqube_audit (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    user_login VARCHAR(255),
    project_key VARCHAR(400),
    event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for audit table
CREATE INDEX IF NOT EXISTS idx_sonarqube_audit_created_at ON sonarqube_audit(created_at);
CREATE INDEX IF NOT EXISTS idx_sonarqube_audit_event_type ON sonarqube_audit(event_type);
CREATE INDEX IF NOT EXISTS idx_sonarqube_audit_project_key ON sonarqube_audit(project_key);

-- Create initial projects table for custom project management
CREATE TABLE IF NOT EXISTS lowcode_projects (
    id SERIAL PRIMARY KEY,
    project_key VARCHAR(400) UNIQUE NOT NULL,
    project_name VARCHAR(500) NOT NULL,
    description TEXT,
    repository_url VARCHAR(1000),
    main_branch VARCHAR(100) DEFAULT 'main',
    quality_gate VARCHAR(100) DEFAULT 'Sonar way',
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial projects for the lowcode platform
INSERT INTO lowcode_projects (project_key, project_name, description, repository_url, created_by) 
VALUES 
    ('lowcode-portal', 'Lowcode Portal (Frontend)', 'Next.js frontend application for the lowcode platform', 'https://github.com/your-org/lowcode-portal.git', 'system'),
    ('lowcode-portal-service', 'Lowcode Portal Service (Backend)', 'NestJS backend service for the lowcode platform', 'https://github.com/your-org/lowcode-portal-service.git', 'system')
ON CONFLICT (project_key) DO NOTHING;

-- Create quality profiles tracking table
CREATE TABLE IF NOT EXISTS quality_profiles_tracking (
    id SERIAL PRIMARY KEY,
    profile_key VARCHAR(255) NOT NULL,
    profile_name VARCHAR(255) NOT NULL,
    language VARCHAR(50) NOT NULL,
    rules_count INTEGER DEFAULT 0,
    active_rules_count INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create metrics tracking table for custom dashboards
CREATE TABLE IF NOT EXISTS project_metrics_history (
    id SERIAL PRIMARY KEY,
    project_key VARCHAR(400) NOT NULL,
    metric_key VARCHAR(255) NOT NULL,
    metric_value DECIMAL(30,4),
    analysis_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for metrics history
CREATE INDEX IF NOT EXISTS idx_project_metrics_project_key ON project_metrics_history(project_key);
CREATE INDEX IF NOT EXISTS idx_project_metrics_metric_key ON project_metrics_history(metric_key);
CREATE INDEX IF NOT EXISTS idx_project_metrics_analysis_date ON project_metrics_history(analysis_date);

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_lowcode_projects_updated_at 
    BEFORE UPDATE ON lowcode_projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quality_profiles_tracking_updated_at 
    BEFORE UPDATE ON quality_profiles_tracking 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for project summary
CREATE OR REPLACE VIEW project_summary AS
SELECT 
    lp.project_key,
    lp.project_name,
    lp.description,
    lp.main_branch,
    lp.quality_gate,
    lp.created_at,
    lp.updated_at,
    (
        SELECT COUNT(*) 
        FROM project_metrics_history pmh 
        WHERE pmh.project_key = lp.project_key 
        AND pmh.analysis_date > CURRENT_DATE - INTERVAL '30 days'
    ) as recent_analyses_count,
    (
        SELECT pmh.analysis_date 
        FROM project_metrics_history pmh 
        WHERE pmh.project_key = lp.project_key 
        ORDER BY pmh.analysis_date DESC 
        LIMIT 1
    ) as last_analysis_date
FROM lowcode_projects lp;

-- Create initial quality gate configurations
CREATE TABLE IF NOT EXISTS quality_gates_config (
    id SERIAL PRIMARY KEY,
    gate_name VARCHAR(255) NOT NULL,
    conditions JSONB NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default quality gate for TypeScript/JavaScript projects
INSERT INTO quality_gates_config (gate_name, conditions, is_default) 
VALUES (
    'TON Lowcode Quality Gate',
    '{
        "coverage": {"metric": "coverage", "op": "LT", "error": "80"},
        "duplicated_lines_density": {"metric": "duplicated_lines_density", "op": "GT", "error": "3"},
        "maintainability_rating": {"metric": "maintainability_rating", "op": "GT", "error": "1"},
        "reliability_rating": {"metric": "reliability_rating", "op": "GT", "error": "1"},
        "security_rating": {"metric": "security_rating", "op": "GT", "error": "1"},
        "security_hotspots_reviewed": {"metric": "security_hotspots_reviewed", "op": "LT", "error": "100"}
    }',
    true
) ON CONFLICT DO NOTHING;

-- Create webhooks configuration table
CREATE TABLE IF NOT EXISTS webhooks_config (
    id SERIAL PRIMARY KEY,
    project_key VARCHAR(400),
    webhook_name VARCHAR(255) NOT NULL,
    webhook_url VARCHAR(1000) NOT NULL,
    secret VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    events JSONB DEFAULT '["PROJECT_ANALYSIS_FINISHED"]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add trigger for webhooks config
CREATE TRIGGER update_webhooks_config_updated_at 
    BEFORE UPDATE ON webhooks_config 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions on all new tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sonarqube;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sonarqube;

-- Log successful initialization
INSERT INTO sonarqube_audit (event_type, user_login, project_key, event_data) 
VALUES ('DATABASE_INITIALIZED', 'system', 'system', '{"message": "SonarQube database initialized successfully for TON Lowcode Platform"}');

-- Display initialization summary
DO $$ 
BEGIN
    RAISE NOTICE '=== SonarQube Database Initialization Complete ===';
    RAISE NOTICE 'Database: sonarqubedb';
    RAISE NOTICE 'User: sonarqube';
    RAISE NOTICE 'Timezone: UTC';
    RAISE NOTICE 'Extensions: uuid-ossp, pgcrypto';
    RAISE NOTICE 'Custom tables created: 6';
    RAISE NOTICE 'Initial projects: 2';
    RAISE NOTICE 'Quality gates configured: 1';
    RAISE NOTICE '===============================================';
END $$;