# ValueHills Deployment Guide

## Quick Deploy to Hostinger

### Step 1: Build Frontend Locally

```bash
cd frontend
npm install
npm run build
```

### Step 2: Upload to Server

**Upload the following structure to your Hostinger:**

```
public_html/
├── dist/                    # Frontend build (from frontend/dist/)
│   ├── index.html
│   └── assets/
└── api/                    # Backend
    ├── index.js
    ├── app.js
    ├── package.json
    ├── prisma/
    └── .env.production     # With production settings
```

**Via Git (Recommended):**
```bash
# On your server
cd /home/admin/web/domains/valuehills.shop/public_html/api
git clone https://github.com/phizteck-cpu/global.git .
npm install
npx prisma generate
```

### Step 3: Configure Environment

Create `api/.env.production`:

```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your-secure-jwt-secret-key
DATABASE_URL=mysql://user:pass@localhost:3306/your_database
PAYSTACK_SECRET=sk_live_xxx
PAYSTACK_PUBLIC=pk_live_xxx
FRONTEND_URL=https://valuehills.shop
```

### Step 4: Run Database Migrations

```bash
cd api
npx prisma migrate deploy
```

### Step 5: Start the Server

```bash
cd api
npm install -g pm2
pm2 start index.js
pm2 save
pm2 startup
```

### Step 6: Configure Reverse Proxy (Nginx)

In Hostinger's "Advanced > Nginx Configuration":

```nginx
server {
    listen 80;
    server_name valuehills.shop www.valuehills.shop;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Testing Locally

```bash
# Terminal 1 - Backend
cd server
npm start
# Server runs on http://localhost:5000
# - Frontend: http://localhost:5000/
# - API: http://localhost:5000/api/health
```

## Troubleshooting

### Frontend not showing
- Ensure `dist/index.html` exists and is readable
- Check server logs for path resolution messages

### Database connection failed
- Verify `DATABASE_URL` is correct
- Ensure MySQL is running and accessible

### Port 5000 not accessible
- Hostinger may block custom ports
- Use reverse proxy (Nginx) to forward port 80 to 5000
