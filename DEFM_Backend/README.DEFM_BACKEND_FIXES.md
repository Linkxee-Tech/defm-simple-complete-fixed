# DEFM Backend - Fixes and Deployment Guide

## Overview

This document describes the fixes applied to resolve critical backend issues and provides comprehensive instructions for running, building, and deploying the DEFM backend.

## Issues Fixed

### 1. **Login NameError** ✅
- **Problem**: `logger` used but not imported in `router.py`
- **Fix**: Added `import logging` and proper logger initialization

### 2. **Startup Crash** ✅
- **Problem**: `create_initial_data()` called at module import time
- **Fix**: Moved to `@app.on_event("startup")` handler in `main.py`

### 3. **Detached ORM Instance Error** ✅
- **Problem**: `get_user_by_username()` returned ORM object from closed session
- **Fix**: Added `authenticate_user()` that returns dict instead of ORM object

### 4. **StaticFiles Mount Crash** ✅
- **Problem**: App crashes if `frontend` directory doesn't exist
- **Fix**: Added directory existence check with fallback creation

### 5. **Password Hashing Incompatibility** ✅
- **Problem**: `security.py` used SHA256 instead of bcrypt
- **Fix**: Replaced with proper bcrypt implementation using passlib

### 6. **Configuration Issues** ✅
- **Problem**: `config.py` not using `BaseSettings` properly
- **Fix**: Proper Pydantic BaseSettings implementation with `.env` support

### 7. **Environment File Typo** ✅
- **Problem**: `.evn` instead of `.env`
- **Fix**: Renamed to `.env`

## Quick Start

### Local Development

1. **Setup Virtual Environment**
   ```bash
   cd DEFM_Backend
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment**
   - Copy `.env.example` to `.env` (or use existing `.env`)
   - Update `SECRET_KEY` for production

4. **Run the Application**
   ```bash
   # Option 1: Using uvicorn directly
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   
   # Option 2: Using run_app.py
   python run_app.py
   
   # Option 3: Using main.py
   python main.py
   ```

5. **Access the Application**
   - API: http://127.0.0.1:8000
   - Docs: http://127.0.0.1:8000/docs
   - ReDoc: http://127.0.0.1:8000/redoc

## Building Windows Executable

### Prerequisites
- Python 3.11+
- Virtual environment with dependencies installed
- PyInstaller: `pip install pyinstaller`

### Build Steps

1. **Activate Virtual Environment**
   ```bash
   cd DEFM_Backend
   venv\Scripts\activate
   ```

2. **Run Build Script**
   ```bash
   build-exe.bat
   ```

3. **Output**
   - Executable: `dist\DEFM.exe`
   - Copy `.env` file to same directory as `DEFM.exe`
   - Run `DEFM.exe` to start the server

### Manual PyInstaller Command
```bash
pyinstaller --onefile --name DEFM --add-data ".env;." --add-data "uploads;uploads" run_app.py
```

## Docker Deployment

### SQLite (Default - Recommended for Local/Offline)

1. **Build and Run**
   ```bash
   cd DEFM_Backend
   docker-compose up --build
   ```

2. **Access**
   - API: http://localhost:8000
   - Docs: http://localhost:8000/docs

3. **Stop**
   ```bash
   docker-compose down
   ```

### PostgreSQL (Production)

1. **Uncomment PostgreSQL service** in `docker-compose.yml`

2. **Update backend environment** in `docker-compose.yml`:
   ```yaml
   DATABASE_URL: postgresql://defm:defmsecret@db:5432/defm
   ```

3. **Build and Run**
   ```bash
   docker-compose up --build
   ```

## Testing

### Test Login Endpoint

**Using curl (form-encoded):**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Test Default Users

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | admin |
| investigator1 | inv111 | investigator |
| investigator2 | inv122 | investigator |
| investigator3 | inv133 | investigator |
| manager | mgr123 | manager |

### Decode JWT Token

**Using Python:**
```python
from jose import jwt

token = "YOUR_TOKEN_HERE"
secret = "YOUR_SECRET_KEY_HERE"  # From .env

decoded = jwt.decode(token, secret, algorithms=["HS256"])
print(decoded)
```

**Expected Output:**
```python
{
  'sub': 'admin',
  'role': 'admin',
  'exp': 1234567890
}
```

### Test Health Endpoint

```bash
curl http://127.0.0.1:8000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-25T14:00:00.000Z",
  "version": "1.0.0"
}
```

## Acceptance Checklist

- [x] ✅ `uvicorn main:app` starts without exceptions
- [x] ✅ Startup logs show successful table creation and initial data
- [x] ✅ POST `/api/v1/login` with `admin/admin123` returns JWT token
- [x] ✅ JWT token is decodable with SECRET_KEY from `.env`
- [x] ✅ Static files mount doesn't crash when frontend missing
- [x] ✅ Password hashing uses bcrypt (compatible with existing hashes)
- [x] ✅ No NameError for `logger` in router.py
- [x] ✅ No detached ORM instance errors
- [x] ✅ PyInstaller build script provided
- [x] ✅ Docker and docker-compose configurations provided

## Environment Variables

### Required
- `SECRET_KEY` - JWT secret key (MUST change in production!)
- `DATABASE_URL` - Database connection string

### Optional
- `ALGORITHM` - JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiry (default: 60)
- `UPLOAD_DIRECTORY` - File upload location (default: ./uploads)
- `MAX_FILE_SIZE` - Max upload size in bytes (default: 100MB)
- `ALLOWED_ORIGINS` - CORS origins (comma-separated)
- `DEBUG` - Debug mode (default: True)
- `DEFM_HOST` - Server host for run_app.py (default: 127.0.0.1)
- `DEFM_PORT` - Server port for run_app.py (default: 8000)

## Troubleshooting

### Issue: "No module named 'passlib'"
**Solution:** Install dependencies: `pip install -r requirements.txt`

### Issue: "Failed to create initial data"
**Solution:** Check database permissions and ensure `defm.db` is writable

### Issue: "StaticFiles directory not found"
**Solution:** App now auto-creates `frontend` directory - no action needed

### Issue: Login returns 401
**Solution:** 
1. Check username/password are correct
2. Verify database has initial users (check logs)
3. Ensure bcrypt is installed: `pip install passlib[bcrypt]`

### Issue: JWT decode fails
**Solution:** Ensure SECRET_KEY in `.env` matches the one used to create token

## Production Deployment Checklist

- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Set `DEBUG=False`
- [ ] Use PostgreSQL instead of SQLite
- [ ] Configure proper CORS origins
- [ ] Set up HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set up backup strategy for database
- [ ] Configure log rotation
- [ ] Set up monitoring and alerts
- [ ] Review and update default user passwords

## Support

For issues or questions:
1. Check this README
2. Review application logs
3. Check `/docs` endpoint for API documentation
4. Review code comments in fixed files

## Files Modified/Added

### Modified
- `app/core/security.py` - Proper bcrypt implementation
- `app/services/initial_data.py` - Added authenticate_user, fixed ORM issues
- `app/api/router.py` - Added logger, removed import-time initialization
- `main.py` - Guarded StaticFiles, moved init to startup
- `app/core/config.py` - Proper BaseSettings implementation
- `Dockerfile` - Production-ready configuration

### Added
- `run_app.py` - PyInstaller entry point
- `build-exe.bat` - Windows build script
- `docker-compose.yml` - Docker deployment configuration
- `README.DEFM_BACKEND_FIXES.md` - This file

### Renamed
- `.evn` → `.env` - Fixed typo

---

**Last Updated:** 2026-01-25  
**Version:** 1.0.0  
**Status:** ✅ All fixes applied and tested
