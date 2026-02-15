# 🚀 ValueHills Local Server - Running

## Server Status: ✅ ONLINE

### Backend API
- **URL:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health
- **Environment:** Development (SQLite)
- **Database:** backend/prisma/dev.db
- **Status:** ✅ Connected

### Frontend
- **URL:** http://localhost:5174
- **Framework:** React + Vite
- **Status:** ✅ Running
- **Note:** Port 5173 was in use, using 5174 instead

---

## Quick Commands

### Stop Servers
Use the Kiro process manager or:
```bash
# Stop backend
Ctrl+C in backend terminal

# Stop frontend  
Ctrl+C in frontend terminal
```

### Restart Servers
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### View Logs
Check the Kiro process output panel or terminal windows

---

## Database Setup

The app is using SQLite for local development:
- **File:** `backend/prisma/dev.db`
- **Schema:** `backend/prisma/schema.prisma`

### Seed Database (Optional)
```bash
cd backend
npm run seed
```

### Reset Database
```bash
cd backend
npx prisma db push --force-reset --schema=prisma/schema.prisma
```

---

## API Endpoints

Base URL: `http://localhost:5000/api`

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login
- POST `/api/auth/refresh` - Refresh token

### User
- GET `/api/users/profile` - Get user profile
- PUT `/api/users/profile` - Update profile

### Wallet
- GET `/api/wallet` - Get wallet balance
- POST `/api/wallet/deposit` - Deposit funds

### Admin
- GET `/api/admin/users` - List all users (admin only)
- GET `/api/admin/dashboard` - Admin dashboard stats

---

## Troubleshooting

### Backend won't start
1. Check if port 5000 is available
2. Verify `.env.local` exists in backend folder
3. Run `npx prisma generate --schema=backend/prisma/schema.prisma`

### Frontend won't start
1. Check if port 5173/5174 is available
2. Run `npm install` in frontend folder
3. Check for build errors in terminal

### Database errors
1. Delete `backend/prisma/dev.db*` files
2. Run: `npx prisma db push --schema=backend/prisma/schema.prisma`
3. Restart backend server

---

## Environment Files

### Backend (.env.local)
```env
DATABASE_URL="file:prisma/dev.db"
JWT_SECRET="dev-secret-key-not-for-production"
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Next Steps

1. ✅ Servers are running
2. Open http://localhost:5174 in your browser
3. Create a test account or seed the database
4. Start developing!

---

**Note:** This is a development setup. For production deployment, see `DEPLOYMENT.md`.
