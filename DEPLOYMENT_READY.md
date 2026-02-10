# Deployment Guide - Ready to Deploy

## Quick Deployment Steps

### 1. Deploy Backend API to 1api.valuehills.shop

SSH into your server and run:

```bash
cd /home/admin/web/domains/1api.valuehills.shop/public_html
git pull origin main
npm install
npx prisma generate
npx prisma migrate deploy
pm2 delete all
pm2 start index.js --name valuehills-api
pm2 save
pm2 startup
```

### 2. Configure Nginx for API (1api.valuehills.shop)

In Hostinger panel: Advanced > Nginx Configuration

```nginx
server {
    listen 80;
    server_name 1api.valuehills.shop;
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. Deploy Frontend to valuehills.shop

```bash
cd /home/admin/web/domains/valuehills.shop/public_html
git pull origin main
# Copy all contents from backend/dist/ to here
```

### 4. Configure Nginx for Frontend (valuehills.shop)

In Hostinger panel: Advanced > Nginx Configuration

```nginx
server {
    listen 80;
    server_name valuehills.shop www.valuehills.shop;
    root /home/admin/web/domains/valuehills.shop/public_html;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 5. Import Database Schema

In Hostinger phpMyAdmin:
1. Select database `u948761456_hills`
2. Click "Import"
3. Upload `backend/prisma/schema.sql`
4. Click "Go"

## Your URLs After Deployment:
- Frontend: https://valuehills.shop
- API: https://1api.valuehills.shop

## Troubleshooting

### API not responding?
- Check PM2: `pm2 logs valuehills-api`
- Check port: `netstat -tulpn | grep 5000`

### Database connection failed?
- Verify DATABASE_URL in backend/.env.production
- Ensure MySQL database exists and is accessible
