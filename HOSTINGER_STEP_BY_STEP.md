# 🎯 HOSTINGER DATABASE FIX - STEP BY STEP GUIDE

## 🔴 CURRENT STATUS
Your app is deployed but can't connect to the database because the MySQL password is wrong.

---

## 📍 STEP 1: GET YOUR MYSQL PASSWORD

### Where to find it in Hostinger:

1. **Login to Hostinger** at https://hpanel.hostinger.com
2. **Click "Databases"** in the left sidebar menu
3. **Click "MySQL Databases"**
4. You'll see a list of databases. Look for:
   - `u948761456_hills` OR
   - `u948761456_value1`
5. **Click on the database name**
6. You'll see:
   - Database Name: `u948761456_hills`
   - Username: `u948761456_value1` (or similar)
   - Password: `********` (hidden)
   - Hostname: `127.0.0.1` or `localhost`

### If you don't know the password:
- Click **"Reset Password"** button
- Hostinger will generate a new password
- **COPY IT IMMEDIATELY** and save it somewhere safe

---

## 📍 STEP 2: UPDATE ENVIRONMENT VARIABLE

### Where to set it in Hostinger:

1. Go back to **Hostinger main menu**
2. Click **"Website"** in left sidebar
3. Find your **Node.js application** (api2.valuehills.shop)
4. Click on it
5. Click the **"Environment Variables"** tab
6. Look for `DATABASE_URL` variable
   - If it exists: Click **"Edit"** (pencil icon)
   - If it doesn't exist: Click **"Add Variable"**

### What to enter:

**Variable Name:**
```
DATABASE_URL
```

**Variable Value:**
```
mysql://USERNAME:PASSWORD@127.0.0.1:3306/DATABASE_NAME
```

**Replace with your actual values:**
- `USERNAME`: Your MySQL username (e.g., `u948761456_value1`)
- `PASSWORD`: The password from Step 1
- `DATABASE_NAME`: Your database name (e.g., `u948761456_hills`)

**Example:**
```
mysql://u948761456_value1:MySecurePass123@127.0.0.1:3306/u948761456_hills
```

### ⚠️ SPECIAL CHARACTERS IN PASSWORD

If your password contains these characters, you MUST encode them:

| Character | Replace With |
|-----------|--------------|
| @         | %40          |
| $         | %24          |
| !         | %21          |
| #         | %23          |
| %         | %25          |
| &         | %26          |
| =         | %3D          |

**Example:**
- Original password: `Mega4$v@1`
- Encoded password: `Mega4%24v%401`
- Full URL: `mysql://u948761456_value1:Mega4%24v%401@127.0.0.1:3306/u948761456_hills`

7. Click **"Save"** or **"Add"**

---

## 📍 STEP 3: INITIALIZE THE DATABASE

### Connect via SSH:

1. In Hostinger, go to **"Advanced"** → **"SSH Access"**
2. Click **"Enable SSH"** if not already enabled
3. Copy the SSH command shown (looks like: `ssh u948761456@123.45.67.89 -p 65002`)
4. Open your terminal/command prompt
5. Paste and run the SSH command
6. Enter your SSH password when prompted

### Run these commands:

```bash
# Navigate to your app directory
cd domains/api2.valuehills.shop/public_html

# Check if you're in the right place
ls -la

# You should see: server.js, package.json, backend folder

# Initialize Prisma database
npx prisma db push --schema=backend/prisma/schema.prisma

# Seed the database with initial data
node backend/prisma/seed.js
```

### Expected output:
```
✔ Generated Prisma Client
Your database is now in sync with your schema.
✔ Seeding completed successfully
```

---

## 📍 STEP 4: RESTART YOUR APPLICATION

### In Hostinger:

1. Go back to your **Node.js application** page
2. Look for the **"Restart"** button (usually top right)
3. Click **"Restart"**
4. Wait 10-20 seconds for the app to restart

---

## 📍 STEP 5: TEST YOUR API

### Open your browser and visit:

```
https://api2.valuehills.shop/api/health
```

### Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-12T...",
  "environment": "production",
  "database": "connected"
}
```

### If you see this, SUCCESS! 🎉

### Test login endpoint:
```
https://api2.valuehills.shop/api/auth/login
```

Should return: `{"error":"Invalid credentials"}` (this is good - means API is working)

---

## 🔧 TROUBLESHOOTING

### Still getting authentication error?

1. **Double-check the password** - Make sure you copied it correctly
2. **Check special character encoding** - Did you encode @, $, etc.?
3. **Verify database name** - Is it `u948761456_hills` or something else?
4. **Check username** - Is it `u948761456_value1` or different?

### Can't find MySQL database in Hostinger?

You may need to create one:
1. Go to **Databases** → **MySQL Databases**
2. Click **"Create Database"**
3. Name it: `u948761456_hills`
4. Create a user: `u948761456_value1`
5. Set a password
6. Assign user to database with ALL PRIVILEGES

### SSH not working?

Alternative: Use Hostinger's **File Manager**:
1. Go to **Files** → **File Manager**
2. Navigate to your app folder
3. Use the **Terminal** button at the top
4. Run the prisma commands

---

## 🎯 QUICK CHECKLIST

- [ ] Found MySQL database in Hostinger
- [ ] Got/reset MySQL password
- [ ] Updated DATABASE_URL environment variable
- [ ] Encoded special characters in password
- [ ] SSH'd into server
- [ ] Ran `npx prisma db push`
- [ ] Ran `node backend/prisma/seed.js`
- [ ] Restarted application
- [ ] Tested /api/health endpoint
- [ ] Saw "database": "connected" ✅

---

## 📞 STILL STUCK?

If you're still having issues, check:
1. Hostinger application logs (in Node.js app page)
2. MySQL database is actually created
3. User has permissions on the database
4. Hostname is correct (127.0.0.1 vs localhost)

---

**You're almost there! Just need to get that MySQL password correct.** 🚀
