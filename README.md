# 🚀 TON Lowcode Platform

## ภาพรวมระบบ

TON Lowcode Platform เป็นแพลตฟอร์มสำหรับพัฒนาแอปพลิเคชันแบบ Lowcode ที่ออกแบบมาเพื่อให้นักพัฒนาและผู้ใช้งานทั่วไปสามารถสร้างแอปพลิเคชันได้อย่างรวดเร็วและง่ายดาย โดยใช้สถาปัตยกรรมแบบ Microservices ที่แยกระหว่าง Frontend และ Backend อย่างชัดเจน

## 🏗️ สถาปัตยกรรมระบบ

```
┌─────────────────────────────────────────────────────────────┐
│                    TON Lowcode Platform                     │
├─────────────────────────────────────────────────────────────┤
│  Frontend (lowcode-portal)     │  Backend (lowcode-portal-service) │
│  - Next.js 15.4.6             │  - NestJS 11.0.1                 │
│  - React 19.1.0               │  - TypeORM 0.3.25                │
│  - ReactFlow 11.11.4          │  - MySQL/PostgreSQL Support      │
│  - Keycloak Integration        │  - JWT Authentication            │
│  - Tailwind CSS 4.0           │  - MinIO File Storage            │
│  - Multi-language Support     │  - Vault Secret Management       │
└─────────────────────────────────────────────────────────────┘
│
├── External Services
│   ├── Keycloak (Authentication & Authorization)
│   ├── MinIO (Object Storage)
│   └── HashiCorp Vault OSS (Secret Management)
```

## 🛠️ องค์ประกอบหลักของระบบ

### 📱 Frontend (lowcode-portal)
- **Technology Stack**: Next.js 15.4.6, React 19.1.0, TypeScript
- **UI Framework**: Tailwind CSS 4.0
- **Flow Builder**: ReactFlow 11.11.4 สำหรับสร้าง Visual Flow
- **Authentication**: Keycloak Integration
- **Internationalization**: i18next Multi-language Support

### 🖥️ Backend (lowcode-portal-service) 
- **Framework**: NestJS 11.0.1 with TypeScript
- **Database**: TypeORM รองรับ MySQL และ PostgreSQL
- **Authentication**: JWT + Passport
- **File Storage**: MinIO Integration
- **Secret Management**: HashiCorp Vault OSS Integration

## 🌟 ฟีเจอร์หลัก

### 1. 👤 User Management
- **Authentication**: Keycloak SSO Integration
- **User Groups**: จัดการกลุ่มผู้ใช้และสิทธิ์
- **Multi-tenant**: รองรับการทำงานหลาย Organization

### 2. 🎨 Visual Flow Builder
- **Drag & Drop Interface**: สร้าง Flow ด้วย Visual Editor
- **Node Types**: หลากหลายประเภท nodes สำหรับ business logic
- **Real-time Collaboration**: ทำงานร่วมกันแบบ real-time
- **Template System**: เทมเพลต Flow สำเร็จรูป

### 3. 🏗️ Page Builder
- **Visual Builder**: สร้างหน้าเว็บด้วย Drag & Drop
- **Component Library**: คลังส่วนประกอบสำเร็จรูป
- **Responsive Design**: รองรับการแสดงผลทุกอุปกรณ์
- **SEO Optimization**: เครื่องมือ SEO ในตัว

### 4. 🗄️ Database Management
- **Multi-Database Support**: MySQL, PostgreSQL, MongoDB, Redis
- **Visual Schema Editor**: จัดการโครงสร้างฐานข้อมูลแบบ Visual
- **Query Builder**: สร้าง SQL queries ด้วย GUI
- **Connection Management**: จัดการ Database connections

### 5. 📁 Media Management
- **File Upload**: อัปโหลดไฟล์หลายประเภท
- **Folder Organization**: จัดระเบียบไฟล์ในโฟลเดอร์
- **MinIO Integration**: จัดเก็บไฟล์ใน Object Storage
- **Preview Support**: แสดงตัวอย่างไฟล์

### 6. 🔐 Secret Management
- **Vault Integration**: HashiCorp Vault OSS สำหรับจัดเก็บ Secrets
- **Encryption**: การเข้ารหัสข้อมูลสำคัญ
- **Access Control**: ควบคุมการเข้าถึง Secrets
- **Fallback System**: ใช้ Database เมื่อ Vault ไม่พร้อม

### 7. 📊 Project Management
- **Kanban Board**: จัดการงานแบบ Kanban
- **Timeline View**: มุมมอง Timeline สำหรับติดตาม Progress
- **Task Management**: จัดการ Tasks และ Assignments
- **Collaboration Tools**: เครื่องมือสำหรับทำงานร่วมกัน

### 8. 🔧 Service Management
- **API Integration**: เชื่อมต่อ External APIs
- **Service Flow**: สร้าง Business Logic flows
- **Webhook Support**: รองรับ Webhooks
- **Service Templates**: เทมเพลต Services สำเร็จรูป

### 9. 📝 Documentation System
- **Markdown Editor**: เขียนเอกสารด้วย Markdown
- **Version Control**: ควบคุมเวอร์ชันเอกสาร
- **Collaborative Editing**: แก้ไขเอกสารร่วมกัน
- **Search & Organization**: ค้นหาและจัดระเบียบเอกสาร

### 10. 🌐 Multi-language Support
- **i18next Integration**: รองรับหลายภาษา
- **Thai & English**: รองรับภาษาไทยและอังกฤษ
- **Language Switcher**: เปลี่ยนภาษาได้แบบ real-time
- **Localized Content**: เนื้อหาที่แปลเฉพาะภาษา

## 🐳 Docker Infrastructure

### Keycloak (Authentication)
- **Port**: 8080
- **Purpose**: Identity & Access Management
- **Features**: SSO, User Management, Role-based Access

### MinIO (Object Storage)
- **Port**: 9000 (API), 9090 (Console)
- **Purpose**: File Storage & Management
- **Features**: S3-compatible API, Web Console

### HashiCorp Vault OSS (Secret Management)
- **Port**: 8200
- **Purpose**: Secret Management & Encryption
- **Features**: KV Store, Policy-based Access, UI Console

## 📦 การติดตั้งและการใช้งาน

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- MySQL หรือ PostgreSQL

### 1. เริ่มต้น External Services
```bash
# Keycloak
cd docker-images/keycloak
docker-compose up -d

# MinIO
cd docker-images/minio
docker-compose up -d

# Vault OSS
cd docker-images/vault-oss
docker-compose up -d
./setup-vault.sh
```

### 2. ติดตั้ง Backend
```bash
cd lowcode-portal-service
npm install
cp .env.example .env
# แก้ไข .env ตามการตั้งค่า
npm run start:dev
```

### 3. ติดตั้ง Frontend
```bash
cd lowcode-portal
npm install
npm run dev
```

### 4. เข้าถึงระบบ
- **Frontend**: http://localhost:3000
- **Keycloak**: http://localhost:8080
- **MinIO Console**: http://localhost:9090
- **Vault UI**: http://localhost:8200/ui

## 🔧 การกำหนดค่า Environment Variables

### Backend (.env)
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=password
DATABASE_NAME=lowcode_db

# JWT
JWT_SECRET=your-secret-key

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# Vault
VAULT_ENABLED=true
VAULT_ENDPOINT=http://localhost:8200
VAULT_TOKEN=s.xxxxxxxxx
VAULT_MOUNT=secret

# Keycloak
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=lowcode
KEYCLOAK_CLIENT_ID=lowcode-client
```

## 🧪 การทดสอบระบบ

### Unit Tests
```bash
# Backend Tests
cd lowcode-portal-service
npm run test

# Frontend Tests  
cd lowcode-portal
npm run test
```

### E2E Tests
```bash
# Backend E2E Tests
cd lowcode-portal-service
npm run test:e2e

# Frontend E2E Tests
cd lowcode-portal
npm run test:e2e
```

## 📈 สถานะการพัฒนา

### ✅ ฟีเจอร์ที่เสร็จสมบูรณ์
- [x] User Authentication & Authorization (Keycloak)
- [x] Visual Flow Builder (ReactFlow)
- [x] Database Management System
- [x] Media Management (MinIO)
- [x] Secret Management (Vault)
- [x] Project Management (Kanban, Timeline)
- [x] Service Management & API Integration
- [x] Documentation System
- [x] Multi-language Support (Thai/English)
- [x] Collaborative Features (Real-time)
- [x] Page Builder (Visual Editor)

### 🚧 ฟีเจอร์ที่กำลังพัฒนา
- [ ] Advanced Workflow Engine
- [ ] Code Generation & Deployment
- [ ] Advanced Analytics & Reporting
- [ ] Mobile App Builder
- [ ] Advanced Security Features

### 🔄 ฟีเจอร์ที่ต้องปรับปรุง
- [ ] Performance Optimization
- [ ] Advanced Testing Coverage
- [ ] Production Deployment Scripts
- [ ] Advanced Monitoring & Logging

## 🏆 จุดเด่นของระบบ

### Technical Excellence
- **Modern Stack**: ใช้เทคโนโลยีล่าสุด (Next.js 15, React 19, NestJS 11)
- **Microservices Architecture**: แยกส่วน Frontend/Backend ชัดเจน
- **Security First**: Integration กับ Keycloak และ Vault
- **Scalable Design**: รองรับการขยายระบบในอนาคต

### User Experience  
- **Visual Development**: สร้างแอปพลิเคชันด้วย Drag & Drop
- **Real-time Collaboration**: ทำงานร่วมกันแบบ real-time
- **Multi-language**: รองรับหลายภาษา
- **Responsive Design**: ใช้งานได้ทุกอุปกรณ์

### Developer Experience
- **Type Safety**: TypeScript ทั้ง Frontend และ Backend
- **Code Quality**: ESLint, Prettier configurations
- **Testing**: Jest, E2E testing setup
- **Documentation**: เอกสารครบถ้วนและชัดเจน

## 📋 ข้อกำหนดระบบ

### Development Environment
- **OS**: macOS, Linux, Windows
- **Node.js**: 18.x หรือสูงกว่า
- **Memory**: 8GB RAM ขั้นต่ำ
- **Storage**: 20GB ว่างสำหรับ development

### Production Environment
- **CPU**: 4 cores ขั้นต่ำ
- **Memory**: 16GB RAM ขั้นต่ำ
- **Storage**: 100GB SSD
- **Database**: MySQL 8.0+ หรือ PostgreSQL 13+

## 🤝 การพัฒนาและการมีส่วนร่วม

### Code Standards
- **TypeScript**: ใช้ TypeScript สำหรับทุก component
- **ESLint**: ปฏิบัติตาม ESLint rules
- **Prettier**: Code formatting อัตโนมัติ
- **Conventional Commits**: ใช้ conventional commit messages

### Git Workflow
- **Main Branch**: สำหรับ production code
- **Develop Branch**: สำหรับ development code
- **Feature Branches**: สำหรับ features ใหม่
- **Pull Requests**: code review ก่อน merge

## 📞 การติดต่อและการสนับสนุน

### Documentation
- **API Documentation**: http://localhost:4000/api
- **User Guide**: `/docs` directory
- **Technical Specs**: Architecture documents

### Support Channels
- **Issues**: GitHub Issues สำหรับ bug reports
- **Discussions**: GitHub Discussions สำหรับคำถาม
- **Email**: support@ton-lowcode.com

---

*TON Lowcode Platform - สร้างแอปพลิเคชันอย่างรวดเร็วด้วยเทคโนโลยีที่ทันสมัย* 🚀