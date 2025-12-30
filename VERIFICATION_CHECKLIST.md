# 🔍 DEFM Project Verification Checklist

Use this document to verify your DEFM installation is complete and correct.

## ✅ File Structure Verification

### Backend Files (DEFM_Backend/)
```
□ main.py
□ requirements.txt
□ .env.example
□ alembic.ini
□ alembic/
  □ env.py
  □ versions/001_initial.py
□ app/
  □ __init__.py
  □ api/
    □ __init__.py
    □ router.py
    □ dependencies/
      □ __init__.py
      □ auth.py
    □ endpoints/
      □ __init__.py
      □ auth.py
      □ users.py
      □ cases.py
      □ evidence.py
      □ chain_of_custody.py
      □ reports.py
  □ core/
    □ config.py
    □ database.py
    □ security.py
  □ models/
    □ __init__.py
    □ models.py
  □ schemas/
    □ __init__.py
    □ schemas.py
  □ services/
    □ __init__.py
    □ initial_data.py
    □ report_service.py
    □ audit_service.py
  □ utils/
    □ __init__.py
    □ case_utils.py
    □ file_utils.py
    □ common_utils.py
```

### Frontend Files (DEFM_Frontend/)
```
□ package.json (with axios dependency)
□ vite.config.js
□ tailwind.config.js
□ postcss.config.js
□ index.html
□ src/
  □ main.jsx
  □ App.jsx
  □ components/
    □ Navbar.jsx
    □ Sidebar.jsx
    □ ProtectedRoute.jsx
  □ context/
    □ AuthContext.jsx
  □ hooks/
    □ useMobile.jsx
  □ pages/
    □ Dashboard.jsx
    □ Login.jsx
    □ Cases.jsx
    □ CaseDetails.jsx
    □ Evidence.jsx
    □ EvidenceDetails.jsx
    □ ChainOfCustody.jsx
    □ Reports.jsx
    □ UserManagement.jsx
    □ Settings.jsx
    □ NotFound.jsx
  □ services/
    □ api.js
```

### Root Files
```
□ README_COMPLETE.md
□ COMPLETION_REPORT.md
□ docker-compose.yml
□ start.sh (Linux/Mac)
□ start.bat (Windows)
```

---

## ✅ Backend Verification

### 1. Dependencies Check
Run in DEFM_Backend/:
```bash
pip list | grep -E "fastapi|uvicorn|sqlalchemy|alembic|pydantic"
```

Expected versions (minimum):
- fastapi >= 0.104.1
- uvicorn >= 0.24.0
- sqlalchemy >= 2.0.23
- alembic >= 1.12.1
- pydantic >= 2.5.0

### 2. Python Version
```bash
python --version
# Should be Python 3.11 or higher
```

### 3. Database Check
```bash
# Should create defm.db file
ls -la defm.db
```

### 4. Environment Configuration
```bash
cat .env
# Should contain:
# - DATABASE_URL
# - SECRET_KEY (not default in production!)
# - ALLOWED_ORIGINS
```

### 5. API Endpoints Test
Start backend, then:
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy","timestamp":"...","version":"1.0.0"}

curl http://localhost:8000/docs
# Should return HTML (OpenAPI docs)
```

---

## ✅ Frontend Verification

### 1. Dependencies Check
Run in DEFM_Frontend/:
```bash
npm list | grep -E "react|vite|axios|tailwindcss"
```

Expected:
- react@18.2.0
- vite@4.1.0
- axios@1.6.0
- tailwindcss@3.2.7

### 2. Build Test
```bash
npm run build
# Should create dist/ folder with no errors
```

### 3. Development Server Test
```bash
npm run dev
# Should start on http://localhost:5173
```

---

## ✅ Integration Verification

### Test Sequence

1. **Start Backend**
   ```bash
   cd DEFM_Backend
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   python main.py
   ```
   ✅ Verify: `Application started successfully` message

2. **Start Frontend**
   ```bash
   cd DEFM_Frontend
   npm run dev
   ```
   ✅ Verify: `Local: http://localhost:5173` message

3. **Test Login**
   - Open http://localhost:5173
   - Login with: `admin` / `admin123`
   - ✅ Should redirect to Dashboard

4. **Test Pages** (while logged in as admin)
   - □ Navigate to Dashboard → Should show statistics
   - □ Navigate to Cases → Should show empty list or sample cases
   - □ Navigate to Evidence → Should load
   - □ Navigate to Chain of Custody → Should load
   - □ Navigate to Reports → Should load
   - □ Navigate to Users → Should show user list (admin only)
   - □ Navigate to Settings → Should show profile settings

5. **Test API Integration**
   - □ Create a new case from Cases page
   - □ View case details
   - □ Create evidence item
   - □ Upload a test file
   - □ Generate a report
   - □ Download report

6. **Test Authentication**
   - □ Logout → Should redirect to login
   - □ Try accessing /dashboard without login → Should redirect to login
   - □ Login again → Should work

---

## ✅ Security Verification

### Critical Security Checks

1. **Environment Variables**
   ```bash
   # In .env file:
   □ SECRET_KEY is NOT the default value
   □ DEBUG is set to False for production
   □ ALLOWED_ORIGINS contains your production domain
   ```

2. **Default Passwords**
   ```bash
   ⚠️  MUST CHANGE in production:
   □ admin password changed from admin123
   □ manager password changed from manager123
   □ investigator password changed from investigator123
   ```

3. **File Permissions**
   ```bash
   # Uploads directory
   □ ./uploads exists and is writable
   □ .env file is NOT in version control
   ```

4. **CORS Configuration**
   ```python
   # In .env:
   □ ALLOWED_ORIGINS includes frontend URL
   # Example: http://localhost:5173,https://your-domain.com
   ```

---

## ✅ Database Verification

### Check Tables Created

```bash
# If using SQLite:
sqlite3 defm.db ".tables"

# Should show:
# alembic_version  chain_of_custody  reports
# audit_logs       evidence          users
# cases
```

### Check Initial Data

```bash
# Count users
sqlite3 defm.db "SELECT COUNT(*) FROM users;"
# Should return: 3 (admin, manager, investigator)
```

---

## ✅ Docker Verification (Optional)

If using Docker:

```bash
# Start services
docker-compose up -d

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check running containers
docker-compose ps
# Should show backend and frontend running

# Test
curl http://localhost:8000/health
curl http://localhost:3000  # or configured port
```

---

## ❌ Common Issues & Fixes

### Issue: "ModuleNotFoundError: No module named 'fastapi'"
**Fix:** Activate virtual environment and install dependencies
```bash
cd DEFM_Backend
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: "axios is not defined" in browser console
**Fix:** Install frontend dependencies
```bash
cd DEFM_Frontend
npm install
```

### Issue: CORS error when calling API
**Fix:** Check ALLOWED_ORIGINS in backend .env
```bash
# Should include: http://localhost:5173
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Issue: "401 Unauthorized" after login
**Fix:** Check browser localStorage has token
- Open DevTools → Application → Local Storage
- Should see `token` and `user` keys
- If missing, check backend login endpoint

### Issue: Database migration fails
**Fix:** Delete database and recreate
```bash
cd DEFM_Backend
rm defm.db
alembic upgrade head
```

### Issue: Frontend build fails
**Fix:** Clear node_modules and reinstall
```bash
cd DEFM_Frontend
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ Final Verification Checklist

Before deploying to production:

- [ ] All backend dependencies installed
- [ ] All frontend dependencies installed
- [ ] Database created and migrated
- [ ] Initial users created
- [ ] All pages load without errors
- [ ] Login/logout works
- [ ] API integration works
- [ ] File upload works
- [ ] SECRET_KEY changed in .env
- [ ] Default passwords changed
- [ ] CORS configured for production domain
- [ ] DEBUG set to False
- [ ] HTTPS configured (production only)
- [ ] Backup strategy in place
- [ ] Monitoring set up (optional)

---

## 📊 Completion Status

After completing all checks above, calculate your score:

**Backend:** _____ / 5 sections complete
**Frontend:** _____ / 3 sections complete
**Integration:** _____ / 6 tests passed
**Security:** _____ / 4 checks passed
**Database:** _____ / 2 checks passed

**Total Score:** _____ / 20

- **18-20:** ✅ Excellent! Production ready
- **15-17:** ⚠️  Good, but address remaining issues
- **12-14:** ⚠️  Functional, but needs work
- **< 12:**  ❌ Major issues, review COMPLETION_REPORT.md

---

## 📞 Need Help?

1. Check COMPLETION_REPORT.md for detailed status
2. Review README_COMPLETE.md for setup guide
3. Check API docs at http://localhost:8000/docs
4. Review error logs in terminal output

---

**Last Updated:** December 29, 2024
**Version:** 1.0.0 (95-100% Complete)
