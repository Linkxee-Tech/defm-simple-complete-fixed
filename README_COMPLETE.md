# Digital Evidence Framework Management (DEFM) System

## 🎯 Project Completion Status: **95-100%**

### ✅ What's Complete

#### Frontend (React + Vite) - 95%
- ✅ **All Core Pages Implemented:**
  - Dashboard with statistics
  - Cases management (list, create, edit, delete)
  - Case Details page with evidence listing
  - Evidence management with file upload
  - Evidence Details with chain of custody
  - Chain of Custody tracking
  - Reports generation and download
  - User Management (Admin only)
  - Settings page (Profile, Security, Notifications)
  - Login page with authentication
  - 404 Not Found page

- ✅ **Components:**
  - Sidebar with role-based navigation
  - Navbar with user menu
  - AuthContext for authentication
  - ProtectedRoute component
  - Responsive design (mobile-friendly)

- ✅ **API Integration:**
  - Axios service configured
  - JWT token management
  - Request/response interceptors
  - Error handling
  - Auto-refresh token logic

#### Backend (FastAPI + Python 3.11+) - 100%
- ✅ **Complete API Endpoints:**
  - `/api/v1/auth/login` - User authentication
  - `/api/v1/auth/token` - OAuth2 compatible token
  - `/api/v1/users/*` - User CRUD operations
  - `/api/v1/cases/*` - Case management
  - `/api/v1/evidence/*` - Evidence management
  - `/api/v1/chain-of-custody/*` - Chain of custody tracking
  - `/api/v1/reports/*` - Report generation

- ✅ **Database Models:**
  - User (with roles: admin, manager, investigator)
  - Case (with status tracking)
  - Evidence (with file handling)
  - ChainOfCustody (with audit trail)
  - Report (with PDF generation)
  - AuditLog (system-wide auditing)

- ✅ **Security:**
  - JWT authentication
  - Password hashing (bcrypt)
  - Role-based access control (RBAC)
  - CORS configuration
  - Input validation (Pydantic)

- ✅ **Database:**
  - SQLAlchemy 2.0 ORM
  - Alembic migrations
  - SQLite (development) / PostgreSQL (production)
  - Relationship management
  - Automatic timestamps

- ✅ **Python 3.11+ Compatibility:**
  - Lifespan events (not deprecated @app.on_event)
  - Pydantic v2
  - FastAPI 0.104+
  - Type hints and async/await

---

## 📦 Project Structure

```
defm_complete/
├── DEFM_Backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── router.py
│   │   │   ├── dependencies/
│   │   │   │   ├── __init__.py
│   │   │   │   └── auth.py
│   │   │   └── endpoints/
│   │   │       ├── __init__.py
│   │   │       ├── auth.py
│   │   │       ├── users.py
│   │   │       ├── cases.py
│   │   │       ├── evidence.py
│   │   │       ├── chain_of_custody.py
│   │   │       └── reports.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── models.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── initial_data.py
│   │   │   ├── report_service.py
│   │   │   └── audit_service.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── case_utils.py
│   │       ├── file_utils.py
│   │       └── common_utils.py
│   ├── alembic/
│   │   ├── versions/
│   │   │   └── 001_initial.py
│   │   └── env.py
│   ├── main.py
│   ├── requirements.txt
│   ├── .env
│   └── .env.example
│
├── DEFM_Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── useMobile.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Cases.jsx
│   │   │   ├── CaseDetails.jsx
│   │   │   ├── Evidence.jsx
│   │   │   ├── EvidenceDetails.jsx
│   │   │   ├── ChainOfCustody.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── UserManagement.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Backend:** Python 3.11+ (`python --version`)
- **Frontend:** Node.js 16+ and npm (`node --version`)
- **Database:** SQLite (included) or PostgreSQL

### 1. Backend Setup

```bash
cd DEFM_Backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and update SECRET_KEY (required for production)

# Run database migrations
alembic upgrade head

# Start backend server
python main.py

# Or use uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Backend will be available at:** `http://localhost:8000`
**API Documentation:** `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd DEFM_Frontend

# Install dependencies
npm install

# Configure environment (optional)
# Create .env file and set:
# VITE_API_URL=http://localhost:8000

# Start development server
npm run dev
```

**Frontend will be available at:** `http://localhost:5173`

### 3. Default Login Credentials

The system creates default users on first startup:

**Admin Account:**
- Username: `admin`
- Password: `admin123`
- Role: Administrator

**Manager Account:**
- Username: `manager`
- Password: `manager123`
- Role: Manager

**Investigator Account:**
- Username: `investigator`
- Password: `investigator123`
- Role: Investigator

⚠️ **Change these passwords immediately in production!**

---

## 🔧 Configuration

### Backend Configuration (.env)

```env
# Database
DATABASE_URL=sqlite:///./defm.db
# For PostgreSQL: postgresql://user:password@localhost/defm_db

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# File Storage
UPLOAD_DIRECTORY=./uploads
MAX_FILE_SIZE=100000000
ALLOWED_FILE_TYPES=pdf,doc,docx,txt,jpg,jpeg,png,gif,mp4,avi,mov,zip,rar,7z,log

# Application
APP_NAME=Digital Evidence Framework Management
APP_VERSION=1.0.0
DEBUG=True

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5174
```

### Frontend Configuration (.env)

```env
VITE_API_URL=http://localhost:8000
```

---

## 📋 Features

### User Management
- ✅ Role-based access control (Admin, Manager, Investigator)
- ✅ User creation, editing, and deletion
- ✅ Password management
- ✅ User activation/deactivation

### Case Management
- ✅ Create and manage forensic cases
- ✅ Case status tracking (Open, In Progress, Closed, Archived)
- ✅ Priority levels (Low, Medium, High, Critical)
- ✅ Case assignment to investigators
- ✅ Client information tracking
- ✅ Case timeline and activity log

### Evidence Management
- ✅ Evidence item tracking
- ✅ File upload and storage
- ✅ Evidence type classification
- ✅ Hash verification (SHA256)
- ✅ Evidence status tracking
- ✅ Collection location and metadata

### Chain of Custody
- ✅ Complete audit trail
- ✅ Transfer tracking
- ✅ Handler history
- ✅ Location tracking
- ✅ Timestamped entries
- ✅ Notes and annotations

### Reporting
- ✅ Case report generation
- ✅ PDF export
- ✅ Custom report templates
- ✅ Report history
- ✅ Download functionality

### Security
- ✅ JWT authentication
- ✅ Secure password hashing
- ✅ Role-based permissions
- ✅ API request validation
- ✅ CORS configuration
- ✅ Audit logging

---

## 🔐 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/token` - OAuth2 token

### Users
- `GET /api/v1/users/me` - Current user
- `GET /api/v1/users` - List all users
- `GET /api/v1/users/{id}` - Get user by ID
- `POST /api/v1/users` - Create user
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user

### Cases
- `GET /api/v1/cases/dashboard` - Dashboard statistics
- `GET /api/v1/cases` - List cases
- `GET /api/v1/cases/{id}` - Get case details
- `POST /api/v1/cases` - Create case
- `PUT /api/v1/cases/{id}` - Update case
- `DELETE /api/v1/cases/{id}` - Delete case

### Evidence
- `GET /api/v1/evidence` - List evidence
- `GET /api/v1/evidence/{id}` - Get evidence details
- `POST /api/v1/evidence` - Create evidence
- `PUT /api/v1/evidence/{id}` - Update evidence
- `DELETE /api/v1/evidence/{id}` - Delete evidence
- `POST /api/v1/evidence/{id}/upload` - Upload file
- `POST /api/v1/evidence/{id}/verify-integrity` - Verify hash

### Chain of Custody
- `GET /api/v1/chain-of-custody` - List entries
- `GET /api/v1/chain-of-custody/evidence/{id}` - Get by evidence
- `POST /api/v1/chain-of-custody` - Create entry
- `POST /api/v1/chain-of-custody/transfer` - Transfer evidence

### Reports
- `GET /api/v1/reports` - List reports
- `POST /api/v1/reports/generate/{case_id}` - Generate report
- `GET /api/v1/reports/{id}/download` - Download report

---

## 🐳 Docker Deployment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 📊 Technology Stack

### Backend
- **Framework:** FastAPI 0.104+
- **Python:** 3.11+
- **Database:** SQLAlchemy 2.0, Alembic
- **Auth:** JWT, PassLib, BCrypt
- **File Handling:** AioFiles, Pillow
- **PDF Generation:** ReportLab
- **Validation:** Pydantic v2

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite 4
- **Routing:** React Router DOM 6
- **Styling:** Tailwind CSS 3
- **Icons:** Lucide React
- **HTTP Client:** Axios

---

## 🧪 Testing

### Backend Tests
```bash
cd DEFM_Backend
pytest
```

### Frontend Tests
```bash
cd DEFM_Frontend
npm test
```

---

## 📝 Development Notes

### Adding New Features
1. **Backend:** Add endpoint in `app/api/endpoints/`, update router
2. **Frontend:** Create page in `src/pages/`, add route in `App.jsx`
3. **Update API service** in `src/services/api.js`

### Database Migrations
```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migration
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## 🐛 Troubleshooting

### Backend Issues
- **Database connection:** Check `DATABASE_URL` in `.env`
- **Import errors:** Ensure virtual environment is activated
- **Permission errors:** Check upload directory permissions

### Frontend Issues
- **API connection:** Verify `VITE_API_URL` matches backend
- **CORS errors:** Check `ALLOWED_ORIGINS` in backend `.env`
- **Build errors:** Delete `node_modules` and reinstall

---

## 📄 License

[Add your license here]

---

## 👥 Contributors

- **Project Lead:** [Your Name]
- **Backend Development:** Python 3.11+ FastAPI
- **Frontend Development:** React + Vite

---

## 📧 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@defm.example.com
- Documentation: http://localhost:8000/docs

---

**Built with ❤️ for Digital Forensics Professionals**
