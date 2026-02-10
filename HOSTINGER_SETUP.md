# Hostinger Node.js Deployment Guide

## Problem
503 error occurs because the Node.js process isn't starting correctly on Hostinger.

## Solution - Configure Hostinger Node.js Correctly

### For API Domain (api2.valuehills.shop)

1. **In hPanel → Node.js:**

   | Setting | Value |
   |---------|-------|
   | Application root | `api` |
   | Application URL | `api2.valuehills.shop` |
   | Entry point | `backend/index.js` |
   | Start command | `node backend/index.js` |

   **DO NOT** use `npm run build` - that's for the frontend only!

2. **Install Dependencies:**
   - Click "Install Dependencies" in hPanel

3. **Environment Variables:**
   - In hPanel → Node.js → Show Environment Variables
   - Add these:
   ```
   NODE_ENV=production
   PORT=5000
   API_ONLY=true
   DATABASE_URL=your_mysql_connection_string
   JWT_SECRET=your_jwt_secret
   ```

### For Frontend Domain (valuehills.shop)

1. **Upload Files:**
   - Upload everything from `backend/dist/` to public_html
   - Or use Git and pull the repo

2. **Nginx Configuration:**
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

### For API Domain (api2.valuehills.shop)

1. **Nginx Configuration:**
   ```nginx
   server {
       listen 80;
       server_name api2.valuehills.shop;
       location / {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

## Common Issues & Fixes

### "503 Service Unavailable"
- Node.js process crashed
- Check logs in hPanel → Node.js → Show Logs
- Usually caused by:
  - Wrong entry point
  - Database connection failed
  - Missing dependencies

### "Module not found"
- Run "Install Dependencies" in hPanel
- Make sure package.json is in the application root

### Database connection failed
- Verify DATABASE_URL is correct
- MySQL host might be different on Hostinger
- Check Hostinger → Databases for correct connection info

## Testing
After setup, test:
```bash
# API should return JSON
curl https://api2.valuehills.shop/api/health

# Frontend should return HTML
curl https://valuehills.shop/
```
