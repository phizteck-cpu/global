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
- App Server (port 5000)
- phpMyAdmin (port 8080)

### Option 2: Build and Run Manually

```bash
# Clone the repository
git clone https://github.com/phizteck-cpu/global.git
cd global

# Build frontend
cd frontend
npm install
npm run build

# Start backend
cd ../server
npm install
npm run start
```

## Frontend Deployment to valuehills.shop

The frontend build is in `frontend/dist/` after running `npm run build`.

### Uploading to cPanel/Hostinger

1. **Build the frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Configure API URL:**
   - Edit `frontend/.env.production` and set:
     ```
     VITE_API_URL=https://api.valuehills.shop
     ```
   - Rebuild after changing

3. **Upload to Hostinger:**
   - Compress the `frontend/dist/` folder to `dist.zip`
   - Upload to `public_html/` in Hostinger File Manager
   - Extract the zip file
   - The site will be available at https://valuehills.shop

### Configuring API on Hostinger

1. **Upload Backend:**
   - Upload the `server/` folder to your hosting
   - Configure environment variables in `.env.production`

2. **Point API to your backend:**
   - Ensure `VITE_API_URL=https://api.valuehills.shop` is set
   - Configure your hosting to route `/api/*` requests to the backend

## Environment Configuration

### Production Environment Variables

Create a `.env.production` file in the `server/` directory:

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
- [ ] Set `FRONTING_URL` to your frontend domain
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Seed initial data if needed: `npm run seed`

## Deploying to Hostinger VPS

1. **Connect to VPS via SSH**
   ```bash
   ssh user@your-vps-ip
   ```

2. **Install Docker**
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

3. **Clone and Deploy**
   ```bash
   git clone https://github.com/phizteck-cpu/global.git
   cd global
   docker-compose up -d
   ```

4. **Configure Firewall**
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 5000/tcp
   sudo ufw enable
   ```

5. **Setup Reverse Proxy (Nginx)**
   - Install Nginx: `sudo apt install nginx`
   - Configure SSL with Let's Encrypt
   - Proxy requests to localhost:5000

## Monitoring

- **Health Check:** `http://your-domain.com/api/health`
- **Logs:** `docker-compose logs -f app`
- **Database:** Access via phpMyAdmin at `http://your-domain.com:8080`

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
docker-compose exec app npx prisma migrate deploy

# View database in Prisma Studio
docker-compose exec app npx prisma studio
```

### Reset Database (Development Only)

```bash
docker-compose down -v
docker-compose up -d
```

## Project Structure

```
global/
├── frontend/          # React frontend
│   ├── src/          # Source code
│   ├── dist/         # Production build
│   └── .env.production  # Production env vars
├── server/           # Express backend
│   ├── routes/      # API routes
│   ├── prisma/       # Database schema & migrations
│   └── .env.production  # Production env vars
├── dist/             # Copied frontend build for server
├── Dockerfile        # Docker build config
├── docker-compose.yml # Docker services config
└── DEPLOYMENT.md    # This file
```
