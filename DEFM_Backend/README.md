# Digital Evidence Framework Management (DEFM) - Backend

A comprehensive backend system for managing digital forensic evidence, chain of custody, and case management.

## Features

- **User Management**: Role-based access control (Admin, Manager, Investigator)
- **Case Management**: Create, update, and track forensic cases
- **Evidence Management**: Upload, store, and catalog digital evidence
- **Chain of Custody**: Complete audit trail for evidence handling
- **Reporting**: Generate detailed reports and analytics
- **Security**: JWT authentication, encryption, and audit logging
- **File Management**: Secure file storage with integrity validation
- **Search & Filter**: Advanced search capabilities across all entities

## Technology Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL (with SQLite support for development)
- **ORM**: SQLAlchemy
- **Authentication**: JWT with bcrypt
- **File Storage**: Local filesystem with plans for cloud integration
- **Documentation**: Auto-generated OpenAPI/Swagger docs

## Installation

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize database:
```bash
alembic upgrade head
```

5. Run the application:
```bash
uvicorn main:app --reload
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
DEFM_Backend/
├── app/
│   ├── api/
│   │   ├── endpoints/
│   │   └── dependencies/
│   ├── core/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   └── utils/
├── alembic/
├── uploads/
├── reports/
├── main.py
└── requirements.txt
```

## Default Users

The system comes with pre-configured users:
- **admin/admin123** - System Administrator
- **manager/mgr123** - Manager (Ibrahim Isa)
- **investigator1/inv111** - Investigator (Solomon John)
- **investigator2/inv122** - Investigator (Ahmad Lawal)
- **investigator3/inv133** - Investigator (Mike Davis)

## License

This project is licensed under the MIT License.