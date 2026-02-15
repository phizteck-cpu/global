# GitHub Actions Deployment Setup

This guide explains how to set up automatic deployment to your Hostinger VPS using GitHub Actions.

## Step 1: Add SSH Secrets to GitHub

1. Go to your repository: https://github.com/phizteck-cpu/global
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add the following secrets:

| Secret Name | Value |
|------------|-------|
| `HOSTINGER_HOST` | Your VPS IP address (e.g., `192.168.1.1`) |
| `HOSTINGER_USER` | SSH username (e.g., `admin`) |
| `HOSTINGER_PASSWORD` | SSH password |
| `HOSTINGER_PORT` | SSH port (default: `22`) |

## Step 2: Prepare Your VPS

Connect to your VPS and set up the deployment directory:

```bash
# Connect via SSH
ssh admin@your-vps-ip

# Create the API directory
mkdir -p /home/admin/web/domains/valuehills.shop/public_html/api

# Navigate to the directory
cd /home/admin/web/domains/valuehills.shop/public_html/api

# Clone the repository
git clone https://github.com/phizteck-cpu/global.git .

# Install dependencies
npm ci

# Generate Prisma Client
npx prisma generate

# Create .env.production file with your production settings
nano .env.production

# Run migrations
npx prisma migrate deploy

# Start the server with PM2 (optional)
npm install -g pm2
pm2 start index.js
pm2 save
pm2 startup
```

## Step 3: Configure .env.production on VPS

Create `.env.production` on your VPS:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Secret
JWT_SECRET=your-secure-jwt-secret-key

# Database Configuration (MySQL)
DATABASE_URL=mysql://username:password@host:3306/database

# Paystack Configuration
PAYSTACK_SECRET=sk_live_your_secret_key
PAYSTACK_PUBLIC=pk_live_your_public_key

# Frontend URL
FRONTEND_URL=https://valuehills.shop
```

## Step 4: Trigger Deployment

After pushing code to the `main` branch, GitHub Actions will automatically:
1. Checkout the code
2. Install Node.js dependencies
3. Generate Prisma Client
4. SSH into your VPS and deploy

You can monitor deployments at:
**https://github.com/phizteck-cpu/global/actions**

## Manual Deployment

To trigger deployment manually:
1. Go to **Actions** tab
2. Select "Deploy to Hostinger VPS" workflow
3. Click **Run workflow**

## Troubleshooting

### SSH Connection Failed
- Verify your VPS IP, username, and password
- Ensure SSH access is enabled in Hostinger firewall
- Check that port 22 (or your custom port) is open

### Database Connection Issues
- Verify `DATABASE_URL` in `.env.production`
- Ensure MySQL is running and accessible

### PM2 Not Found
- Install PM2 globally: `npm install -g pm2`
- Or change the deploy script to use `node index.js` directly
