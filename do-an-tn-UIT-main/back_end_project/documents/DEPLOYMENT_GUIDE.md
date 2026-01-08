# 🚀 Deployment Guide

This guide explains how to deploy the Grocery Store Management Backend API to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [MongoDB Atlas Setup](#mongodb-atlas-setup)
- [Environment Configuration](#environment-configuration)
- [Deployment Options](#deployment-options)
- [Production Checklist](#production-checklist)

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account
- Production server (VPS, Cloud platform, etc.)
- Domain name (optional but recommended)

## MongoDB Atlas Setup

### 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster

### 2. Configure Database

1. **Create Database User**
   - Database Access → Add New Database User
   - Authentication Method: Password
   - Username: `taphoa_admin`
   - Password: Generate a strong password
   - Database User Privileges: Read and write to any database

2. **Configure Network Access**
   - Network Access → Add IP Address
   - For development: Add your current IP
   - For production: Add your server IP or `0.0.0.0/0` (allow from anywhere)
   - Note: Using `0.0.0.0/0` is less secure but easier for testing

3. **Get Connection String**
   - Clusters → Connect → Connect your application
   - Driver: Node.js
   - Version: 4.1 or later
   - Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/taphoa?retryWrites=true&w=majority
   ```

4. **Create Database**
   - Collections → Create Database
   - Database name: `taphoa`
   - Collection name: `users` (initial collection)

## Environment Configuration

### Production .env File

Create a `.env` file for production with secure values:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/taphoa?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=YOUR_SUPER_STRONG_RANDOM_SECRET_HERE_MINIMUM_32_CHARS
JWT_EXPIRATION=7d

# Application
PORT=4000
NODE_ENV=production

# CORS - Set your frontend URL
FRONTEND_URL=https://yourdomain.com

# PDF Storage
PDF_STORAGE_PATH=./uploads/pdfs

# Logging
LOG_LEVEL=info
```

### Security Best Practices

1. **Generate Strong JWT Secret**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Never commit .env to git**
   - Ensure `.env` is in `.gitignore`

3. **Use environment-specific configs**
   - Development: `.env.development`
   - Production: `.env.production`

## Deployment Options

### Option 1: Deploy to Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create taphoa-backend
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set MONGO_URI="your_mongo_uri"
   heroku config:set JWT_SECRET="your_jwt_secret"
   heroku config:set NODE_ENV=production
   heroku config:set FRONTEND_URL="https://your-frontend.com"
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Open Application**
   ```bash
   heroku open
   ```

### Option 2: Deploy to VPS (Ubuntu)

1. **Connect to VPS**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PM2 (Process Manager)**
   ```bash
   sudo npm install -g pm2
   ```

4. **Clone Repository**
   ```bash
   git clone <your-repo-url>
   cd back_end_project
   ```

5. **Install Dependencies**
   ```bash
   npm install
   ```

6. **Create .env File**
   ```bash
   nano .env
   # Paste your production environment variables
   ```

7. **Build Application**
   ```bash
   npm run build
   ```

8. **Start with PM2**
   ```bash
   pm2 start dist/main.js --name taphoa-backend
   pm2 save
   pm2 startup
   ```

9. **Configure Nginx (Optional)**
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:4000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

10. **Setup SSL with Let's Encrypt**
    ```bash
    sudo apt-get install certbot python3-certbot-nginx
    sudo certbot --nginx -d api.yourdomain.com
    ```

### Option 3: Deploy to AWS EC2

1. **Launch EC2 Instance**
   - AMI: Ubuntu Server 22.04
   - Instance Type: t2.micro (free tier)
   - Security Group: Allow HTTP (80), HTTPS (443), Custom (4000)

2. **Connect to Instance**
   ```bash
   ssh -i your-key.pem ubuntu@ec2-xxx-xxx-xxx-xxx.compute.amazonaws.com
   ```

3. **Follow VPS deployment steps** (same as Option 2)

### Option 4: Deploy to Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci --only=production

   COPY . .
   RUN npm run build

   EXPOSE 4000

   CMD ["node", "dist/main.js"]
   ```

2. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     api:
       build: .
       ports:
         - "4000:4000"
       env_file:
         - .env
       restart: unless-stopped
   ```

3. **Build and Run**
   ```bash
   docker-compose up -d
   ```

### Option 5: Deploy to Railway

1. **Go to [Railway.app](https://railway.app)**
2. Connect your GitHub repository
3. Add environment variables in Railway dashboard
4. Deploy automatically on git push

### Option 6: Deploy to Render

1. **Go to [Render.com](https://render.com)**
2. New → Web Service
3. Connect repository
4. Build Command: `npm install && npm run build`
5. Start Command: `npm run start:prod`
6. Add environment variables
7. Deploy

## Production Checklist

### Before Deployment

- [ ] Update all dependencies to stable versions
- [ ] Run tests: `npm run test`
- [ ] Run linter: `npm run lint`
- [ ] Build successfully: `npm run build`
- [ ] Review and update environment variables
- [ ] Generate strong JWT secret
- [ ] Configure MongoDB Atlas IP whitelist
- [ ] Set proper CORS origins
- [ ] Remove console.logs in production code
- [ ] Enable production logging level

### Security Checklist

- [ ] Use strong passwords for database
- [ ] Enable SSL/HTTPS
- [ ] Set secure JWT secret (minimum 32 characters)
- [ ] Configure rate limiting
- [ ] Enable helmet for security headers
- [ ] Validate all user inputs
- [ ] Sanitize database queries
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Configure proper CORS settings

### Performance Checklist

- [ ] Enable MongoDB indexes
- [ ] Configure caching if needed
- [ ] Optimize database queries
- [ ] Enable compression
- [ ] Set up CDN for static files
- [ ] Monitor application performance
- [ ] Set up logging and monitoring

### Monitoring and Maintenance

- [ ] Set up error tracking (Sentry, Rollbar)
- [ ] Configure application monitoring (New Relic, DataDog)
- [ ] Set up backup strategy for MongoDB
- [ ] Configure alerts for downtime
- [ ] Document deployment process
- [ ] Create rollback plan

## Post-Deployment

### 1. Verify Deployment

```bash
# Check health endpoint
curl https://api.yourdomain.com/api/health

# Test authentication
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 2. Create Initial Admin User

```bash
# Using MongoDB Compass or mongo shell
# Connect to your Atlas cluster and run:
db.users.insertOne({
  email: "admin@yourdomain.com",
  password: "$2b$10$...", // Hash the password using bcrypt
  fullName: "System Admin",
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### 3. Monitor Logs

```bash
# PM2 logs
pm2 logs taphoa-backend

# Heroku logs
heroku logs --tail

# Docker logs
docker-compose logs -f
```

### 4. Database Backups

Set up automated backups in MongoDB Atlas:
- Clusters → Backup
- Enable continuous backups
- Configure snapshot schedule

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MONGO_URI format
   - Verify IP whitelist in MongoDB Atlas
   - Ensure credentials are correct

2. **Application Won't Start**
   - Check Node.js version (18+)
   - Verify all dependencies installed
   - Check PORT is not in use
   - Review error logs

3. **CORS Errors**
   - Update FRONTEND_URL in .env
   - Check CORS configuration in main.ts

4. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration settings

## Rollback Strategy

If deployment fails:

1. **Heroku**
   ```bash
   heroku releases
   heroku rollback v123
   ```

2. **PM2**
   ```bash
   git checkout previous-stable-commit
   npm run build
   pm2 restart taphoa-backend
   ```

3. **Docker**
   ```bash
   docker-compose down
   git checkout previous-stable-commit
   docker-compose up -d --build
   ```

## Support

For deployment issues:
- Check application logs
- Review MongoDB Atlas metrics
- Contact support team
- Create GitHub issue

---

**Good luck with your deployment! 🚀**

