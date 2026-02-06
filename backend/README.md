# ValueHills Backend API

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend/server
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your database credentials:
```bash
cp .env.example .env
```

### 3. Setup Database
**Option A: Using Prisma with MySQL**
```bash
npx prisma generate
npx prisma db push
```

**Option B: Manual SQL Setup**
Run the SQL commands from `prisma/schema.sql` directly in your MySQL database.

### 4. Start Development Server
```bash
npm run dev
```

The server will run on http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin)

### Packages
- `GET /api/packages` - Get all packages
- `GET /api/packages/:id` - Get package by ID
- `POST /api/packages` - Create package (admin)
- `PUT /api/packages/:id` - Update package (admin)
- `DELETE /api/packages/:id` - Delete package (admin)

### Contributions
- `GET /api/contributions` - Get user contributions
- `POST /api/contributions` - Create contribution
- `PUT /api/contributions/:id` - Update contribution
- `DELETE /api/contributions/:id` - Delete contribution

### Withdrawals
- `GET /api/withdrawals` - Get user withdrawals
- `POST /api/withdrawals` - Request withdrawal
- `PUT /api/withdrawals/:id` - Update withdrawal status (admin)

### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/deposit` - Deposit funds
- `POST /api/wallet/withdraw` - Withdraw funds
- `GET /api/wallet/transactions` - Get transactions

### Bonuses
- `GET /api/bonuses` - Get user bonuses
- `POST /api/bonuses/claim` - Claim bonus

### Referrals
- `GET /api/referrals` - Get user referrals
- `GET /api/referrals/stats` - Get referral statistics
- `POST /api/referrals/invite` - Send referral invite

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent` - Get recent activity

### Admin
- `GET /api/admin/users` - Get all users (admin)
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/approvals` - Get pending approvals
- `PUT /api/admin/approvals/:id` - Process approval
- `GET /api/admin/packages` - Manage packages
- `GET /api/admin/withdrawals` - Manage withdrawals
- `GET /api/admin/audit` - View audit logs

## Environment Variables

| Variable | Description |
|----------|-------------|
| DATABASE_URL | MySQL connection string |
| JWT_SECRET | Secret for JWT tokens |
| PORT | Server port (default: 3000) |
