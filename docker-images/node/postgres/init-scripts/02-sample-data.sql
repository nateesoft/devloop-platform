-- TON Lowcode Platform - Sample Data
-- This script inserts sample data for development and testing

-- Insert sample users
INSERT INTO users (id, username, email, first_name, last_name, status, keycloak_id, preferences) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'admin', 'admin@lowcode.com', 'System', 'Administrator', 'active', 'keycloak-admin-001', '{"theme": "dark", "language": "en"}'),
    ('550e8400-e29b-41d4-a716-446655440002', 'john.doe', 'john.doe@example.com', 'John', 'Doe', 'active', 'keycloak-user-001', '{"theme": "light", "language": "en"}'),
    ('550e8400-e29b-41d4-a716-446655440003', 'jane.smith', 'jane.smith@example.com', 'Jane', 'Smith', 'active', 'keycloak-user-002', '{"theme": "dark", "language": "th"}'),
    ('550e8400-e29b-41d4-a716-446655440004', 'dev.user', 'developer@lowcode.com', 'Developer', 'User', 'active', 'keycloak-dev-001', '{"theme": "light", "language": "en"}')
ON CONFLICT (id) DO NOTHING;

-- Insert sample user groups
INSERT INTO user_groups (id, name, description, permissions, created_by) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', 'Administrators', 'System administrators with full access', '["admin", "user_management", "system_config"]', '550e8400-e29b-41d4-a716-446655440001'),
    ('660e8400-e29b-41d4-a716-446655440002', 'Developers', 'Application developers', '["flow_create", "component_create", "page_create", "service_integrate"]', '550e8400-e29b-41d4-a716-446655440001'),
    ('660e8400-e29b-41d4-a716-446655440003', 'Business Users', 'Business users who create workflows', '["flow_create", "page_create", "data_view"]', '550e8400-e29b-41d4-a716-446655440001'),
    ('660e8400-e29b-41d4-a716-446655440004', 'Viewers', 'Read-only users', '["data_view", "flow_view"]', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

-- Insert sample group memberships
INSERT INTO user_group_memberships (user_id, group_id, role, added_by) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'admin', '550e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 'member', '550e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', 'member', '550e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', 'lead', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (user_id, group_id) DO NOTHING;

-- Insert sample projects
INSERT INTO my_projects (id, name, description, settings, owner_id, team_id, status) VALUES
    ('770e8400-e29b-41d4-a716-446655440001', 'E-commerce Platform', 'Complete e-commerce solution with inventory management', '{"theme": "modern", "deployment": "cloud"}', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 'active'),
    ('770e8400-e29b-41d4-a716-446655440002', 'CRM System', 'Customer relationship management system', '{"theme": "corporate", "deployment": "on-premise"}', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', 'active'),
    ('770e8400-e29b-41d4-a716-446655440003', 'HR Management', 'Human resources management platform', '{"theme": "minimal", "deployment": "hybrid"}', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', 'active'),
    ('770e8400-e29b-41d4-a716-446655440004', 'Demo Project', 'Sample project for testing and demonstration', '{"theme": "default", "deployment": "local"}', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert sample components
INSERT INTO components (id, name, type, description, definition, version, is_template, tags, created_by, project_id) VALUES
    ('880e8400-e29b-41d4-a716-446655440001', 'Button Component', 'ui', 'Reusable button with multiple styles', '{"type": "button", "props": {"text": "Click me", "variant": "primary", "size": "medium"}}', '1.0.0', true, ARRAY['ui', 'button', 'form'], '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001'),
    ('880e8400-e29b-41d4-a716-446655440002', 'Data Table', 'ui', 'Advanced data table with sorting and filtering', '{"type": "table", "props": {"columns": [], "sortable": true, "filterable": true}}', '1.2.0', true, ARRAY['ui', 'table', 'data'], '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002'),
    ('880e8400-e29b-41d4-a716-446655440003', 'Email Validator', 'logic', 'Email validation logic component', '{"type": "validator", "props": {"pattern": "email", "required": true}}', '1.0.0', true, ARRAY['logic', 'validation', 'email'], '550e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440003'),
    ('880e8400-e29b-41d4-a716-446655440004', 'API Connector', 'data', 'Generic API connection component', '{"type": "api", "props": {"method": "GET", "headers": {}, "timeout": 5000}}', '2.1.0', true, ARRAY['data', 'api', 'connector'], '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

-- Insert sample flows
INSERT INTO flows (id, name, description, definition, status, version, tags, created_by, project_id) VALUES
    ('990e8400-e29b-41d4-a716-446655440001', 'User Registration Flow', 'Complete user registration workflow', '{"nodes": [{"id": "start", "type": "start", "position": {"x": 0, "y": 0}}, {"id": "validate", "type": "action", "position": {"x": 200, "y": 0}}, {"id": "save", "type": "action", "position": {"x": 400, "y": 0}}, {"id": "end", "type": "end", "position": {"x": 600, "y": 0}}], "edges": [{"id": "e1", "source": "start", "target": "validate"}, {"id": "e2", "source": "validate", "target": "save"}, {"id": "e3", "source": "save", "target": "end"}]}', 'active', '1.0.0', ARRAY['user', 'registration', 'auth'], '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001'),
    ('990e8400-e29b-41d4-a716-446655440002', 'Order Processing', 'E-commerce order processing workflow', '{"nodes": [{"id": "start", "type": "start"}, {"id": "validate-payment", "type": "condition"}, {"id": "process-order", "type": "action"}, {"id": "send-confirmation", "type": "action"}, {"id": "end", "type": "end"}], "edges": []}', 'active', '2.0.0', ARRAY['order', 'payment', 'ecommerce'], '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001'),
    ('990e8400-e29b-41d4-a716-446655440003', 'Customer Support Ticket', 'Customer support ticket management', '{"nodes": [{"id": "ticket-created", "type": "start"}, {"id": "classify", "type": "condition"}, {"id": "assign", "type": "action"}, {"id": "notify", "type": "action"}], "edges": []}', 'active', '1.1.0', ARRAY['support', 'ticket', 'crm'], '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002'),
    ('990e8400-e29b-41d4-a716-446655440004', 'Employee Onboarding', 'New employee onboarding process', '{"nodes": [{"id": "start", "type": "start"}, {"id": "create-accounts", "type": "parallel"}, {"id": "assign-mentor", "type": "action"}, {"id": "schedule-training", "type": "action"}], "edges": []}', 'draft', '1.0.0', ARRAY['hr', 'onboarding', 'employee'], '550e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- Insert sample flow executions
INSERT INTO flow_executions (id, flow_id, execution_id, input_data, output_data, status, started_by, started_at, completed_at, execution_time_ms) VALUES
    ('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 'exec-001-20241201-001', '{"email": "test@example.com", "name": "Test User"}', '{"userId": "new-user-123", "success": true}', 'completed', '550e8400-e29b-41d4-a716-446655440002', CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '59 minutes', 1500),
    ('aa0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440001', 'exec-001-20241201-002', '{"email": "invalid-email", "name": "Test User"}', null, 'failed', '550e8400-e29b-41d4-a716-446655440002', CURRENT_TIMESTAMP - INTERVAL '30 minutes', CURRENT_TIMESTAMP - INTERVAL '29 minutes', 800),
    ('aa0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440002', 'exec-002-20241201-001', '{"orderId": "ORD-001", "amount": 99.99, "currency": "USD"}', '{"transactionId": "TXN-12345", "status": "completed"}', 'completed', '550e8400-e29b-41d4-a716-446655440003', CURRENT_TIMESTAMP - INTERVAL '15 minutes', CURRENT_TIMESTAMP - INTERVAL '12 minutes', 3200)
ON CONFLICT (id) DO NOTHING;

-- Insert sample pages
INSERT INTO pages (id, title, slug, content, layout, seo_meta, is_published, created_by, project_id) VALUES
    ('bb0e8400-e29b-41d4-a716-446655440001', 'Home Page', 'home', '{"blocks": [{"type": "hero", "props": {"title": "Welcome to Our Platform", "subtitle": "Build amazing applications with ease"}}, {"type": "features", "props": {"items": ["Easy to use", "Powerful", "Scalable"]}}]}', '{"header": true, "footer": true, "sidebar": false}', '{"title": "Home - Lowcode Platform", "description": "Welcome to our lowcode platform", "keywords": "lowcode, platform, development"}', true, '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001'),
    ('bb0e8400-e29b-41d4-a716-446655440002', 'About Us', 'about', '{"blocks": [{"type": "text", "props": {"content": "We are a team of passionate developers building the future of application development."}}]}', '{"header": true, "footer": true, "sidebar": true}', '{"title": "About Us", "description": "Learn about our mission"}', true, '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002'),
    ('bb0e8400-e29b-41d4-a716-446655440003', 'Contact', 'contact', '{"blocks": [{"type": "form", "props": {"fields": ["name", "email", "message"], "action": "/api/contact"}}]}', '{"header": true, "footer": true}', '{"title": "Contact Us", "description": "Get in touch"}', true, '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001'),
    ('bb0e8400-e29b-41d4-a716-446655440004', 'Dashboard', 'dashboard', '{"blocks": [{"type": "stats", "props": {"metrics": ["users", "orders", "revenue"]}}, {"type": "chart", "props": {"type": "line", "data": []}}]}', '{"header": true, "sidebar": true}', '{"title": "Dashboard", "robots": "noindex"}', false, '550e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- Insert sample services
INSERT INTO services (id, name, description, service_type, configuration, is_active, created_by, project_id) VALUES
    ('cc0e8400-e29b-41d4-a716-446655440001', 'SendGrid Email', 'Email service integration', 'email', '{"api_url": "https://api.sendgrid.com/v3", "timeout": 30000}', true, '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001'),
    ('cc0e8400-e29b-41d4-a716-446655440002', 'Stripe Payment', 'Payment processing service', 'payment', '{"api_url": "https://api.stripe.com/v1", "webhook_url": "/webhooks/stripe"}', true, '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001'),
    ('cc0e8400-e29b-41d4-a716-446655440003', 'Slack Notifications', 'Slack workspace integration', 'notification', '{"webhook_url": "https://hooks.slack.com/services/...", "channel": "#alerts"}', true, '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002'),
    ('cc0e8400-e29b-41d4-a716-446655440004', 'Google Analytics', 'Web analytics service', 'analytics', '{"tracking_id": "GA_MEASUREMENT_ID", "events": ["page_view", "conversion"]}', false, '550e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- Insert sample media folders
INSERT INTO media_folders (id, name, parent_id, path, created_by, project_id) VALUES
    ('dd0e8400-e29b-41d4-a716-446655440001', 'Images', null, '/images', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001'),
    ('dd0e8400-e29b-41d4-a716-446655440002', 'Documents', null, '/documents', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002'),
    ('dd0e8400-e29b-41d4-a716-446655440003', 'Product Images', 'dd0e8400-e29b-41d4-a716-446655440001', '/images/products', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001'),
    ('dd0e8400-e29b-41d4-a716-446655440004', 'User Uploads', null, '/uploads', '550e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- Insert sample media files
INSERT INTO media_files (id, filename, original_name, mime_type, file_size, file_path, media_type, metadata, folder_id, uploaded_by, project_id) VALUES
    ('ee0e8400-e29b-41d4-a716-446655440001', 'hero-bg.jpg', 'hero-background.jpg', 'image/jpeg', 245760, '/images/hero-bg.jpg', 'image', '{"width": 1920, "height": 1080, "alt": "Hero background"}', 'dd0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001'),
    ('ee0e8400-e29b-41d4-a716-446655440002', 'user-guide.pdf', 'User Guide v2.1.pdf', 'application/pdf', 1048576, '/documents/user-guide.pdf', 'document', '{"pages": 24, "version": "2.1"}', 'dd0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002'),
    ('ee0e8400-e29b-41d4-a716-446655440003', 'product-1.png', 'product-sample-1.png', 'image/png', 102400, '/images/products/product-1.png', 'image', '{"width": 800, "height": 600, "alt": "Product sample 1"}', 'dd0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001'),
    ('ee0e8400-e29b-41d4-a716-446655440004', 'demo-video.mp4', 'platform-demo.mp4', 'video/mp4', 15728640, '/uploads/demo-video.mp4', 'video', '{"duration": 180, "resolution": "1080p"}', 'dd0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- Insert sample secret keys
INSERT INTO secret_keys (id, key_name, description, secret_type, vault_path, encrypted_value, is_vault_stored, tags, created_by, project_id) VALUES
    ('ff0e8400-e29b-41d4-a716-446655440001', 'SENDGRID_API_KEY', 'SendGrid email service API key', 'api_key', 'secret/sendgrid/api_key', null, true, ARRAY['email', 'sendgrid', 'api'], '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001'),
    ('ff0e8400-e29b-41d4-a716-446655440002', 'STRIPE_SECRET_KEY', 'Stripe payment processing secret key', 'api_key', 'secret/stripe/secret_key', null, true, ARRAY['payment', 'stripe', 'api'], '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001'),
    ('ff0e8400-e29b-41d4-a716-446655440003', 'DATABASE_URL', 'Production database connection string', 'database_url', null, 'encrypted_connection_string_here', false, ARRAY['database', 'production'], '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002'),
    ('ff0e8400-e29b-41d4-a716-446655440004', 'OAUTH_CLIENT_SECRET', 'OAuth application client secret', 'oauth_token', 'secret/oauth/client_secret', null, true, ARRAY['oauth', 'auth', 'client'], '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (id) DO NOTHING;

-- Insert sample notes
INSERT INTO notes (id, title, content, content_type, tags, is_public, created_by, project_id) VALUES
    ('110e8400-e29b-41d4-a716-446655440001', 'Project Setup Guide', '# Project Setup\n\nThis guide covers the initial setup process for new projects.\n\n## Prerequisites\n- Node.js 18+\n- PostgreSQL 13+\n- Redis 6+\n\n## Installation Steps\n1. Clone the repository\n2. Install dependencies\n3. Configure environment variables\n4. Run migrations', 'markdown', ARRAY['setup', 'guide', 'documentation'], true, '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001'),
    ('110e8400-e29b-41d4-a716-446655440002', 'API Documentation', '# API Endpoints\n\n## Authentication\n- POST /api/auth/login\n- POST /api/auth/logout\n- GET /api/auth/profile\n\n## Users\n- GET /api/users\n- POST /api/users\n- PUT /api/users/:id\n- DELETE /api/users/:id', 'markdown', ARRAY['api', 'documentation', 'endpoints'], true, '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002'),
    ('110e8400-e29b-41d4-a716-446655440003', 'Meeting Notes - 2024-12-01', 'Meeting with stakeholders about new requirements:\n\n- Need mobile app support\n- Real-time notifications required\n- Integration with existing CRM\n- Timeline: Q1 2025', 'markdown', ARRAY['meeting', 'requirements', 'planning'], false, '550e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440003'),
    ('110e8400-e29b-41d4-a716-446655440004', 'Troubleshooting Common Issues', '# Common Issues\n\n## Database Connection\n- Check PostgreSQL service status\n- Verify connection parameters\n- Check firewall settings\n\n## Performance Issues\n- Monitor query execution times\n- Check index usage\n- Review connection pool settings', 'markdown', ARRAY['troubleshooting', 'database', 'performance'], true, '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440004')
ON CONFLICT (id) DO NOTHING;

-- Insert sample database connections
INSERT INTO database_connections (id, name, connection_type, host, port, database_name, username, password_encrypted, ssl_config, connection_params, is_active, created_by, project_id) VALUES
    ('120e8400-e29b-41d4-a716-446655440001', 'Production DB', 'postgresql', 'prod-db.company.com', 5432, 'prod_ecommerce', 'app_user', 'encrypted_password_here', '{"require": true, "ca": "cert_path"}', '{"pool_size": 20, "timeout": 30}', true, '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001'),
    ('120e8400-e29b-41d4-a716-446655440002', 'Analytics DB', 'postgresql', 'analytics-db.company.com', 5432, 'analytics', 'readonly_user', 'encrypted_password_here', '{"require": false}', '{"pool_size": 5, "timeout": 60}', true, '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002'),
    ('120e8400-e29b-41d4-a716-446655440003', 'Redis Cache', 'redis', 'redis.company.com', 6379, '0', 'default', 'encrypted_password_here', '{}', '{"timeout": 5, "retry": 3}', true, '550e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440003'),
    ('120e8400-e29b-41d4-a716-446655440004', 'MongoDB Users', 'mongodb', 'mongo.company.com', 27017, 'users_db', 'mongo_user', 'encrypted_password_here', '{"tls": true}', '{"authSource": "admin"}', false, '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

-- Insert sample database queries
INSERT INTO database_queries (id, name, description, sql_query, parameters, connection_id, created_by, project_id) VALUES
    ('130e8400-e29b-41d4-a716-446655440001', 'Active Users Count', 'Count of active users in the system', 'SELECT COUNT(*) as active_users FROM users WHERE status = ''active'' AND last_login_at > NOW() - INTERVAL ''30 days''', '[]', '120e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001'),
    ('130e8400-e29b-41d4-a716-446655440002', 'Monthly Orders Report', 'Orders summary by month', 'SELECT DATE_TRUNC(''month'', created_at) as month, COUNT(*) as order_count, SUM(total_amount) as total_revenue FROM orders WHERE created_at >= $1 AND created_at <= $2 GROUP BY month ORDER BY month', '[{"name": "start_date", "type": "date"}, {"name": "end_date", "type": "date"}]', '120e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001'),
    ('130e8400-e29b-41d4-a716-446655440003', 'User Activity Analytics', 'User engagement and activity metrics', 'SELECT user_id, COUNT(*) as action_count, MAX(created_at) as last_activity FROM user_activities WHERE created_at >= $1 GROUP BY user_id HAVING COUNT(*) > $2', '[{"name": "since_date", "type": "date"}, {"name": "min_actions", "type": "number"}]', '120e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002'),
    ('130e8400-e29b-41d4-a716-446655440004', 'System Performance Check', 'Check system performance metrics', 'SELECT table_name, pg_size_pretty(pg_total_relation_size(table_name::regclass)) as size, pg_stat_get_tuples_inserted(table_name::regclass::oid) as inserts FROM information_schema.tables WHERE table_schema = ''public'' ORDER BY pg_total_relation_size(table_name::regclass) DESC', '[]', '120e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- Log sample data insertion
INSERT INTO audit_logs (action, entity_type, entity_id, new_values) 
VALUES ('SAMPLE_DATA_INSERTED', 'system', uuid_generate_v4(), '{"message": "Sample data inserted for development and testing"}');

-- Display sample data summary
DO $$ 
DECLARE
    user_count INTEGER;
    project_count INTEGER;
    component_count INTEGER;
    flow_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO project_count FROM my_projects;
    SELECT COUNT(*) INTO component_count FROM components;
    SELECT COUNT(*) INTO flow_count FROM flows;
    
    RAISE NOTICE '=== Sample Data Insertion Complete ===';
    RAISE NOTICE 'Users: %', user_count;
    RAISE NOTICE 'Projects: %', project_count;
    RAISE NOTICE 'Components: %', component_count;
    RAISE NOTICE 'Flows: %', flow_count;
    RAISE NOTICE 'Sample data ready for development and testing';
    RAISE NOTICE '====================================';
END $$;