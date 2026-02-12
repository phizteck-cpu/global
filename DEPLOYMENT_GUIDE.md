# ValueHills Platform - Deployment Guide

## Recent Updates (Latest Deployment)

### New Features Implemented
1. ✅ **Activation Fee System** - ₦3,000 mandatory activation fee with payment proof upload
2. ✅ **Contribution Enforcement** - Auto-suspend (3-5 weeks) and auto-ban (10+ weeks) for missed payments
3. ✅ **Weekly Contribution System** - Friday-Saturday payment window with ₦1,000 late fee
4. ✅ **Tier Maturity Period** - Configurable duration per tier (default 45 weeks)
5. ✅ **Admin Funding Management** - Manual wallet funding and company account configuration
6. ✅ **Payment Approval System** - Admin approval for wallet funding with proof upload
7. ✅ **User Account Management** - Suspend, ban, and delete user accounts
8. ✅ **Tier Delete Feature** - Delete tiers with validation

## Pre-Deployment Checklist

### 1. Environment Variables
Ensure these are set in your production environment:

**Backend (.env.production)**
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=file:./prisma/dev.db

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# API Configuration
API_ONLY=false
```

**Frontend (.env.production)**
```env
VITE_API_URL=https://api.yourdomain.com/api
```

### 2. Database Setup
```bash
# Navigate to backend
cd backend

# Push schema to database
npx prisma db push

# Seed initial data (tiers, admin user)
npm run seed
```

### 3. Create Superadmin Account
```bash
cd backend
node create-superadmin.js
```

### 4. Configure Company Bank Account
After deployment:
1. Login as superadmin
2. Navigate to Admin Funding page
3. Set company bank details (for activation payments)

### 5. Build Frontend
```bash
cd frontend
npm install
npm run build
```

### 6. Install Backend Dependencies
```bash
cd backend
npm install
```

## Deployment Steps

### Option 1: Deploy to VPS (Recommended)

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install -y nginx
```

#### 2. Clone Repository
```bash
cd /var/www
sudo git clone https://github.com/yourusername/valuehills.git
cd valuehills
```

#### 3. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push
npm run seed

# Create superadmin
node create-superadmin.js

# Create uploads directory
mkdir -p uploads/activation-proofs
mkdir -p uploads/payment-proofs

# Set permissions
sudo chown -R $USER:$USER /var/www/valuehills
```

#### 4. Setup Frontend
```bash
cd ../frontend

# Install dependencies
npm install

# Build for production
npm run build

# Copy build to backend dist folder
cp -r dist ../backend/
```

#### 5. Configure Environment
```bash
cd ../backend

# Create production env file
cp .env.production.example .env.production

# Edit with your values
nano .env.production
```

#### 6. Start Backend with PM2
```bash
cd backend

# Start application
pm2 start index.js --name valuehills-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### 7. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/valuehills
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (SPA)
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    client_max_body_size 10M;
}
```

Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/valuehills /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 8. Setup SSL (Optional but Recommended)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Option 2: Deploy to Render.com

#### 1. Backend Deployment
1. Create new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `cd backend && npm install && npx prisma generate`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Add all environment variables

#### 2. Frontend Deployment
1. Create new Static Site on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`

### Option 3: Deploy to Railway.app

#### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

#### 2. Login and Deploy
```bash
railway login
railway init
railway up
```

#### 3. Configure Environment Variables
Add all required environment variables in Railway dashboard

## Post-Deployment Tasks

### 1. Verify Deployment
- [ ] Visit your domain
- [ ] Test registration flow
- [ ] Test activation payment upload
- [ ] Login as superadmin
- [ ] Configure company bank account
- [ ] Test admin approval workflow
- [ ] Test contribution payment
- [ ] Verify enforcement cron jobs

### 2. Configure Company Settings
1. Login as superadmin
2. Go to Admin Funding page
3. Set company bank details:
   - Bank Name
   - Account Number
   - Account Name

### 3. Test Critical Flows
- [ ] User registration with activation fee
- [ ] Payment proof upload
- [ ] Admin approval
- [ ] User login after approval
- [ ] Weekly contribution payment
- [ ] Wallet funding
- [ ] Admin user management

### 4. Monitor Logs
```bash
# PM2 logs
pm2 logs valuehills-api

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 5. Setup Monitoring
```bash
# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## Updating Deployment

### Pull Latest Changes
```bash
cd /var/www/valuehills
git pull origin main
```

### Update Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
pm2 restart valuehills-api
```

### Update Frontend
```bash
cd frontend
npm install
npm run build
cp -r dist ../backend/
pm2 restart valuehills-api
```

## Backup Strategy

### Database Backup
```bash
# Create backup script
nano /home/user/backup-db.sh
```

Add:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp /var/www/valuehills/backend/prisma/dev.db /home/user/backups/db_$DATE.db
# Keep only last 7 days
find /home/user/backups -name "db_*.db" -mtime +7 -delete
```

Make executable and schedule:
```bash
chmod +x /home/user/backup-db.sh
crontab -e
# Add: 0 2 * * * /home/user/backup-db.sh
```

### Uploads Backup
```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /var/www/valuehills/backend/uploads
```

## Troubleshooting

### Issue: Server not starting
```bash
# Check logs
pm2 logs valuehills-api

# Check if port is in use
sudo lsof -i :5000

# Restart PM2
pm2 restart valuehills-api
```

### Issue: Database errors
```bash
# Reset database (CAUTION: Deletes all data)
cd backend
npx prisma db push --force-reset
npm run seed
```

### Issue: File upload fails
```bash
# Check permissions
ls -la backend/uploads
sudo chown -R $USER:$USER backend/uploads
chmod -R 755 backend/uploads
```

### Issue: Nginx 502 error
```bash
# Check if backend is running
pm2 status

# Check Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Security Recommendations

1. **Change Default Secrets**
   - Update JWT_SECRET
   - Update JWT_REFRESH_SECRET

2. **Enable Firewall**
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

3. **Regular Updates**
```bash
sudo apt update && sudo apt upgrade -y
```

4. **Monitor Logs**
   - Check for suspicious activity
   - Monitor failed login attempts
   - Review admin actions

5. **Backup Regularly**
   - Database backups daily
   - Uploads backups weekly
   - Keep offsite backups

## Performance Optimization

### 1. Enable Gzip in Nginx
Add to nginx config:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### 2. PM2 Cluster Mode
```bash
pm2 start index.js -i max --name valuehills-api
```

### 3. Database Optimization
```bash
# Analyze database
cd backend
npx prisma studio
```

## Support

For issues or questions:
- Check documentation files in repository
- Review error logs
- Contact development team

## Changelog

### Latest Version (Current)
- Activation fee system with payment proof
- Contribution enforcement (auto-suspend/ban)
- Weekly contribution window (Friday-Saturday)
- Tier maturity period configuration
- Admin funding management
- Payment approval system
- User account management
- Tier delete feature

---

**Last Updated**: February 12, 2026
**Version**: 2.0.0
**Status**: Production Ready ✅
