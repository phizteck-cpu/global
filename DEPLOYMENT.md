# ValueHills Deployment Guide

## Prerequisites
- Node.js v20+
- MySQL Database (Hostinger, AWS RDS, or DigitalOcean)
- PM2 (for process management)
- Git access to repository

## Quick Deploy to Hostinger

### Step 1: Deploy Backend API

SSH into your server and run:

```bash
# Navigate to API directory
cd /home/admin/web/domains/1api.valuehills.shop/public_html

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Deploy database migrations
npx prisma migrate deploy

# Start with PM2
pm2 delete all
pm2 start index.js --name valuehills-api
pm2 save
pm2 startup

# Verify it's running
pm2 status
curl https://1api.valuehills.shop/api/health
```

### Step 2: Configure Backend Environment

Create `backend/.env.production` with:

```env
PORT=5000
NODE_ENV=production
API_ONLY=true
JWT_SECRET=<use-github-secrets>
DATABASE_URL=mysql://user:pass@127.0.0.1:3306/database
PAYSTACK_SECRET=<your-secret-key>
PAYSTACK_PUBLIC=<your-public-key>
FRONTEND_URL=https://valuehills.shop
```

**Important:** Never commit `.env.production` to git. Use GitHub Secrets for CI/CD.

### Step 3: Deploy Frontend

```bash
# Build frontend locally
cd frontend
npm install
npm run build

# Upload dist/ contents to:
# /home/admin/web/domains/valuehills.shop/public_html/
```

### Step 4: Configure Nginx

**For API (1api.valuehills.shop):**
```nginx
server {
    listen 80;
    server_name 1api.valuehills.shop;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**For Frontend (valuehills.shop):**
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

## Docker Deployment (Alternative)

```bash
# Build the image
docker build -t valuehills-platform .

# Run the container
docker run -p 5000:5000 --env-file backend/.env.production valuehills-platform
```

## Troubleshooting

### API Returns 503 Error
- Check PM2 status: `pm2 logs valuehills-api`
- Verify database connection in `.env.production`
- Check if port 5000 is accessible: `netstat -tulpn | grep 5000`

### Frontend Not Loading
- Ensure `index.html` exists in public_html
- Check Nginx configuration
- Verify API URL in frontend `.env.production`

### Database Connection Failed
- Use `127.0.0.1` instead of domain name for local MySQL
- Verify credentials in phpMyAdmin
- Check if database exists: `u948761456_hills`

### PM2 Process Not Starting
```bash
pm2 kill
npm install -g pm2
pm2 start index.js --name valuehills-api
pm2 save
```

## Production URLs
- Frontend: https://valuehills.shop
- API: https://1api.valuehills.shop
- Health Check: https://1api.valuehills.shop/api/health
