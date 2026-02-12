# 🔑 Test Credentials

## Database Seeded Successfully ✅

The database has been populated with test users and data.

---

## Test Accounts

### 👑 Super Admin
- **Email:** `superadmin@valuehills.com`
- **Username:** `superadmin`
- **Password:** `admin123`
- **Role:** SUPERADMIN
- **Access:** Full system access, can manage admins

### 🛡️ Admin
- **Email:** `admin@valuehills.com`
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** ADMIN
- **Access:** User management, approvals, withdrawals

### 📊 Accountant/Auditor
- **Email:** `auditor@valuehills.com`
- **Username:** `auditor`
- **Password:** `admin123`
- **Role:** ACCOUNTANT
- **Access:** Financial reports, audit logs

### 👤 Regular Member
- **Email:** `member@example.com`
- **Username:** `member123`
- **Password:** `password123`
- **Role:** MEMBER
- **Tier:** STARTER
- **Access:** Standard user features

---

## Quick Login Test

### Using PowerShell
```powershell
$body = @{
    email = "member@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body

Write-Host "Token: $($response.token)"
Write-Host "User: $($response.user.username) ($($response.user.role))"
```

### Using cURL
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"member@example.com","password":"password123"}'
```

---

## Tiers Created

### STARTER
- Weekly Amount: ₦1,333.33
- Onboarding Fee: ₦3,000
- Maintenance Fee: ₦100
- Upgrade Fee: ₦0

### PRO
- Weekly Amount: ₦1,333.33
- Onboarding Fee: ₦5,000
- Maintenance Fee: ₦500
- Upgrade Fee: ₦2,000

### ELITE
- Weekly Amount: ₦1,333.33
- Onboarding Fee: ₦10,000
- Maintenance Fee: ₦1,000
- Upgrade Fee: ₦5,000

---

## Frontend Login

1. Open http://localhost:5174
2. Click "Login"
3. Use any of the credentials above
4. Explore the dashboard

---

## Admin Panel Access

1. Login with admin credentials
2. Navigate to `/admin` route
3. Access admin dashboard features:
   - User management
   - Withdrawal approvals
   - System statistics
   - Audit logs

---

## Testing Workflow

### 1. Login as Member
```
Username: member123
Password: password123
```

### 2. Explore Member Features
- View dashboard
- Check wallet balance
- Browse packages
- View referral code
- Check notifications

### 3. Login as Admin
```
Username: admin
Password: admin123
```

### 4. Test Admin Features
- View all users
- Approve/reject withdrawals
- Manage packages
- View system stats

---

## Security Notes

⚠️ **IMPORTANT:** These are test credentials for local development only!

- Never use these passwords in production
- Change all default passwords before deployment
- Use strong, unique passwords for production accounts
- Enable 2FA for admin accounts in production

---

## Need More Test Data?

Run the seed script again to reset:
```bash
node backend/prisma/seed.js
```

Or create custom test users via the registration endpoint.

---

**Happy Testing! 🚀**
