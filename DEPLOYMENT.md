<<<<<<< HEAD
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
=======
# Deployment Guide - ValueHills Platform

This guide outlines the steps to deploy the ValueHills platform to a production environment.

## 1. Prerequisites
- Node.js v20+
- MySQL Database (e.g., Hostinger, AWS RDS, DigitalOcean Managed DB)
- Docker (optional, but recommended)

## 2. Environment Variables
Ensure you have a `.env.production` file in the `backend/` directory with the following variables:
- `DATABASE_URL`: Your production MySQL connection string.
- `JWT_SECRET`: A long, random string.
- `PORT`: Usually `5000`.
- `NODE_ENV`: Set to `production`.
- `PAYSTACK_SECRET`: Your Paystack secret key.
- `PAYSTACK_PUBLIC`: Your Paystack public key.
- `FRONTEND_URL`: The URL where your app will be hosted.

## 3. Deployment Options

### Option A: Docker (Recommended)
You can use the provided `Dockerfile` in the root directory to build and run the entire application.

```bash
# Build the image
docker build -t valuehills-platform .

# Run the container
docker run -p 5000:5000 --env-file backend/.env.production valuehills-platform
```

### Option B: Manual Deployment
1. **Build Frontend**:
   ```bash
   npm install
   npm run build
   ```
2. **Setup Backend**:
   - Ensure `frontend/dist` exists.
   - Move/Copy `frontend/dist` to `backend/dist`.
   ```bash
   cd backend
   npm install --omit=dev
   npx prisma generate
   ```
3. **Run Migrations**:
   ```bash
   npx prisma migrate deploy
   ```
4. **Start Server**:
   ```bash
   NODE_ENV=production node index.js
   ```

## 4. Production Considerations
- **SSL**: Ensure your frontend and backend are served over HTTPS.
- **Database Backups**: Schedule regular backups of your MySQL database.
- **Monitoring**: Use tools like PM2 or a cloud-native monitoring service to keep the process running.
- **Rate Limiting**: The app includes basic rate limiting, ensure it's configured appropriately for your traffic.

## 5. Troubleshooting
If the frontend doesn't load:
- Check that `backend/dist/index.html` exists.
- Check the console logs for "Found frontend build at...".
- Ensure `NODE_ENV` is set to `production` in your environment.
>>>>>>> 13d4422 (Initial commit for production deployment)
