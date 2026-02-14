# Deployment Checklist - ValueHills Platform

## ✅ Code Successfully Pushed to GitHub

**Repository**: https://github.com/phizteck-cpu/global
**Branch**: main
**Commit**: feat: Major platform updates - Activation fee, enforcement, weekly contributions

---

## Pre-Deployment Steps

### 1. Review Changes
- [ ] Review the commit on GitHub
- [ ] Check all files were pushed correctly
- [ ] Verify no sensitive data was committed (.env files excluded)

### 2. Prepare Production Environment

#### Environment Variables to Set
Create these in your hosting platform:

**Backend Environment Variables:**
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=file:./prisma/dev.db

# IMPORTANT: Change these secrets!
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters

# Your production domain
FRONTEND_URL=https://yourdomain.com

# API Configuration
API_ONLY=false
```

**Frontend Environment Variables:**
```env
VITE_API_URL=https://api.yourdomain.com/api
```

### 3. Database Setup Commands
```bash
cd backend
npx prisma generate
npx prisma db push
npm run seed
node create-superadmin.js
```

---

## Deployment Options

### Option A: VPS Deployment (Recommended for Full Control)

#### Quick Deploy Script
```bash
# 1. SSH into your server
ssh user@your-server-ip

# 2. Clone repository
cd /var/www
git clone https://github.com/phizteck-cpu/global.git valuehills
cd valuehills

# 3. Setup Backend
cd backend
npm install
npx prisma generate
npx prisma db push
npm run seed
node create-superadmin.js
mkdir -p uploads/activation-proofs uploads/payment-proofs

# 4. Setup Frontend
cd ../frontend
npm install
npm run build
cp -r dist ../backend/

# 5. Start with PM2
cd ../backend
pm2 start index.js --name valuehills-api
pm2 save
pm2 startup

# 6. Configure Nginx (see DEPLOYMENT_GUIDE.md)
```

### Option B: Render.com (Easiest)

1. **Create Web Service**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: valuehills-api
     - **Root Directory**: backend
     - **Build Command**: `npm install && npx prisma generate && npx prisma db push`
     - **Start Command**: `npm start`
     - **Add Environment Variables** (from list above)

2. **Create Static Site** (Frontend)
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Configure:
     - **Name**: valuehills-frontend
     - **Root Directory**: frontend
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`
     - **Add Environment Variables**

### Option C: Railway.app

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway init
railway up

# Add environment variables in Railway dashboard
```

---

## Post-Deployment Tasks

### 1. Initial Configuration (CRITICAL)

#### A. Create Superadmin Account
```bash
# SSH into server or use Railway/Render console
cd backend
node create-superadmin.js

# Follow prompts to create admin account
```

#### B. Configure Company Bank Account
1. Login as superadmin
2. Navigate to: Admin → Funding Management
3. Set company bank details:
   - **Bank Name**: Your bank name
   - **Account Number**: Your account number
   - **Account Name**: Your account name

**⚠️ IMPORTANT**: Users cannot complete registration without this!

### 2. Test Critical Flows

#### Test 1: Registration & Activation
- [ ] Visit /signup
- [ ] Fill registration form
- [ ] See company bank account details
- [ ] Upload payment proof (test image)
- [ ] See confirmation message
- [ ] Try to login (should be blocked)

#### Test 2: Admin Approval
- [ ] Login as admin
- [ ] Navigate to Admin → Payments
- [ ] See pending activation payment
- [ ] View uploaded proof
- [ ] Approve payment
- [ ] Verify user can now login

#### Test 3: Weekly Contribution
- [ ] Login as approved user
- [ ] Check dashboard for contribution status
- [ ] Try to contribute (check day restrictions)
- [ ] Verify Friday-Saturday window works
- [ ] Test late fee calculation

#### Test 4: Admin Functions
- [ ] Test user management (suspend, ban)
- [ ] Test wallet funding
- [ ] Test tier management
- [ ] Check enforcement stats

### 3. Verify Cron Jobs
```bash
# Check if cron jobs are running
pm2 logs valuehills-api | grep "Scheduled jobs"

# Should see:
# ✓ Scheduled jobs initialized:
#   - Daily contributions: 00:00 (midnight)
#   - Enforcement check: 01:00 (1 AM)
```

### 4. Setup Monitoring

#### PM2 Monitoring
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

#### Health Check
```bash
# Test health endpoint
curl https://yourdomain.com/api/health

# Should return:
# {"status":"up","timestamp":"..."}
```

---

## Security Checklist

### Before Going Live
- [ ] Changed JWT_SECRET from default
- [ ] Changed JWT_REFRESH_SECRET from default
- [ ] Enabled HTTPS/SSL certificate
- [ ] Configured firewall (if VPS)
- [ ] Set up database backups
- [ ] Configured CORS properly
- [ ] Reviewed all environment variables
- [ ] Tested file upload security
- [ ] Verified rate limiting works

### Firewall Setup (VPS Only)
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### SSL Certificate (VPS Only)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Backup Strategy

### Database Backup Script
```bash
#!/bin/bash
# Save as: /home/user/backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/user/backups"
DB_PATH="/var/www/valuehills/backend/prisma/dev.db"

# Create backup
cp $DB_PATH $BACKUP_DIR/db_$DATE.db

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.db" -mtime +7 -delete

echo "Backup completed: db_$DATE.db"
```

### Schedule Backups
```bash
chmod +x /home/user/backup-db.sh
crontab -e

# Add this line (runs daily at 2 AM):
0 2 * * * /home/user/backup-db.sh
```

---

## Troubleshooting

### Issue: Server won't start
```bash
# Check logs
pm2 logs valuehills-api

# Common fixes:
pm2 restart valuehills-api
pm2 delete valuehills-api
pm2 start index.js --name valuehills-api
```

### Issue: Database errors
```bash
cd backend
npx prisma generate
npx prisma db push
```

### Issue: File uploads fail
```bash
# Check directory exists
ls -la backend/uploads

# Create if missing
mkdir -p backend/uploads/activation-proofs
mkdir -p backend/uploads/payment-proofs

# Fix permissions
chmod -R 755 backend/uploads
```

### Issue: Frontend not loading
```bash
# Rebuild frontend
cd frontend
npm run build
cp -r dist ../backend/
pm2 restart valuehills-api
```

---

## Monitoring & Maintenance

### Daily Checks
- [ ] Check PM2 status: `pm2 status`
- [ ] Review logs: `pm2 logs valuehills-api --lines 50`
- [ ] Check disk space: `df -h`
- [ ] Monitor pending approvals

### Weekly Tasks
- [ ] Review audit logs
- [ ] Check enforcement stats
- [ ] Backup database
- [ ] Update dependencies (if needed)

### Monthly Tasks
- [ ] Security updates: `sudo apt update && sudo apt upgrade`
- [ ] Review user activity
- [ ] Analyze contribution patterns
- [ ] Check system performance

---

## Support & Documentation

### Documentation Files
- `DEPLOYMENT_GUIDE.md` - Comprehensive deployment instructions
- `ACTIVATION_FEE_SYSTEM.md` - Activation fee documentation
- `CONTRIBUTION_ENFORCEMENT_SYSTEM.md` - Enforcement system guide
- `WEEKLY_CONTRIBUTION_SYSTEM.md` - Weekly contribution details
- `ADMIN_FUNDING_SYSTEM.md` - Admin funding guide
- `PAYMENT_APPROVAL_SYSTEM.md` - Payment approval workflow

### Quick Reference

**Test Credentials** (after seeding):
- Superadmin: `superadmin` / `admin123`
- Member: `member123` / `password123`

**Important URLs**:
- Frontend: `https://yourdomain.com`
- API: `https://yourdomain.com/api`
- Health Check: `https://yourdomain.com/api/health`

**Key Features**:
- Activation Fee: ₦3,000
- Weekly Contribution: Friday-Saturday
- Late Fee: ₦1,000
- Suspension: 3-5 missed weeks
- Ban: 10+ missed weeks

---

## Final Checklist Before Launch

### Configuration
- [ ] Environment variables set
- [ ] Database initialized and seeded
- [ ] Superadmin account created
- [ ] Company bank account configured
- [ ] SSL certificate installed (if applicable)

### Testing
- [ ] Registration flow works
- [ ] Payment proof upload works
- [ ] Admin approval works
- [ ] Login restrictions work
- [ ] Weekly contributions work
- [ ] Enforcement system works

### Security
- [ ] JWT secrets changed
- [ ] HTTPS enabled
- [ ] Firewall configured
- [ ] Backups scheduled
- [ ] Rate limiting active

### Monitoring
- [ ] PM2 running
- [ ] Logs accessible
- [ ] Health check responding
- [ ] Cron jobs scheduled

---

## 🚀 Ready to Deploy!

Your code is now on GitHub and ready for deployment. Follow the steps above based on your chosen hosting platform.

**Need Help?**
- Review documentation files
- Check troubleshooting section
- Review server logs
- Test in staging environment first

**Good Luck with Your Deployment! 🎉**

---

**Last Updated**: February 12, 2026
**Version**: 2.0.0
**Status**: Ready for Production ✅
