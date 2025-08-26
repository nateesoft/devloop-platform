# TON Low-code Platform - PostgreSQL Database

PostgreSQL database setup for the TON Low-code Platform with PgAdmin for database management.

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Ports 5432 and 5050 available

### Start Services
```bash
./setup-postgresql.sh start
```

### Access Database
- **PostgreSQL**: `postgresql://tonuser:tonpassword123@localhost:5432/tonlowcode`
- **PgAdmin**: http://localhost:5050 (admin@tonlowcode.com / admin123)

## Configuration

### Database Credentials
- **Super User**: `tonuser` / `tonpassword123`
- **App User**: `app_user` / `app_password123`
- **Default Database**: `tonlowcode`
- **Additional Databases**: `tonlowcode_dev`, `tonlowcode_test`

### Network
- **Network Name**: `ton-network`
- **PostgreSQL Port**: 5432
- **PgAdmin Port**: 5050

## Database Schema

The initialization script creates:
- **app_schema**: Main application schema
- **users**: User management table with default admin user
- **applications**: Low-code applications metadata
- **audit_log**: System audit trail

### Default Admin User
- **Username**: admin
- **Email**: admin@tonlowcode.com
- **Password**: default (change in production)

## Management Commands

### Basic Operations
```bash
# Start services
./setup-postgresql.sh start

# Stop services
./setup-postgresql.sh stop

# Restart services
./setup-postgresql.sh restart

# View status
./setup-postgresql.sh status

# View logs
./setup-postgresql.sh logs
```

### Database Operations
```bash
# Connect to database
./setup-postgresql.sh connect

# Create backup
./setup-postgresql.sh backup

# Restore from backup
./setup-postgresql.sh restore backup_file.sql

# Reset database
./setup-postgresql.sh reset

# Show connection info
./setup-postgresql.sh info
```

## File Structure

```
postgresql/
├── docker-compose.yml          # Docker Compose configuration
├── postgresql.conf             # PostgreSQL server configuration
├── servers.json                # PgAdmin server definitions
├── setup-postgresql.sh         # Management script
├── init-db/
│   └── 01-init-database.sql   # Database initialization script
└── README.md                   # This file
```

## Docker Services

### PostgreSQL
- **Image**: postgres:15-alpine
- **Container**: ton-postgresql
- **Health Check**: Automatic
- **Data Persistence**: postgresql_data volume

### PgAdmin
- **Image**: dpage/pgadmin4:latest
- **Container**: ton-pgadmin
- **Data Persistence**: pgadmin_data volume
- **Auto-configured**: Servers pre-configured

## Environment Variables

### PostgreSQL
```bash
POSTGRES_DB=tonlowcode
POSTGRES_USER=tonuser
POSTGRES_PASSWORD=tonpassword123
```

### PgAdmin
```bash
PGADMIN_DEFAULT_EMAIL=admin@tonlowcode.com
PGADMIN_DEFAULT_PASSWORD=admin123
```

## Production Considerations

### Security
1. Change default passwords
2. Enable SSL/TLS encryption
3. Configure proper firewall rules
4. Use environment variables for secrets
5. Enable audit logging

### Performance
1. Tune PostgreSQL configuration based on workload
2. Monitor resource usage
3. Set up connection pooling
4. Configure proper backup strategy

### Backup Strategy
```bash
# Automated backup script example
#!/bin/bash
./setup-postgresql.sh backup
# Upload to secure storage
# Rotate old backups
```

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Check what's using port 5432
lsof -i :5432
# Stop conflicting service or change port
```

**Permission Denied**
```bash
# Make script executable
chmod +x setup-postgresql.sh
```

**Container Won't Start**
```bash
# Check logs
./setup-postgresql.sh logs
# Check disk space
df -h
```

### Health Check
PostgreSQL includes automatic health checks. Service status can be monitored:
```bash
docker ps --filter "name=ton-postgresql"
./setup-postgresql.sh status
```

## Integration

### Application Connection
```javascript
// Node.js example
const connectionString = 'postgresql://app_user:app_password123@localhost:5432/tonlowcode';

// Environment variables (recommended)
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'tonlowcode',
  user: process.env.DB_USER || 'app_user',
  password: process.env.DB_PASSWORD || 'app_password123'
};
```

### Docker Network Integration
To connect from other Docker containers:
```yaml
# In your application's docker-compose.yml
services:
  your-app:
    networks:
      - ton-network

networks:
  ton-network:
    external: true
```

## Monitoring

### Built-in Monitoring
- Health checks enabled
- Connection logging enabled
- Slow query logging (queries > 1000ms)

### External Monitoring
Consider integrating with:
- Prometheus + Grafana
- New Relic
- DataDog
- AWS CloudWatch (if using RDS)

## Support

For issues and questions:
1. Check logs: `./setup-postgresql.sh logs`
2. Verify status: `./setup-postgresql.sh status`
3. Review PostgreSQL documentation
4. Check Docker and Docker Compose documentation