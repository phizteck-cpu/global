# ValueHills Deployment Guide

This guide covers deployment options for the ValueHills platform.

## Quick Deploy Options

### Option 1: Docker Compose (Recommended for VPS/Dedicated Server)

```bash
# Clone the repository
git clone https://github.com/phizteck-cpu/global.git
cd global

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

**Services:**
- MySQL (port 3306)
- App Server (port 5000) - serves both frontend and API
- phpMyAdmin (port 8080)

### Option 2: Build and Deploy Manually

```bash
# Clone the repository
git clone https://github.com/phizteck-cpu/global.git
cd global

# Build frontend
cd frontend
npm install
npm run build

# Copy frontend build to server
xcopy /E /Y dist ..\server\dist

# Deploy backend
cd ../server
npm install
npm run start
```

## Combined Frontend + Backend Deployment

The Express server is configured to serve:
- **Frontend SPA** at `/` (root)
- **Backend API** at `/api/*`

### To Deploy on VPS:

1. **Build and copy frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   xcopy /E /Y dist ..\server\dist
   ```

2. **Upload to server:**
   - Upload the `server/` folder to your VPS
   - Configure `.env.production` with database and JWT settings

3. **Start the server:**
   ```bash
   cd server
   npm install
   npm run start
   ```

## Environment Configuration

### Production Environment Variables

Create `.env.production` in the `server/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Secret (generate a secure random string)
JWT_SECRET=your-secure-jwt-secret-key

# Database Configuration (MySQL)
DATABASE_URL=mysql://username:password@host:3306/database

# Paystack Configuration (from https://dashboard.paystack.com)
PAYSTACK_SECRET=sk_live_your_secret_key
PAYSTACK_PUBLIC=pk_live_your_public_key

# Frontend URL (for CORS)
FRONTEND_URL=https://valuehills.shop
```

## Production Checklist

- [ ] Set strong `JWT_SECRET` environment variable
- [ ] Configure `DATABASE_URL` with production MySQL credentials
- [ ] Update Paystack keys from test to live mode
- [ ] Set `FRONTEND_URL` to your frontend domain
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Seed initial data if needed: `npm run seed`

## Deploying to Hostinger VPS

1. **Connect to VPS via SSH**
   ```bash
   ssh user@your-vps-ip
   ```

2. **Install Node.js and npm**
   ```bash
   sudo apt update
   sudo apt install nodejs npm
   ```

3. **Clone and Deploy**
   ```bash
   git clone https://github.com/phizteck-cpu/global.git
   cd global/server
   npm install
   npx prisma generate
   # Create .env.production with your settings
   npm run start
   ```

4. **Use PM2 for production**
   ```bash
   sudo npm install -g pm2
   pm2 start index.js
   pm2 save
   pm2 startup
   ```

5. **Configure Reverse Proxy (Nginx)**
   - Install Nginx
   - Configure SSL with Let's Encrypt
   - Proxy requests to localhost:5000

## Monitoring

- **Health Check:** `http://your-domain.com/api/health`
- **Logs:** Check PM2 or terminal output
- **Database:** Access via phpMyAdmin or direct MySQL connection

## Project Structure

```
global/
├── frontend/          # React frontend
│   ├── src/          # Source code
│   ├── dist/         # Production build
│   └── .env.production
├── server/           # Express backend + frontend build
│   ├── routes/       # API routes
│   ├── prisma/       # Database schema & migrations
│   ├── dist/         # Frontend build (copied here)
│   └── .env.production
├── Dockerfile        # Docker build config
├── docker-compose.yml
└── DEPLOYMENT.md
```

## Troubleshooting

### Database Connection Issues

```bash
# Check MySQL status
docker-compose logs mysql

# Restart MySQL
docker-compose restart mysql
```

### Prisma Migrations

```bash
# Deploy pending migrations
cd server
npx prisma migrate deploy

# View database in Prisma Studio
npx prisma studio
```

### Reset Database (Development Only)

```bash
docker-compose down -v
docker-compose up -d
```
