# 📊 SonarQube for TON Lowcode Platform

## ภาพรวม

SonarQube configuration สำหรับ TON Lowcode Platform ที่ออกแบบมาเพื่อ:
- **Code Quality Analysis** - วิเคราะห์คุณภาพโค้ด
- **Security Vulnerability Detection** - ตรวจหาช่องโหว่ด้านความปลอดภัย
- **Code Coverage Tracking** - ติดตาม test coverage
- **Technical Debt Management** - จัดการ technical debt
- **Continuous Quality Assurance** - QA แบบต่อเนื่อง

## 🏗️ Architecture

```
TON Lowcode Platform
        ↓
    SonarQube Server (Port 9000)
        ├─ PostgreSQL Database (Port 5433)
        ├─ Code Analysis Engine
        ├─ Quality Gates
        └─ Security Rules
        ↓
    Analysis Results
        ├─ Code Smells
        ├─ Bugs & Vulnerabilities  
        ├─ Security Hotspots
        ├─ Coverage Reports
        └─ Maintainability Metrics
```

## 🚀 การติดตั้งและใช้งาน

### Prerequisites
- Docker & Docker Compose
- 4GB RAM ขั้นต่ำ (8GB แนะนำ)
- 10GB disk space
- Git repository with source code

### Quick Start
```bash
# เข้าไปที่ SonarQube directory
cd docker-images/sonarqube

# รัน setup script (แนะนำ)
./setup-sonarqube.sh

# หรือ manual start
docker compose up -d
```

### Manual Setup
```bash
# 1. สร้าง network (ถ้ายังไม่มี)
docker network create lowcode-network

# 2. Set system parameters (required for Elasticsearch)
sudo sysctl -w vm.max_map_count=262144

# 3. Start PostgreSQL database
docker compose up -d sonarqube-db

# 4. Wait for database, then start SonarQube
sleep 30
docker compose up -d sonarqube

# 5. Wait for SonarQube initialization (2-3 minutes)
```

## 🔧 Configuration Details

### 🎯 SonarQube Configuration Highlights

#### System Requirements
```yaml
# Memory allocation
SONAR_CE_JAVAOPTS: "-Xmx2g -Xms128m"    # Compute Engine
SONAR_WEB_JAVAOPTS: "-Xmx1g -Xms128m"   # Web Server  
SONAR_SEARCH_JAVAOPTS: "-Xmx1g -Xms1g"  # Elasticsearch

# System limits
vm.max_map_count: 262144
fs.file-max: 131072
```

#### Database Configuration
```yaml
# PostgreSQL 15 with optimized settings
POSTGRES_USER: sonarqube
POSTGRES_PASSWORD: sonarqube_password_2024
POSTGRES_DB: sonarqubedb

# Connection pooling and performance tuning
shared_buffers: 256MB
effective_cache_size: 1GB
maintenance_work_mem: 64MB
```

#### Security Settings
```properties
# Authentication
sonar.forceAuthentication=false  # Change to true for production
sonar.security.realm=

# Session management
sonar.web.session.timeout.in.minutes=60
sonar.web.session.cookie.secure=false  # Set to true with HTTPS
```

## 📊 Pre-configured Features

### 🎯 Projects Setup
- **lowcode-portal** (Frontend) - Next.js/React analysis
- **lowcode-portal-service** (Backend) - NestJS/TypeScript analysis

### 📋 Quality Profiles
- **TON Lowcode TypeScript** - Custom TypeScript rules
- **TON Lowcode JavaScript** - Custom JavaScript rules

### 🚦 Quality Gates
- **Coverage**: >80%
- **Duplicated Lines**: <3%
- **Maintainability Rating**: A
- **Reliability Rating**: A
- **Security Rating**: A
- **Security Hotspots Reviewed**: 100%

### 🔍 Analysis Metrics

#### Code Quality Metrics
- **Lines of Code** - Total codebase size
- **Code Smells** - Maintainability issues
- **Technical Debt** - Estimated fix time
- **Cognitive Complexity** - Code complexity analysis

#### Security Metrics  
- **Vulnerabilities** - Security bugs
- **Security Hotspots** - Potential security risks
- **Security Rating** - Overall security score

#### Test Coverage
- **Coverage** - Unit test coverage percentage
- **Line Coverage** - Lines covered by tests
- **Condition Coverage** - Branch coverage analysis

#### Reliability Metrics
- **Bugs** - Confirmed code issues
- **Reliability Rating** - Overall reliability score

## 📁 Project Configuration Files

### Frontend (lowcode-portal)
```properties
# sonar-project.properties
sonar.projectKey=lowcode-portal
sonar.projectName=Lowcode Portal (Frontend)
sonar.projectVersion=1.0.0

sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx

sonar.exclusions=**/node_modules/**,**/dist/**,**/.next/**,**/coverage/**
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

### Backend (lowcode-portal-service)  
```properties
# sonar-project.properties
sonar.projectKey=lowcode-portal-service
sonar.projectName=Lowcode Portal Service (Backend)
sonar.projectVersion=1.0.0

sonar.sources=src
sonar.tests=src,test
sonar.test.inclusions=**/*.spec.ts,**/*.test.ts,test/**/*.ts

sonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**
sonar.typescript.lcov.reportPaths=coverage/lcov.info
```

## 🔍 การใช้งานและวิเคราะห์โค้ด

### Access URLs
- **SonarQube**: http://localhost:9000 (admin/admin)
- **PostgreSQL**: localhost:5433
- **PgAdmin**: http://localhost:5050 (use `--profile pgadmin`)

### Running Analysis

#### Method 1: Docker Scanner (Recommended)
```bash
# Analyze frontend
cd lowcode-portal
docker run --rm --network=lowcode-network \
  -v $(pwd):/usr/src \
  sonarsource/sonar-scanner-cli

# Analyze backend
cd lowcode-portal-service
docker run --rm --network=lowcode-network \
  -v $(pwd):/usr/src \
  sonarsource/sonar-scanner-cli
```

#### Method 2: SonarScanner CLI
```bash
# Install SonarScanner CLI first
# https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/

# Analyze projects
cd lowcode-portal && sonar-scanner
cd lowcode-portal-service && sonar-scanner
```

#### Method 3: CI/CD Integration
```yaml
# GitHub Actions example
- name: SonarQube Scan
  uses: sonarqube-quality-gate-action@master
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
    SONAR_HOST_URL: http://sonarqube:9000
```

### Generating Coverage Reports

#### Frontend (Jest + React Testing Library)
```bash
# Generate coverage report
cd lowcode-portal
npm test -- --coverage --watchAll=false

# Coverage report location: coverage/lcov.info
```

#### Backend (Jest + NestJS)
```bash
# Generate coverage report
cd lowcode-portal-service
npm run test:cov

# Coverage report location: coverage/lcov.info
```

## 📊 Quality Analysis Results

### Understanding Metrics

#### Code Smells
- **Naming conventions** - PascalCase, camelCase compliance
- **Unused variables** - Remove dead code
- **Complex functions** - Reduce cognitive complexity
- **Code duplication** - Eliminate duplicate code blocks

#### Security Issues
- **SQL injection** - Parameterized queries
- **XSS vulnerabilities** - Input sanitization
- **Weak cryptography** - Strong encryption algorithms
- **Insecure dependencies** - Update vulnerable packages

#### Bug Detection
- **Null pointer exceptions** - Safe navigation
- **Logic errors** - Conditional statement issues
- **Type errors** - TypeScript type safety
- **Resource leaks** - Proper cleanup

### Quality Gates Interpretation

#### A-Grade Requirements
- **Coverage**: >80% test coverage
- **Maintainability**: Low technical debt
- **Reliability**: No critical bugs
- **Security**: No vulnerabilities
- **Duplication**: <3% code duplication

## 🎯 Integration with Development Workflow

### Pre-commit Hooks
```bash
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: sonar-scanner
        name: SonarQube Analysis
        entry: sonar-scanner
        language: system
        pass_filenames: false
```

### CI/CD Pipeline Integration
```yaml
# Example GitHub Actions workflow
name: Code Quality Check
on: [push, pull_request]

jobs:
  sonarqube:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests with coverage
        run: npm run test:cov
        
      - name: SonarQube Scan
        run: |
          docker run --rm \
            -e SONAR_HOST_URL=http://sonarqube:9000 \
            -e SONAR_LOGIN=${{ secrets.SONAR_TOKEN }} \
            -v $(pwd):/usr/src \
            sonarsource/sonar-scanner-cli
```

### IDE Integration

#### VS Code Extensions
```json
// .vscode/extensions.json
{
  "recommendations": [
    "SonarSource.sonarlint-vscode",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint"
  ]
}
```

#### SonarLint Configuration
```json
// .vscode/settings.json
{
  "sonarlint.connectedMode.project": {
    "connectionId": "lowcode-sonarqube",
    "projectKey": "lowcode-portal"
  }
}
```

## 🔒 Security & Best Practices

### Production Security
```properties
# Secure configuration for production
sonar.forceAuthentication=true
sonar.web.session.cookie.secure=true
sonar.web.context=/sonarqube

# HTTPS configuration
sonar.web.https.port=9443
sonar.web.https.keystore.path=/path/to/keystore
sonar.web.https.keystore.password=secure_password
```

### User Management
```bash
# Create technical users via API
curl -X POST "http://localhost:9000/api/users/create" \
  -u admin:admin \
  -d "login=jenkins&name=Jenkins&password=jenkins123&email=jenkins@company.com"

# Assign permissions
curl -X POST "http://localhost:9000/api/permissions/add_user" \
  -u admin:admin \
  -d "login=jenkins&permission=scan"
```

### Quality Gate Webhooks
```bash
# Configure webhook for CI/CD
curl -X POST "http://localhost:9000/api/webhooks/create" \
  -u admin:admin \
  -d "name=Jenkins&url=http://jenkins:8888/sonarqube-webhook/"
```

## 📊 Custom Dashboards & Reporting

### PostgreSQL Queries for Custom Reports
```sql
-- Project analysis history
SELECT 
    p.name as project_name,
    s.created_at as analysis_date,
    pm.metric_key,
    pm.value as metric_value
FROM projects p
JOIN snapshots s ON p.uuid = s.component_uuid
JOIN project_measures pm ON s.uuid = pm.analysis_uuid
WHERE s.created_at > CURRENT_DATE - INTERVAL '30 days'
ORDER BY s.created_at DESC;

-- Quality gate status
SELECT 
    p.name as project_name,
    s.created_at as analysis_date,
    qg.name as quality_gate,
    qgs.status
FROM projects p
JOIN snapshots s ON p.uuid = s.component_uuid
JOIN quality_gates qg ON p.quality_gate_uuid = qg.uuid
JOIN quality_gate_status qgs ON s.uuid = qgs.snapshot_uuid
ORDER BY s.created_at DESC;
```

### Grafana Integration
```yaml
# Prometheus metrics for SonarQube
version: '3.8'
services:
  sonarqube-exporter:
    image: dmeiners88/sonarqube-exporter:latest
    ports:
      - "9592:9592"
    environment:
      SONAR_URL: http://sonarqube:9000
      SONAR_TOKEN: admin_token_here
```

## 🛠️ Troubleshooting

### Common Issues

#### SonarQube Won't Start
```bash
# Check system requirements
sysctl vm.max_map_count  # Should be >= 262144

# Check memory
free -h  # Should have at least 4GB available

# Check logs
docker compose logs sonarqube
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
docker exec lowcode-sonarqube-db pg_isready -U sonarqube

# Check database logs
docker compose logs sonarqube-db

# Reset database (if needed)
docker compose down -v
docker compose up -d
```

#### Analysis Failures
```bash
# Check scanner logs
docker run --rm -v $(pwd):/usr/src sonarsource/sonar-scanner-cli -X

# Common issues:
# - Missing sonar-project.properties
# - Incorrect project key
# - Network connectivity to SonarQube server
# - Missing test coverage reports
```

#### Memory Issues
```bash
# Increase JVM heap size
# Edit docker compose.yml:
SONAR_WEB_JAVAOPTS: "-Xmx2g -Xms512m"
SONAR_CE_JAVAOPTS: "-Xmx4g -Xms512m"

# Monitor memory usage
docker stats lowcode-sonarqube
```

## 🚀 Advanced Configuration

### Multi-branch Analysis (Commercial Feature)
```properties
# For commercial editions
sonar.branch.name=main
sonar.pullrequest.branch=feature/new-feature
sonar.pullrequest.base=main
sonar.pullrequest.key=123
```

### Custom Rules Development
```javascript
// Custom ESLint rules for SonarJS
module.exports = {
  rules: {
    'lowcode-naming-convention': {
      create: function(context) {
        return {
          'FunctionDeclaration': function(node) {
            // Custom rule logic
          }
        };
      }
    }
  }
};
```

### LDAP Integration
```properties
# LDAP configuration
sonar.security.realm=LDAP
ldap.url=ldap://ldap.company.com:389
ldap.bindDn=cn=sonar,ou=users,dc=company,dc=com
ldap.bindPassword=secret

# User mapping
ldap.user.baseDn=ou=users,dc=company,dc=com
ldap.user.request=(&(objectClass=inetOrgPerson)(uid={login}))
ldap.user.realNameAttribute=cn
ldap.user.emailAttribute=mail

# Group mapping
ldap.group.baseDn=ou=groups,dc=company,dc=com
ldap.group.request=(&(objectClass=posixGroup)(memberUid={uid}))
```

## 📋 Maintenance & Monitoring

### Database Backup
```bash
# Backup SonarQube database
docker exec lowcode-sonarqube-db pg_dump -U sonarqube sonarqubedb > backup-$(date +%Y%m%d).sql

# Restore from backup
docker exec -i lowcode-sonarqube-db psql -U sonarqube -d sonarqubedb < backup.sql
```

### Log Monitoring
```bash
# Monitor SonarQube logs
docker compose logs -f sonarqube

# Monitor database logs
docker compose logs -f sonarqube-db

# Check application logs inside container
docker exec lowcode-sonarqube tail -f /opt/sonarqube/logs/sonar.log
```

### Performance Monitoring
```bash
# Check container resource usage
docker stats lowcode-sonarqube lowcode-sonarqube-db

# Check SonarQube system info
curl -u admin:admin http://localhost:9000/api/system/info

# Database performance
docker exec lowcode-sonarqube-db psql -U sonarqube -d sonarqubedb -c "
SELECT schemaname,tablename,attname,n_distinct,correlation 
FROM pg_stats 
WHERE schemaname = 'public' 
ORDER BY tablename, attname;"
```

### Regular Maintenance Tasks
```bash
# Cleanup old analyses (keep last 30 days)
curl -X POST -u admin:admin \
  "http://localhost:9000/api/projects/bulk_delete" \
  -d "analyzedBefore=$(date -d '30 days ago' '+%Y-%m-%d')"

# Update plugins
docker compose pull sonarqube
docker compose up -d sonarqube

# Database maintenance
docker exec lowcode-sonarqube-db psql -U sonarqube -d sonarqubedb -c "VACUUM ANALYZE;"
```

---

*SonarQube - Comprehensive Code Quality Analysis for TON Lowcode Platform* 📊