# 🚀 DEFM Complete Deployment Guide

## 📋 Table of Contents
1. [Database Setup](#-database-setup)
2. [Web App Deployment](#-web-app-deployment)
3. [APK Build & Deployment](#-apk-build--deployment)
4. [Production Configuration](#-production-configuration)
5. [Troubleshooting](#-troubleshooting)

---

## 🗄️ Database Setup

### **Option 1: Automated Setup (Recommended)**

**Windows:**
```bash
cd DEFM_Backend
setup_database.bat
```

**Linux/Mac:**
```bash
cd DEFM_Backend
chmod +x setup_database.sh
./setup_database.sh
```

### **Option 2: Manual Setup**

1. **Environment Configuration:**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env file with your settings
   nano .env
   ```

2. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Database Migration:**
   ```bash
   # Initialize Alembic (first time only)
   alembic init alembic
   
   # Create migration
   alembic revision --autogenerate -m "Initial migration"
   
   # Apply migration
   alembic upgrade head
   ```

4. **Create Tables & Initial Data:**
   ```bash
   python -c "from app.core.database import create_tables; create_tables()"
   python -c "from app.services.initial_data import create_initial_data; create_initial_data()"
   ```

---

## 🌐 Web App Deployment

### **Option 1: Docker Deployment (Recommended)**

1. **Using Docker Compose:**
   ```bash
   # Start all services
   docker-compose up -d
   
   # View status
   docker-compose ps
   
   # View logs
   docker-compose logs -f
   ```

2. **Production Deployment:**
   ```bash
   # Run production deployment script
   ./deploy-web.sh  # Linux/Mac
   deploy-web.bat    # Windows
   ```

### **Option 2: Manual Deployment**

1. **Backend Setup:**
   ```bash
   cd DEFM_Backend
   python main.py
   ```

2. **Frontend Setup:**
   ```bash
   cd DEFM_Frontend
   npm install
   npm run build
   npm run preview
   ```

### **Environment Variables**

**Development (.env):**
```env
DATABASE_URL=sqlite:///./defm.db
SECRET_KEY=dev-secret-key
DEBUG=true
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Production (.env.production):**
```env
DATABASE_URL=sqlite:///./defm.db
SECRET_KEY=your-super-secure-secret-key
DEBUG=false
ALLOWED_ORIGINS=https://yourdomain.com
```

---

## 📱 APK Build & Deployment

### **Prerequisites**
- Node.js 16+
- Android Studio
- Java JDK 11+

### **Build Process**

1. **Setup Mobile App:**
   ```bash
   cd DEFM_Frontend
   npm install
   ```

2. **Install Capacitor:**
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init DEFM com.defm.app
   ```

3. **Add Android Platform:**
   ```bash
   npx cap add android
   ```

4. **Build & Sync:**
   ```bash
   npm run build
   npx cap sync android
   ```

5. **Open Android Studio:**
   ```bash
   npx cap open android
   ```

6. **Build APK in Android Studio:**
   - Build → Build Bundle(s) / APK(s) → Build APK(s)

### **Automated Build Scripts**

**Windows:**
```bash
build-apk.bat
```

**Linux/Mac:**
```bash
chmod +x build-apk.sh
./build-apk.sh
```

---

## ⚙️ Production Configuration

### **Security Settings**

1. **Generate Secure Secret Key:**
   ```bash
   # Python
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   
   # OpenSSL
   openssl rand -hex 32
   ```

2. **Database Security:**
   ```env
   # Use PostgreSQL for production
   DATABASE_URL=postgresql://user:password@localhost/defm_db
   ```

3. **CORS Configuration:**
   ```env
   ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```

### **SSL/HTTPS Setup**

1. **Generate SSL Certificate:**
   ```bash
   # Let's Encrypt (recommended)
   certbot --nginx -d yourdomain.com
   
   # Self-signed (development)
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout ssl/private.key -out ssl/certificate.crt
   ```

2. **Nginx Configuration:**
   ```nginx
   server {
       listen 443 ssl;
       server_name yourdomain.com;
       
       ssl_certificate /path/to/certificate.crt;
       ssl_certificate_key /path/to/private.key;
       
       location /api/ {
           proxy_pass http://localhost:8000;
       }
       
       location / {
           proxy_pass http://localhost:3000;
       }
   }
   ```

### **Performance Optimization**

1. **Database Optimization:**
   ```bash
   # PostgreSQL tuning
   shared_buffers = 256MB
   effective_cache_size = 1GB
   maintenance_work_mem = 64MB
   ```

2. **Application Caching:**
   ```bash
   # Redis for caching
   docker-compose --profile redis up -d
   ```

---

## 🔧 Troubleshooting

### **Common Issues**

1. **Database Connection Error:**
   ```bash
   # Check .env file
   cat .env | grep DATABASE_URL
   
   # Test database connection
   python -c "from app.core.database import engine; print(engine.execute('SELECT 1').scalar())"
   ```

2. **Port Already in Use:**
   ```bash
   # Find process using port
   netstat -tulpn | grep :8000
   
   # Kill process
   kill -9 <PID>
   ```

3. **Permission Issues:**
   ```bash
   # Fix file permissions
   chmod -R 755 uploads/
   chown -R www-data:www-data uploads/
   ```

4. **Docker Issues:**
   ```bash
   # Clean up Docker
   docker-compose down -v
   docker system prune -f
   docker-compose up -d --build
   ```

### **Health Checks**

1. **Backend Health:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Frontend Health:**
   ```bash
   curl http://localhost:3000
   ```

3. **Database Health:**
   ```bash
   # SQLite
   sqlite3 defm.db ".tables"
   
   # PostgreSQL
   psql -h localhost -U defm_user -d defm_db -c "\dt"
   ```

---

## 📞 Support

### **Default Credentials**
- Username: `admin`
- Password: `admin123`

### **Access URLs**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### **Log Locations**
- Backend logs: `DEFM_Backend/logs/`
- Nginx logs: `/var/log/nginx/`
- Docker logs: `docker-compose logs`

---

## 🎉 Deployment Complete!

Your DEFM application is now ready for production use. Make sure to:
1. Change default passwords
2. Configure SSL certificates
3. Set up monitoring
4. Configure backups
5. Test all functionality

For additional support, refer to the documentation or create an issue in the repository.
