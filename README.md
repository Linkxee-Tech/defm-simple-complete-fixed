# DEFM - Digital Evidence Framework Management

A comprehensive full-stack web application for managing digital forensic evidence with chain of custody tracking, case management, and reporting capabilities.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (Admin, Manager, Investigator)
- **Case Management**: Create, track, and manage forensic investigation cases
- **Evidence Management**: Upload, store, and track digital evidence with hash verification
- **Chain of Custody**: Complete audit trail for evidence handling
- **Report Generation**: Generate comprehensive case reports in PDF and text formats
- **Dashboard**: Real-time statistics and recent activity monitoring
- **Audit Logging**: Track all system activities for compliance

## Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLAlchemy ORM with SQLite/PostgreSQL support
- **Authentication**: JWT tokens with Bearer authentication
- **Security**: Password hashing with bcrypt
- **File Upload**: Multipart form data with hash verification
- **PDF Generation**: ReportLab

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Project Structure

```
defm_simple/
├── DEFM_Backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/      # API route handlers
│   │   │   └── dependencies/   # Dependency injection
│   │   ├── core/               # Core configuration
│   │   ├── models/             # Database models
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── services/           # Business logic
│   │   └── utils/              # Utility functions
│   ├── alembic/                # Database migrations
│   ├── main.py                 # Application entry point
│   └── requirements.txt        # Python dependencies
│
└── DEFM_Frontend/
    ├── src/
    │   ├── components/         # Reusable components
    │   ├── context/            # React context providers
    │   ├── hooks/              # Custom React hooks
    │   ├── pages/              # Page components
    │   ├── services/           # API service layer
    │   ├── App.jsx             # Main app component
    │   └── main.jsx            # Application entry
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Installation & Setup

### Prerequisites
- Python 3.9 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd DEFM_Backend
```

2. Create virtual environment:
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create environment configuration:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Initialize database:
```bash
# Database will be automatically created on first run
python main.py
```

The backend will start on `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd DEFM_Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
cp .env.example .env
# Edit .env with your API URL
```

4. Start development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## API Documentation

Once the backend is running, you can access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### API Endpoints

#### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/token` - OAuth2 token endpoint

#### Users
- `GET /api/v1/users/me` - Get current user
- `GET /api/v1/users` - List all users (admin only)
- `POST /api/v1/users` - Create user (admin only)
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user (admin only)

#### Cases
- `GET /api/v1/cases/dashboard` - Get dashboard statistics
- `GET /api/v1/cases` - List cases
- `GET /api/v1/cases/{id}` - Get case details
- `POST /api/v1/cases` - Create new case
- `PUT /api/v1/cases/{id}` - Update case
- `DELETE /api/v1/cases/{id}` - Delete case (admin/manager)

#### Evidence
- `GET /api/v1/evidence` - List evidence
- `GET /api/v1/evidence/{id}` - Get evidence details
- `POST /api/v1/evidence` - Create evidence entry
- `PUT /api/v1/evidence/{id}` - Update evidence
- `POST /api/v1/evidence/{id}/upload` - Upload evidence file
- `POST /api/v1/evidence/{id}/verify-integrity` - Verify file integrity
- `DELETE /api/v1/evidence/{id}` - Delete evidence (admin/manager)

#### Chain of Custody
- `GET /api/v1/chain-of-custody` - List custody records
- `GET /api/v1/chain-of-custody/evidence/{id}` - Get evidence custody chain
- `POST /api/v1/chain-of-custody` - Create custody record
- `POST /api/v1/chain-of-custody/transfer` - Transfer evidence custody
- `DELETE /api/v1/chain-of-custody/{id}` - Delete record (admin/manager)

#### Reports
- `GET /api/v1/reports` - List reports
- `GET /api/v1/reports/{id}` - Get report details
- `POST /api/v1/reports` - Create report
- `POST /api/v1/reports/generate/{case_id}` - Generate case report
- `GET /api/v1/reports/{id}/download` - Download report file
- `DELETE /api/v1/reports/{id}` - Delete report (admin/manager)

## Default User Accounts

The system is initialized with the following default accounts:

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| manager | mgr123 | Manager |
| investigator1 | inv111 | Investigator |
| investigator2 | inv122 | Investigator |
| investigator3 | inv133 | Investigator |

**⚠️ IMPORTANT**: Change these passwords in production!

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=sqlite:///./defm.db

# Security
SECRET_KEY=your-secret-key-here
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
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=DEFM - Digital Evidence Framework Management
VITE_APP_VERSION=1.0.0
```

## Docker Deployment

### Using Docker Compose

1. Ensure Docker and Docker Compose are installed
2. Build and start containers:
```bash
docker-compose up -d
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Individual Container Build

Backend:
```bash
cd DEFM_Backend
docker build -t defm-backend .
docker run -p 8000:8000 defm-backend
```

Frontend:
```bash
cd DEFM_Frontend
docker build -t defm-frontend .
docker run -p 3000:80 defm-frontend
```

## Development

### Backend Development

Run with auto-reload:
```bash
cd DEFM_Backend
python main.py
```

### Frontend Development

Run with hot-reload:
```bash
cd DEFM_Frontend
npm run dev
```

### Database Migrations

Create new migration:
```bash
cd DEFM_Backend
alembic revision --autogenerate -m "Description"
```

Apply migrations:
```bash
alembic upgrade head
```

## Production Deployment

### Security Checklist

- [ ] Change SECRET_KEY to a strong random value
- [ ] Update all default passwords
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable HTTPS/SSL
- [ ] Configure proper CORS origins
- [ ] Set DEBUG=False
- [ ] Implement rate limiting
- [ ] Set up backup strategy
- [ ] Configure logging
- [ ] Enable security headers

### Recommended Production Setup

1. **Database**: PostgreSQL with regular backups
2. **Reverse Proxy**: Nginx for SSL termination and static file serving
3. **Process Manager**: Systemd or Supervisor for backend
4. **Environment**: Use environment variables, not .env files
5. **Monitoring**: Set up application monitoring (e.g., Prometheus, Grafana)
6. **Logging**: Centralized logging (e.g., ELK stack)

## Testing

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

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For issues, questions, or contributions, please contact the development team or create an issue in the repository.

## Changelog

### Version 1.0.0 (2024-12-23)
- Initial release
- User authentication and authorization
- Case management
- Evidence tracking with file uploads
- Chain of custody tracking
- Report generation
- Dashboard with statistics
- Audit logging

## Known Issues

1. Tests are not yet implemented
2. Email notifications are not configured
3. Real-time updates require page refresh
4. Limited file type validation on frontend

## Future Enhancements

1. Unit and integration tests
2. Email notifications for case updates
3. Real-time updates with WebSockets
4. Enhanced reporting with charts and graphs
5. Mobile-responsive improvements
6. Bulk operations (import/export)
7. Advanced search and filtering
8. File preview capabilities
9. Audit trail visualization
10. Role-based dashboard customization
11. Two-factor authentication
12. API rate limiting
13. Backup and restore functionality
14. Multi-language support

---

**Built with ❤️ for Digital Forensic Professionals**
