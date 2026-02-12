# 🚀 Quick Start Guide

## Your App is Running!

**Frontend:** http://localhost:5174  
**Backend:** http://localhost:5000/api  
**Status:** ✅ All systems operational

---

## 🔑 Login Credentials

### Admin
- URL: http://localhost:5174/admin/login
- Username: `admin`
- Password: `admin123`

### Super Admin
- URL: http://localhost:5174/admin/login
- Username: `superadmin`
- Password: `admin123`

### Member
- URL: http://localhost:5174/login
- Username: `member123`
- Password: `password123`

---

## ⚡ Quick Actions

### Test API Health
```
http://localhost:5000/api/health
```

### View All Users
```powershell
node backend/check-users.js
```

### Restart Servers
Use Kiro's process manager or:
- Backend: Process ID 12
- Frontend: Process ID 13

---

## 📖 Documentation

- `ADMIN_LOGIN_SOLUTION.md` - Complete login guide
- `TEST_CREDENTIALS.md` - All test accounts
- `API_TESTING_GUIDE.md` - API endpoints
- `LOCAL_SERVER_INFO.md` - Server details

---

## 🐛 Troubleshooting

### Login fails?
1. Use USERNAME (not email)
2. Clear browser cache
3. Check backend is running

### 429 Error?
- Wait 15 minutes
- Or restart backend server

### Can't connect?
- Verify http://localhost:5000/api/health works
- Check both servers are running

---

**Start here:** http://localhost:5174/admin/login
