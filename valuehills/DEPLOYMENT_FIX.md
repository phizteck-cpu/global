# Deployment Fix Guide

## Issue
The deployment is failing because the platform is trying to build from the root directory, but the application structure has separate backend and frontend folders.

## Solution

### Option 1: Deploy Backend Only (Recommended for Quick Fix)

#### For Render.com:
1. Go to your Render dashboard
2. Create a new Web Service
3. Connect your GitHub repository
4. **Important Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     ```
     NODE_ENV=production
     DATABASE_URL=file:./prisma/dev.db
     JWT_SECRET=your-secret-key-change-this-in-production
     JWT_REFRESH_SECRET=your-refresh-secret-change-this
     PORT=5000
     ```

#### For Railway.app:
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Create new project: `railway init`
4. Set root directory:
   ```bash
   railway up --rootDirectory backend
   ```
5. Add environment variables in Railway dashboard

#### For Vercel:
Create `vercel.json` in root:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "backend/index.js"
    }
  ]
}
```

### Option 2: Deploy as Monorepo (Full Stack)

#### Update Root Package.json
Already updated with proper scripts:
- `npm run build` - Builds both backend and frontend
- `npm start` - Starts the backend server

#### For Render.com (Monorepo):
1. **Build Command**: `npm run build`
2. **Start Command**: `npm start`
3. **Root Directory**: Leave empty (use root)

#### For Railway.app (Monorepo):
Use the `railway.json` file that was created.

### Option 3: Separate Deployments (Best for Production)

#### Backend Deployment:
1. Create Web Service
2. Root Directory: `backend`
3. Build: `npm install && npx prisma generate`
4. Start: `npm start`

#### Frontend Deployment:
1. Create Static Site
2. Root Directory: `frontend`
3. Build: `npm install && npm run build`
4. Publish Directory: `dist`

## Quick Fix Commands

### If deploying to VPS:
```bash
# Clone repo
git clone https://github.com/phizteck-cpu/global.git valuehills
cd valuehills

# Build and deploy
npm run build
npm start
```

### If using Docker:
Create `Dockerfile` in backend:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]
```

Build and run:
```bash
cd backend
docker build -t valuehills-api .
docker run -p 5000:5000 valuehills-api
```

## Environment Variables Required

Set these in your deployment platform:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=file:./prisma/dev.db

# IMPORTANT: Change these!
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters

# Optional
FRONTEND_URL=https://yourdomain.com
API_ONLY=false
```

## Post-Deployment Steps

After successful deployment:

1. **Initialize Database**:
   ```bash
   # SSH into your server or use platform console
   cd backend
   npx prisma db push
   npm run seed
   ```

2. **Create Superadmin**:
   ```bash
   node create-superadmin.js
   ```

3. **Configure Company Account**:
   - Login as superadmin
   - Go to Admin → Funding
   - Set bank details

## Troubleshooting

### Error: "Cannot find module '@prisma/client'"
**Solution**: Run `npx prisma generate` in the backend directory

### Error: "Database file not found"
**Solution**: Run `npx prisma db push` to create the database

### Error: "Port already in use"
**Solution**: Change PORT environment variable or kill the process using that port

### Error: "Build failed"
**Solution**: Make sure you're building from the correct directory (backend)

## Platform-Specific Instructions

### Render.com
1. Dashboard → New → Web Service
2. Connect GitHub repo
3. **Root Directory**: `backend`
4. **Build Command**: `npm install && npx prisma generate`
5. **Start Command**: `npm start`
6. Add environment variables
7. Deploy

### Railway.app
```bash
railway login
railway init
railway up --rootDirectory backend
```
Then add environment variables in dashboard.

### Vercel
```bash
vercel --prod
```
Make sure `vercel.json` is configured correctly.

### Heroku
```bash
heroku create valuehills-api
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
git push heroku main
```

## Testing Deployment

After deployment, test these endpoints:

1. **Health Check**:
   ```bash
   curl https://your-domain.com/api/health
   ```
   Should return: `{"status":"up","timestamp":"..."}`

2. **Test Registration**:
   Visit: `https://your-domain.com/signup`

3. **Test Admin Login**:
   Visit: `https://your-domain.com/admin/login`

## Common Issues and Solutions

### Issue: "Prisma Client not generated"
```bash
cd backend
npx prisma generate
```

### Issue: "Database connection failed"
Check DATABASE_URL environment variable is set correctly.

### Issue: "JWT secret not set"
Add JWT_SECRET and JWT_REFRESH_SECRET to environment variables.

### Issue: "File upload fails"
Create uploads directory:
```bash
mkdir -p backend/uploads/activation-proofs
mkdir -p backend/uploads/payment-proofs
```

## Success Checklist

- [ ] Backend deployed and running
- [ ] Health check endpoint responding
- [ ] Database initialized
- [ ] Superadmin account created
- [ ] Company bank account configured
- [ ] Registration flow tested
- [ ] Admin approval tested
- [ ] Environment variables set
- [ ] HTTPS enabled

## Need Help?

If deployment still fails:
1. Check the build logs carefully
2. Verify you're using the correct root directory
3. Ensure all environment variables are set
4. Try deploying backend only first
5. Check the platform's documentation

## Quick Deploy Script

Save this as `deploy.sh`:
```bash
#!/bin/bash

echo "🚀 Deploying ValueHills Platform..."

# Backend
echo "📦 Building backend..."
cd backend
npm install
npx prisma generate
npx prisma db push
npm run seed

# Frontend
echo "🎨 Building frontend..."
cd ../frontend
npm install
npm run build

# Copy frontend to backend
echo "📋 Copying frontend build..."
cp -r dist ../backend/

# Start backend
echo "✅ Starting server..."
cd ../backend
npm start
```

Make executable and run:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

**Last Updated**: February 12, 2026
**Status**: Ready to Deploy with Fix
