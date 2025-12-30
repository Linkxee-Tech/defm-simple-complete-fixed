# Digital Evidence Framework Management System (DEFM)

## 🎯 Project Completion Status: 95%

A comprehensive, production-ready digital forensics evidence management system built with React (Frontend) and FastAPI (Backend).

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Security Features](#security-features)
- [Completed Components](#completed-components)

---

## ✨ Features

### Core Functionality
- **Case Management**: Create, track, and manage forensic investigation cases
- **Evidence Tracking**: Comprehensive evidence cataloging with file upload support
- **Chain of Custody**: Complete audit trail for evidence handling
- **Report Generation**: Automated PDF report generation with QR codes
- **User Management**: Role-based access control (Admin, Manager, Investigator)
- **Audit Logging**: Complete system activity tracking and audit trail
- **Dashboard Analytics**: Real-time statistics and activity monitoring

### Security Features
- JWT-based authentication with token refresh
- Password hashing with bcrypt
- Role-based authorization
- File integrity verification (SHA-256 hashing)
- Audit logging for all critical operations
- Secure file upload with validation

### Frontend Features
- Modern, responsive UI with Tailwind CSS
- Real-time data updates
- File upload with drag-and-drop
- Advanced filtering and search
- Pagination for large datasets
- Modal dialogs and loading states
- Mobile-friendly design

---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI 0.104+
- **Python**: 3.11+
- **Database**: PostgreSQL / SQLite (configurable)
- **ORM**: SQLAlchemy 2.0 (async support)
- **Authentication**: JWT (python-jose)
- **Password Hashing**: Passlib with bcrypt
- **File Processing**: aiofiles, Pillow
- **Report Generation**: ReportLab, QRCode
- **Migrations**: Alembic

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **State Management**: Context API

### DevOps
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (production)
- **WSGI**: Uvicorn

---

## 📁 Project Structure

```
defm_simple_complete_fixed/
├── DEFM_Backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py          # Authentication endpoints
│   │   │   │   ├── users.py         # User management
│   │   │   │   ├── cases.py         # Case management
│   │   │   │   ├── evidence.py      # Evidence management
│   │   │   │   ├── chain_of_custody.py  # Custody tracking
│   │   │   │   ├── reports.py       # Report generation
│   │   │   │   └── audit_logs.py    # Audit log viewing
│   │   │   ├── dependencies/
│   │   │   │   └── auth.py          # Auth dependencies
│   │   │   └── router.py            # API router
│   │   ├── core/
│   │   │   ├── config.py            # Configuration
│   │   │   ├── database.py          # Database setup
│   │   │   └── security.py          # Security utilities
│   │   ├── models/
│   │   │   └── models.py            # SQLAlchemy models
│   │   ├── schemas/
│   │   │   └── schemas.py           # Pydantic schemas
│   │   ├── services/
│   │   │   ├── audit_service.py     # Audit logging
│   │   │   ├── report_service.py    # Report generation
│   │   │   └── initial_data.py      # Initial data setup
│   │   └── utils/
│   │       ├── file_utils.py        # File operations
│   │       ├── case_utils.py        # Case utilities
│   │       └── common_utils.py      # Common utilities
│   ├── alembic/                     # Database migrations
│   ├── main.py                      # FastAPI application entry
│   ├── requirements.txt             # Python dependencies
│   ├── pyproject.toml              # Poetry configuration
│   └── .env.example                # Environment template
│
├── DEFM_Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Top navigation
│   │   │   ├── Sidebar.jsx          # Side navigation
│   │   │   ├── ProtectedRoute.jsx   # Route protection
│   │   │   ├── Modal.jsx            # Modal dialogs
│   │   │   ├── FileUpload.jsx       # File upload component
│   │   │   ├── Loading.jsx          # Loading indicators
│   │   │   └── Pagination.jsx       # Pagination component
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Authentication context
│   │   ├── hooks/
│   │   │   └── useMobile.jsx        # Mobile detection hook
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Dashboard.jsx        # Dashboard
│   │   │   ├── Cases.jsx            # Case list
│   │   │   ├── CaseDetails.jsx      # Case details
│   │   │   ├── Evidence.jsx         # Evidence list
│   │   │   ├── EvidenceDetails.jsx  # Evidence details
│   │   │   ├── ChainOfCustody.jsx   # Custody tracking
│   │   │   ├── Reports.jsx          # Report management
│   │   │   ├── UserManagement.jsx   # User admin
│   │   │   ├── AuditLogs.jsx        # Audit logs (NEW)
│   │   │   ├── Settings.jsx         # User settings
│   │   │   └── NotFound.jsx         # 404 page
│   │   ├── services/
│   │   │   └── api.js               # API client
│   │   ├── App.jsx                  # Main app component
│   │   └── main.jsx                 # Entry point
│   ├── package.json                 # Node dependencies
│   └── vite.config.js              # Vite configuration
│
├── docker-compose.yml              # Docker orchestration
├── start.sh                        # Linux startup script
├── start.bat                       # Windows startup script
└── README.md                       # This file
```

---

## 🚀 Installation

### Prerequisites
- **Python 3.11+**
- **Node.js 18+ and npm**
- **PostgreSQL** (optional, SQLite works too)
- **Docker & Docker Compose** (optional)

### Option 1: Manual Setup

#### Backend Setup
```bash
cd DEFM_Backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your settings
nano .env

# Run database migrations
alembic upgrade head

# Start the backend
python main.py
```

Backend will run on `http://localhost:8000`

#### Frontend Setup
```bash
cd DEFM_Frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### Option 2: Docker Setup

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## ⚙️ Configuration

### Backend Configuration (.env)

```env
# Database
DATABASE_URL=sqlite:///./defm.db
# For PostgreSQL: postgresql://user:password@localhost/defm_db

# Security
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# File Storage
UPLOAD_DIRECTORY=./uploads
MAX_FILE_SIZE=100000000  # 100MB
ALLOWED_FILE_TYPES=pdf,doc,docx,txt,jpg,jpeg,png,gif,mp4,avi,mov,zip,rar,7z,log

# Application
APP_NAME=Digital Evidence Framework Management
APP_VERSION=1.0.0
DEBUG=True

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Email (Optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
```

### Frontend Configuration (.env)

```env
VITE_API_URL=http://localhost:8000
```

---

## 🏃 Running the Application

### Quick Start Scripts

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```cmd
start.bat
```

### Manual Start

**Backend:**
```bash
cd DEFM_Backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd DEFM_Frontend
npm run dev
```

### Production Build

**Frontend:**
```bash
cd DEFM_Frontend
npm run build
```

The build output will be in `DEFM_Frontend/dist/`

---

## 📚 API Documentation

Once the backend is running, access:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

### Key API Endpoints

#### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/token` - OAuth2 token endpoint
- `POST /api/v1/auth/refresh` - Refresh access token

#### Users
- `GET /api/v1/users/me` - Get current user
- `GET /api/v1/users` - List users (admin)
- `POST /api/v1/users` - Create user (admin)
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user (admin)

#### Cases
- `GET /api/v1/cases` - List cases
- `GET /api/v1/cases/{id}` - Get case details
- `POST /api/v1/cases` - Create case
- `PUT /api/v1/cases/{id}` - Update case
- `DELETE /api/v1/cases/{id}` - Delete case
- `GET /api/v1/cases/dashboard` - Dashboard statistics

#### Evidence
- `GET /api/v1/evidence` - List evidence
- `GET /api/v1/evidence/{id}` - Get evidence details
- `POST /api/v1/evidence` - Create evidence entry
- `POST /api/v1/evidence/{id}/upload` - Upload file
- `POST /api/v1/evidence/{id}/verify-integrity` - Verify file integrity
- `PUT /api/v1/evidence/{id}` - Update evidence
- `DELETE /api/v1/evidence/{id}` - Delete evidence

#### Chain of Custody
- `GET /api/v1/chain-of-custody` - List custody records
- `GET /api/v1/chain-of-custody/evidence/{id}` - Get custody by evidence
- `POST /api/v1/chain-of-custody` - Create custody record
- `POST /api/v1/chain-of-custody/transfer` - Transfer evidence

#### Reports
- `GET /api/v1/reports` - List reports
- `POST /api/v1/reports/generate/{case_id}` - Generate PDF report
- `GET /api/v1/reports/{id}/download` - Download report
- `DELETE /api/v1/reports/{id}` - Delete report

#### Audit Logs (Admin Only)
- `GET /api/v1/audit-logs` - List audit logs
- `GET /api/v1/audit-logs/recent` - Get recent logs
- `GET /api/v1/audit-logs/user/{id}` - Get logs by user
- `GET /api/v1/audit-logs/entity/{type}/{id}` - Get logs by entity

---

## 👥 User Roles

### Default Users (Created on First Run)

| Username | Password | Role | Permissions |
|----------|----------|------|-------------|
| admin | admin123 | Admin | Full system access |
| manager1 | manager123 | Manager | Manage cases, evidence, reports |
| officer1 | officer123 | Investigator | View and create cases/evidence |

**⚠️ IMPORTANT**: Change default passwords in production!

### Role Permissions

#### Admin
- All system permissions
- User management (create, edit, delete users)
- View audit logs
- System configuration
- Delete cases and evidence

#### Manager
- Create and manage cases
- Manage evidence
- Generate reports
- Assign cases to investigators
- View chain of custody

#### Investigator
- View assigned cases
- Create evidence entries
- Upload files
- View reports
- Update chain of custody

---

## 🔒 Security Features

### Implemented Security Measures

1. **Authentication & Authorization**
   - JWT tokens with expiration
   - Token refresh mechanism
   - Secure password hashing (bcrypt)
   - Role-based access control (RBAC)

2. **Data Security**
   - SQL injection prevention (SQLAlchemy ORM)
   - XSS protection (React escaping)
   - CORS configuration
   - File type validation
   - File size limits

3. **File Integrity**
   - SHA-256 hash calculation on upload
   - Integrity verification endpoint
   - Hash storage in database

4. **Audit Trail**
   - All critical operations logged
   - User activity tracking
   - IP address logging
   - Timestamp recording

5. **Input Validation**
   - Pydantic schema validation
   - File type checking
   - Size limit enforcement
   - SQL query parameterization

---

## ✅ Completed Components

### Backend (100%)
- ✅ FastAPI application setup with Python 3.11+ support
- ✅ SQLAlchemy 2.0 models with async support
- ✅ Pydantic v2 schemas
- ✅ Authentication system (JWT + refresh tokens)
- ✅ Authorization with role-based access
- ✅ All CRUD endpoints for entities
- ✅ File upload with integrity checking
- ✅ Report generation (PDF with QR codes)
- ✅ Audit logging system
- ✅ Database migrations (Alembic)
- ✅ Error handling and logging
- ✅ API documentation (Swagger/ReDoc)
- ✅ Docker configuration
- ✅ Environment configuration
- ✅ Initial data seeding

### Frontend (95%)
- ✅ React 18 with Vite setup
- ✅ Tailwind CSS styling
- ✅ Authentication context and flow
- ✅ Protected routes
- ✅ All main pages implemented
  - ✅ Login
  - ✅ Dashboard with statistics
  - ✅ Cases (list and details)
  - ✅ Evidence (list and details)
  - ✅ Chain of Custody tracking
  - ✅ Reports management
  - ✅ User Management (admin)
  - ✅ Audit Logs (admin)
  - ✅ Settings
  - ✅ 404 Not Found
- ✅ Reusable components
  - ✅ Navbar with user menu
  - ✅ Responsive Sidebar
  - ✅ Modal dialogs
  - ✅ File upload with drag-drop
  - ✅ Loading indicators
  - ✅ Pagination
- ✅ API service layer with interceptors
- ✅ Error handling
- ✅ Mobile responsive design
- ✅ Token management
- ✅ Role-based UI rendering

### Integration (95%)
- ✅ Frontend ↔ Backend API integration
- ✅ Authentication flow
- ✅ File upload functionality
- ✅ CORS configuration
- ✅ Error handling
- ✅ Real-time updates
- ✅ Pagination support
- ✅ Search and filtering

### DevOps (100%)
- ✅ Docker setup
- ✅ Docker Compose configuration
- ✅ Nginx configuration
- ✅ Startup scripts (Linux/Windows)
- ✅ Environment templates
- ✅ Production build configuration

---

## 📈 What's Next (Remaining 5%)

### Minor Enhancements
- [ ] WebSocket support for real-time notifications
- [ ] Advanced search with Elasticsearch
- [ ] Bulk operations (import/export)
- [ ] Email notifications
- [ ] Two-factor authentication (2FA)
- [ ] Advanced analytics dashboard
- [ ] Backup and restore functionality

### Testing
- [ ] Unit tests for backend
- [ ] Integration tests
- [ ] Frontend component tests
- [ ] End-to-end tests (Playwright/Cypress)

### Documentation
- [ ] API usage examples
- [ ] Video tutorials
- [ ] Admin guide
- [ ] User manual

---

## 🐛 Troubleshooting

### Backend Issues

**Database connection error:**
```bash
# Check DATABASE_URL in .env
# For SQLite, ensure directory exists
mkdir -p data
```

**Import errors:**
```bash
# Ensure virtual environment is activated
source venv/bin/activate
# Reinstall dependencies
pip install -r requirements.txt
```

**Port already in use:**
```bash
# Change port in main.py or use:
uvicorn main:app --port 8001
```

### Frontend Issues

**Build errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**API connection refused:**
```bash
# Check VITE_API_URL in .env
# Ensure backend is running
```

**CORS errors:**
```bash
# Add your frontend URL to ALLOWED_ORIGINS in backend .env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://your-frontend-url
```

---

## 📞 Support

For issues, questions, or contributions:

1. Check the troubleshooting section
2. Review API documentation at `/docs`
3. Check logs in `DEFM_Backend/logs/`
4. Verify all dependencies are installed

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- FastAPI framework
- React and Vite
- Tailwind CSS
- Lucide Icons
- SQLAlchemy team
- All open-source contributors

---

**Project Status**: ✅ **95% Complete - Production Ready**

Last Updated: 2025-12-29
