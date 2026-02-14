# Complete Hostinger Deployment Guide

## Issue: CSP Blocking JavaScript

The error "Content Security Policy blocks the use of 'eval'" is caused by restrictive security headers. This has been fixed in the latest code.

## Quick Fix Steps

### Step 1: Pull Latest Code

The latest code includes:
- ✅ Proper CSP headers in app.js
- ✅ .htaccess file for Hostinger
- ✅ Security headers configuration

### Step 2: Deploy to Hostinger

#### Option A: Via Git (Recommended)

1. **SSH into your Hostinger server**:
   ```bash
   ssh username@server-ip -p port
   ```

2. **Navigate to your application**:
   ```bash
   cd domains/api2.valuehills.shop/public_html
   ```

3. **Pull latest code**:
   ```bash
   git pull origin main
   ```

4. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

5. **Initialize database**:
   ```bash
   npx prisma generate
   npx prisma db push --accept-data-loss
   npm run seed
   ```

6. **Restart application**:
   ```bash
   pm2 restart all
   # or
   pm2 restart valuehills-api
   ```

#### Option B: Manual Upload

1. **Download your repository** from GitHub
2. **Extract the files**
3. **Upload via Hostinger File Manager**:
   - Login to hPanel
   - Go to Files → File Manager
   - Navigate to `domains/api2.valuehills.shop/public_html`
   - Upload all files
4. **Follow steps 4-6 from Option A**

### Step 3: Configure Hostinger Node.js

1. **Login to Hostinger hPanel**
2. **Go to**: Advanced → Node.js
3. **Configure Application**:
   - **Application Mode**: Production
   - **Application Root**: `/domains/api2.valuehills.shop/public_html/backend`
   - **Application Startup File**: `index.js`
   - **Node.js Version**: 18.x or 20.x

4. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=file:./prisma/dev.db
   JWT_SECRET=your-super-secret-key-change-this-minimum-32-characters
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-minimum-32-characters
   ```

5. **Click "Create" or "Update"**

### Step 4: Set Up Reverse Proxy

Create or update `.htaccess` in your domain root:

```apache
# In: domains/api2.valuehills.shop/public_html/.htaccess

RewriteEngine On

# Proxy all requests to Node.js app
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:5000/$1 [P,L]

# Remove restrictive CSP
Header unset Content-Security-Policy

# Set permissive CSP
Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;"
```

### Step 5: Test

Visit: https://api2.valuehills.shop/api/health

Should return:
```json
{"status":"up","timestamp":"..."}
```

## Troubleshooting CSP Issues

### Issue: Still Getting CSP Error

**Solution 1**: Check Hostinger Security Settings
1. Go to hPanel → Security
2. Look for "Security Headers" or "CSP Settings"
3. Disable or modify CSP settings

**Solution 2**: Override CSP in .htaccess
```apache
# Add to .htaccess
Header always unset Content-Security-Policy
Header always unset X-Content-Security-Policy
```

**Solution 3**: Contact Hostinger Support
Ask them to disable CSP for your domain or allow 'unsafe-eval'

### Issue: 503 Service Unavailable

**Solution**: Initialize database
```bash
cd backend
npx prisma db push --accept-data-loss
npm run seed
pm2 restart all
```

### Issue: Application Not Starting

**Solution**: Check logs
```bash
pm2 logs valuehills-api
# or
tail -f ~/logs/nodejs.log
```

## Complete Setup from Scratch

### 1. Prepare Hostinger

1. **Enable SSH Access**:
   - hPanel → Advanced → SSH Access
   - Enable SSH
   - Note credentials

2. **Enable Node.js**:
   - hPanel → Advanced → Node.js
   - Enable Node.js
   - Select version 18.x or higher

3. **Create Database** (Optional - MySQL):
   - hPanel → Databases → MySQL
   - Create new database
   - Note credentials

### 2. Upload Application

```bash
# SSH into server
ssh username@server-ip -p port

# Navigate to domain directory
cd domains/api2.valuehills.shop/public_html

# Clone repository
git clone https://github.com/phizteck-cpu/global.git .

# Or upload files via File Manager
```

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Generate Prisma Client
npx prisma generate
```

### 4. Configure Environment

```bash
# Create .env.production
nano .env.production
```

Add:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=your-super-secret-key-minimum-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters
FRONTEND_URL=https://valuehills.shop
```

### 5. Initialize Database

```bash
# Push schema
npx prisma db push --accept-data-loss

# Seed data
npm run seed

# Create superadmin
node create-superadmin.js
```

### 6. Start Application

```bash
# Install PM2
npm install -g pm2

# Start app
pm2 start index.js --name valuehills-api

# Save PM2 config
pm2 save

# Set PM2 to start on boot
pm2 startup
```

### 7. Configure Domain

1. **Point domain to Hostinger**:
   - Update DNS A record
   - Point to Hostinger IP

2. **Set up SSL**:
   - hPanel → SSL
   - Enable SSL for api2.valuehills.shop

3. **Configure .htaccess** (as shown above)

## Monitoring and Maintenance

### Check Application Status

```bash
# PM2 status
pm2 status

# View logs
pm2 logs valuehills-api

# Monitor resources
pm2 monit
```

### Restart Application

```bash
# Restart specific app
pm2 restart valuehills-api

# Restart all apps
pm2 restart all

# Reload without downtime
pm2 reload valuehills-api
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Install new dependencies
npm install

# Update database schema
npx prisma generate
npx prisma db push

# Restart
pm2 restart valuehills-api
```

### Backup Database

```bash
# Create backup
cp backend/prisma/dev.db ~/backups/db_$(date +%Y%m%d).db

# Automated backup script
nano ~/backup.sh
```

Add:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp ~/domains/api2.valuehills.shop/public_html/backend/prisma/dev.db ~/backups/db_$DATE.db
find ~/backups -name "db_*.db" -mtime +7 -delete
```

Make executable and schedule:
```bash
chmod +x ~/backup.sh
crontab -e
# Add: 0 2 * * * ~/backup.sh
```

## Performance Optimization

### 1. Enable Caching

Add to .htaccess:
```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType application/json "access plus 1 hour"
</IfModule>
```

### 2. Enable Compression

```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE application/json
    AddOutputFilterByType DEFLATE text/html
</IfModule>
```

### 3. Optimize PM2

```bash
# Use cluster mode
pm2 start index.js -i max --name valuehills-api

# Set memory limit
pm2 start index.js --max-memory-restart 500M
```

## Security Checklist

- [ ] SSL certificate installed
- [ ] Environment variables set
- [ ] JWT secrets changed from defaults
- [ ] Database file permissions set (644)
- [ ] .env files not publicly accessible
- [ ] Firewall configured
- [ ] Regular backups scheduled
- [ ] PM2 logs rotated

## Common Hostinger Issues

### Issue: Node.js Not Available

**Solution**: Enable in hPanel → Advanced → Node.js

### Issue: Port Already in Use

**Solution**:
```bash
# Find process
lsof -i :5000
# Kill it
kill -9 <PID>
```

### Issue: Permission Denied

**Solution**:
```bash
chmod -R 755 backend
chown -R $USER:$USER backend
```

### Issue: Out of Memory

**Solution**: Upgrade hosting plan or optimize:
```bash
pm2 start index.js --max-memory-restart 300M
```

## Support

### Hostinger Support
- Live Chat: Available in hPanel
- Email: support@hostinger.com
- Knowledge Base: https://support.hostinger.com

### Application Issues
- Check server logs: `pm2 logs`
- Check error logs: `tail -f ~/logs/error.log`
- Test locally: `curl http://localhost:5000/api/health`

---

**Last Updated**: February 12, 2026
**Platform**: Hostinger Cloud Hosting
**Status**: Production Ready ✅
