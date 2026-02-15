# 🚨 Quick Deployment Fix

## The Problem
Your deployment failed because the platform tried to build from the root directory, but your app has separate `backend` and `frontend` folders.

## ✅ Quick Solution (Choose One)

### Option 1: Render.com (Easiest Fix)

1. **Go to your Render dashboard**
2. **Edit your Web Service settings**
3. **Change these settings**:
   - **Root Directory**: `backend` ← ADD THIS!
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
4. **Click "Save Changes"**
5. **Redeploy**

### Option 2: Railway.app

1. **Delete current deployment**
2. **Redeploy with**:
   ```bash
   railway up --rootDirectory backend
   ```
3. **Or use the Railway dashboard**:
   - Settings → Root Directory → `backend`

### Option 3: Vercel

1. **In your Vercel project settings**:
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate`
   - Output Directory: Leave empty
   - Install Command: `npm install`

## 🔧 Environment Variables (Don't Forget!)

Add these in your platform's dashboard:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=change-this-to-a-long-random-string-minimum-32-chars
JWT_REFRESH_SECRET=change-this-to-another-long-random-string
```

## 📝 Step-by-Step for Render.com

1. Login to https://render.com
2. Find your service
3. Click "Settings" (gear icon)
4. Scroll to "Build & Deploy"
5. **Root Directory**: Type `backend`
6. **Build Command**: `npm install && npx prisma generate`
7. **Start Command**: `npm start`
8. Click "Save Changes"
9. Go to "Manual Deploy" → "Deploy latest commit"

## 🎯 After Successful Deployment

Run these commands in your platform's console/shell:

```bash
# 1. Initialize database
npx prisma db push

# 2. Seed initial data
npm run seed

# 3. Create superadmin
node create-superadmin.js
```

## ✅ Test Your Deployment

Visit these URLs (replace with your domain):

1. **Health Check**: `https://your-app.onrender.com/api/health`
   - Should return: `{"status":"up"}`

2. **Frontend**: `https://your-app.onrender.com`
   - Should show the homepage

3. **Signup**: `https://your-app.onrender.com/signup`
   - Should show registration form

## 🆘 Still Not Working?

### Check Build Logs
Look for these specific errors:

**Error**: "Cannot find module '@prisma/client'"
**Fix**: Make sure build command includes `npx prisma generate`

**Error**: "ENOENT: no such file or directory"
**Fix**: Verify Root Directory is set to `backend`

**Error**: "Port already in use"
**Fix**: Make sure PORT environment variable is set to 5000

### Common Mistakes

❌ **Wrong**: Root Directory = empty or `/`
✅ **Correct**: Root Directory = `backend`

❌ **Wrong**: Build Command = `npm run build`
✅ **Correct**: Build Command = `npm install && npx prisma generate`

❌ **Wrong**: Start Command = `node server.js`
✅ **Correct**: Start Command = `npm start`

## 📞 Platform-Specific Help

### Render.com
- Docs: https://render.com/docs/web-services
- Support: https://render.com/support

### Railway.app
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway

### Vercel
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

## 🎉 Success Indicators

You'll know it worked when:
- ✅ Build completes without errors
- ✅ Service shows "Live" status
- ✅ Health check endpoint responds
- ✅ You can access the signup page
- ✅ No 404 or 500 errors

## 💡 Pro Tip

After fixing the deployment:
1. Test the registration flow
2. Create a superadmin account
3. Configure company bank account
4. Test the full user journey

---

**Need more help?** Check `DEPLOYMENT_FIX.md` for detailed instructions.

**Last Updated**: February 12, 2026
