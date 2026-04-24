# Digital Evidence Framework Management (DEFM)

Full Project Documentation

---

## 1. Overview

DEFM is a full-stack digital forensics case management platform for handling:

- Case lifecycle management
- Digital evidence registration and file handling
- Chain-of-custody tracking
- Audit logging and accountability
- Report generation and download

The platform is built with a FastAPI backend and a React frontend, with optional Docker and Capacitor Android packaging.

---

## 2. Core Objectives

DEFM is designed to provide:

- Secure role-based access for investigators, managers, and administrators
- Structured case/evidence workflows
- Evidence integrity control through server-generated hash values
- Operational traceability through audit logs
- Usable dashboard/reporting for day-to-day forensic operations

---

## 3. Technology Stack

### Backend

- Python 3.11
- FastAPI
- SQLAlchemy ORM
- Alembic migrations
- JWT authentication (`python-jose`)
- Password hashing (`passlib` + bcrypt)
- Report generation (`reportlab`)

### Frontend

- React 18
- Vite
- React Router
- Axios
- TailwindCSS
- Lucide icons

### Mobile Packaging

- Capacitor
- Android Gradle project

### Deployment

- Docker / Docker Compose
- Nginx (frontend container)
- PostgreSQL (containerized option)

---

## 4. Repository Structure

```text
/
  DEFM_Backend/
    app/
      api/
      core/
      db/
      models/
      schemas/
      services/
      utils/
    alembic/
    main.py
    requirements.txt
  DEFM_Frontend/
    src/
      components/
      context/
      hooks/
      pages/
      services/
    android/
    package.json
    vite.config.js
  docker-compose.yml
  README.md
  USER_GUIDE.md
  PROJECT_DOCUMENTATION.md
```

---

## 5. System Architecture

### High-Level Flow

1. User authenticates via frontend login.
2. Backend validates credentials and issues JWT.
3. Frontend stores token and sends it in `Authorization: Bearer <token>`.
4. Role-protected API endpoints execute business logic.
5. SQLAlchemy persists and retrieves data from DB.
6. Audit service records critical actions.
7. Evidence file operations write to filesystem storage and store metadata in DB.

### Main Domains

- Users and roles
- Cases
- Evidence
- Chain of custody
- Reports
- Audit logs

---

## 6. Backend Documentation

### 6.1 Entry Point

- `DEFM_Backend/main.py`

Responsibilities:

- FastAPI app initialization
- CORS middleware
- Router registration (`/api/v1`)
- Health endpoint
- Error handlers

### 6.2 Configuration

- `DEFM_Backend/app/core/config.py`

Key settings:

- `DATABASE_URL`
- `SECRET_KEY`
- `ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `UPLOAD_DIRECTORY`
- `MAX_FILE_SIZE`
- `ALLOWED_FILE_TYPES`
- `DEBUG`
- `ALLOWED_ORIGINS`

### 6.3 Database Layer

- `DEFM_Backend/app/core/database.py`
- `DEFM_Backend/alembic/`

Provides:

- SQLAlchemy engine/session
- `get_db()` dependency
- metadata table creation helper
- Alembic migration flow

### 6.4 Data Models

- `DEFM_Backend/app/models/models.py`

Primary models:

- `User`
- `Case`
- `Evidence`
- `ChainOfCustody`
- `Report`
- `EvidenceTag`
- `AuditLog`

Enums:

- `UserRole`
- `CaseStatus`
- `EvidenceType`
- `EvidenceStatus`
- `Priority`

### 6.5 API Routers

- `DEFM_Backend/app/api/router.py`

Registered endpoint groups:

- `auth`
- `users`
- `cases`
- `evidence`
- `chain-of-custody`
- `reports`
- `audit-logs`
- `admin`
- `dashboard`
- `acquisition`
- `search`
- `bulk`
- `notifications`

### 6.6 Authentication & Authorization

- `DEFM_Backend/app/api/endpoints/auth.py`
- `DEFM_Backend/app/api/dependencies/auth.py`
- `DEFM_Backend/app/core/security.py`

Flow:

1. User logs in with username/password.
2. Backend verifies bcrypt password hash.
3. JWT access token is created with `sub=username`.
4. Protected endpoints use `get_current_user`.
5. Role checks via `require_admin` / custom logic.

### 6.7 Evidence File & Hash Flow

- `DEFM_Backend/app/api/endpoints/evidence.py`
- `DEFM_Backend/app/utils/file_utils.py`

Behavior:

1. Evidence metadata entry is created.
2. File upload endpoint validates size/type.
3. File is saved to `UPLOAD_DIRECTORY/<case_id>/<evidence_id>/`.
4. SHA-256 hash is computed server-side and stored in DB (`file_hash`).
5. Verify-integrity endpoint recomputes hash from disk and compares with stored hash.

### 6.8 Audit Logging

- `DEFM_Backend/app/services/audit_service.py`

Used across endpoints to log:

- create/update/delete operations
- file uploads
- integrity checks
- bulk operations

---

## 7. Frontend Documentation

### 7.1 Entry and App Shell

- `DEFM_Frontend/src/main.jsx`
- `DEFM_Frontend/src/App.jsx`

Responsibilities:

- React root mount
- AuthProvider wrapping
- Router setup
- Main shell layout (Navbar + Sidebar + routed content)

### 7.2 Auth Context

- `DEFM_Frontend/src/context/AuthContext.jsx`

Responsibilities:

- Login/logout orchestration
- Token/user persistence in localStorage
- Startup token validation via `/users/me`

### 7.3 API Client

- `DEFM_Frontend/src/services/api.js`

Features:

- Axios instance with base URL `/api/v1`
- Request interceptor for JWT header
- Response interceptor for auth failure handling
- Domain API groups: auth, users, cases, evidence, custody, reports, audit logs

### 7.4 Main Pages

- `Dashboard`
- `Cases`
- `CaseDetails`
- `Evidence`
- `EvidenceDetails`
- `ChainOfCustody`
- `Reports`
- `UserManagement`
- `AuditLogs`
- `Settings`
- `Login`
- `NotFound`

### 7.5 Evidence Form Stability

The Add Evidence flow is implemented in:

- `DEFM_Frontend/src/pages/Evidence.jsx`

Current behavior:

- Stable form rendering for smooth typing
- Controlled inputs bound to backend-compatible fields
- Optional file upload after metadata creation
- Hash/timestamp generated by backend

---

## 8. API Functional Map

Base path: `/api/v1`

### Authentication

- `POST /auth/login`
- `POST /auth/token`
- `POST /auth/refresh`
- `GET /auth/me`

### Users

- `GET /users/me`
- `GET /users/`
- `GET /users/{id}`
- `POST /users/`
- `PUT /users/{id}`
- `DELETE /users/{id}`

### Cases

- `GET /cases/dashboard`
- `GET /cases/`
- `GET /cases/{id}`
- `POST /cases/`
- `PUT /cases/{id}`
- `DELETE /cases/{id}`

### Evidence

- `GET /evidence/`
- `GET /evidence/{id}`
- `POST /evidence/`
- `PUT /evidence/{id}`
- `DELETE /evidence/{id}`
- `POST /evidence/{id}/upload`
- `GET /evidence/{id}/download`
- `POST /evidence/{id}/verify-integrity`

### Chain of Custody

- `GET /chain-of-custody/`
- `GET /chain-of-custody/{id}`
- `GET /chain-of-custody/evidence/{evidence_id}`
- `POST /chain-of-custody/`
- `POST /chain-of-custody/transfer`
- `DELETE /chain-of-custody/{id}`

### Reports

- `GET /reports/`
- `GET /reports/{id}`
- `POST /reports/`
- `POST /reports/generate/{case_id}`
- `GET /reports/{id}/download`
- `DELETE /reports/{id}`

### Other Modules

- Dashboard stats: `/dashboard/stats`
- Search: `/search/evidence`, `/search/cases`
- Bulk operations: `/bulk/...`
- Notifications: `/notifications/...`
- Acquisition: `/acquisition/evidence`

---

## 9. Roles and Access Control

### Investigator

- Create and work on assigned operational records
- Limited destructive/admin access

### Manager

- Broader operational management
- Case/evidence/report deletion where permitted

### Admin

- Full administrative access
- User management
- Audit visibility

---

## 10. Setup and Run

## 10.1 Backend (Local)

```bash
cd DEFM_Backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

API docs:

- `http://localhost:8000/docs`

## 10.2 Frontend (Local)

```bash
cd DEFM_Frontend
npm install
npm run dev
```

Frontend:

- `http://localhost:3000` (per current Vite config)

## 10.3 Docker

```bash
docker-compose up -d
```

---

## 11. Environment Variables

Common backend variables:

- `DATABASE_URL`
- `SECRET_KEY`
- `ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `UPLOAD_DIRECTORY`
- `MAX_FILE_SIZE`
- `ALLOWED_FILE_TYPES`
- `DEBUG`
- `ALLOWED_ORIGINS`

Common frontend variables:

- `VITE_API_URL`

---

## 12. Data Integrity and Security Notes

- Passwords are stored as bcrypt hashes.
- JWT-based bearer authentication protects API routes.
- Evidence file hash is server-generated and persisted.
- Integrity verification is available per evidence item.
- Audit logs provide action traceability.

Recommended production hardening:

- Strong secret key and secure env management
- HTTPS + reverse proxy
- Restrictive CORS configuration
- PostgreSQL for production workloads
- Regular database and file backups

---

## 13. Testing and Validation

Current practical checks:

- Backend syntax/import validation via Python compile/import checks
- Frontend build/lint checks depending on local shell policy and environment permissions

If build tooling is blocked by host policy (PowerShell/npm/esbuild permissions), run checks from an allowed shell (cmd/git-bash/CI agent).

---

## 14. Known Operational Considerations

- Some utility/admin modules are still operational placeholders by design (for example notification read-state persistence).
- Documentation and legacy scripts may differ from active runtime behavior; this file documents current project intent and architecture.
- Keep frontend field names aligned with backend schemas when extending forms/endpoints.

---

## 15. Maintenance Guidelines

When adding new features:

1. Update SQLAlchemy model + schema together.
2. Update endpoint payload/response contracts.
3. Update frontend API client and page form bindings.
4. Add/extend audit logging for critical actions.
5. Update user-facing guide (`USER_GUIDE.md`) and this documentation.

---

## 16. Useful Files Index

- Backend app entry: `DEFM_Backend/main.py`
- Backend router: `DEFM_Backend/app/api/router.py`
- Backend models: `DEFM_Backend/app/models/models.py`
- Backend evidence endpoint: `DEFM_Backend/app/api/endpoints/evidence.py`
- Backend security: `DEFM_Backend/app/core/security.py`
- Frontend app shell: `DEFM_Frontend/src/App.jsx`
- Frontend auth context: `DEFM_Frontend/src/context/AuthContext.jsx`
- Frontend API client: `DEFM_Frontend/src/services/api.js`
- Frontend evidence page: `DEFM_Frontend/src/pages/Evidence.jsx`
- User guide: `USER_GUIDE.md`

---

## 17. Document Control

- Document name: `PROJECT_DOCUMENTATION.md`
- Scope: Full system technical and operational reference
- Audience: Developers, DevOps, Technical Leads, Admin Operators

