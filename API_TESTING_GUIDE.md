# ValueHills API Testing Guide

## Base URL
```
http://localhost:5000/api
```

## ✅ Working Endpoints

### Health Check (No Auth Required)
```bash
GET http://localhost:5000/api/health
```

**Response:**
```json
{
  "status": "up",
  "timestamp": "2026-02-12T07:01:18.447Z"
}
```

---

## 🔐 Authentication Endpoints

### Register New User
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "username": "testuser",
  "password": "SecurePass123!",
  "firstName": "Test",
  "lastName": "User",
  "phone": "+1234567890"
}
```

### Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "username": "testuser",
    "role": "MEMBER"
  }
}
```

### Refresh Token
```bash
POST http://localhost:5000/api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

---

## 👤 User Endpoints (Requires Auth)

**Note:** Add this header to all authenticated requests:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Get User Profile
```bash
GET http://localhost:5000/api/users/profile
Authorization: Bearer YOUR_TOKEN
```

### Update Profile
```bash
PUT http://localhost:5000/api/users/profile
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "firstName": "Updated",
  "lastName": "Name",
  "phone": "+9876543210"
}
```

---

## 💰 Wallet Endpoints (Requires Auth)

### Get Wallet Balance
```bash
GET http://localhost:5000/api/wallet
Authorization: Bearer YOUR_TOKEN
```

### Get Wallet Transactions
```bash
GET http://localhost:5000/api/wallet/transactions
Authorization: Bearer YOUR_TOKEN
```

---

## 📦 Package Endpoints

### Get All Packages
```bash
GET http://localhost:5000/api/packages
Authorization: Bearer YOUR_TOKEN
```

### Purchase Package
```bash
POST http://localhost:5000/api/packages/purchase
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "packageId": 1,
  "paymentMethod": "wallet"
}
```

---

## 🔗 Referral Endpoints

### Get Referral Code
```bash
GET http://localhost:5000/api/referrals/code
Authorization: Bearer YOUR_TOKEN
```

### Get Referral Stats
```bash
GET http://localhost:5000/api/referrals/stats
Authorization: Bearer YOUR_TOKEN
```

---

## 🎁 Bonus Endpoints

### Get Available Bonuses
```bash
GET http://localhost:5000/api/bonuses
Authorization: Bearer YOUR_TOKEN
```

---

## 🔔 Notification Endpoints

### Get Notifications
```bash
GET http://localhost:5000/api/notifications
Authorization: Bearer YOUR_TOKEN
```

### Mark as Read
```bash
PUT http://localhost:5000/api/notifications/:id/read
Authorization: Bearer YOUR_TOKEN
```

---

## 💸 Withdrawal Endpoints

### Request Withdrawal
```bash
POST http://localhost:5000/api/withdrawals/request
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "amount": 100.00,
  "method": "bank_transfer",
  "accountDetails": {
    "accountNumber": "1234567890",
    "bankName": "Test Bank"
  }
}
```

### Get Withdrawal History
```bash
GET http://localhost:5000/api/withdrawals/history
Authorization: Bearer YOUR_TOKEN
```

---

## 👑 Admin Endpoints (Requires Admin Role)

### Get All Users
```bash
GET http://localhost:5000/api/admin/users
Authorization: Bearer ADMIN_TOKEN
```

### Get Dashboard Stats
```bash
GET http://localhost:5000/api/admin/dashboard
Authorization: Bearer ADMIN_TOKEN
```

### Approve Withdrawal
```bash
PUT http://localhost:5000/api/admin/withdrawals/:id/approve
Authorization: Bearer ADMIN_TOKEN
```

### Reject Withdrawal
```bash
PUT http://localhost:5000/api/admin/withdrawals/:id/reject
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "reason": "Insufficient documentation"
}
```

---

## 🧪 Testing with cURL

### Test Health Endpoint
```bash
curl http://localhost:5000/api/health
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "SecurePass123!",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+1234567890"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Profile (with token)
```bash
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🧪 Testing with PowerShell

### Test Health Endpoint
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get
```

### Register User
```powershell
$body = @{
    email = "test@example.com"
    username = "testuser"
    password = "SecurePass123!"
    firstName = "Test"
    lastName = "User"
    phone = "+1234567890"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### Login
```powershell
$body = @{
    email = "test@example.com"
    password = "SecurePass123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body

$token = $response.token
```

### Get Profile
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/users/profile" `
  -Method Get `
  -Headers $headers
```

---

## 🐛 Common Issues

### 401 Unauthorized
- Token is missing or invalid
- Token has expired
- User doesn't have required permissions

### 404 Not Found
- Endpoint doesn't exist
- Check the URL path (should start with `/api/`)

### 503 Service Unavailable
- Database connection failed
- Check backend logs

### Rate Limit Exceeded
- Too many requests to auth endpoints
- Wait a few minutes and try again

---

## 📊 Database Seeding

To populate the database with test data:

```bash
cd backend
npm run seed
```

This will create:
- Test users (member, admin, superadmin)
- Sample packages
- Test transactions

---

## 🔍 Debugging

### Check Backend Logs
Look at the Kiro process output for the backend server

### Check Database
```bash
cd backend
npx prisma studio --schema=prisma/schema.prisma
```

This opens a GUI to browse your database.

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- Amounts are in decimal format (e.g., 100.50)
- Phone numbers should include country code
- Passwords must be at least 8 characters
- JWT tokens expire after 15 minutes (configurable)

---

**Happy Testing! 🚀**
