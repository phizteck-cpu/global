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

Required environment variables:
- `DATABASE_URL` - MySQL connection string (e.g., mysql://user:password@localhost:3306/valuehills)
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production/test)

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

## Docker Deployment

### Build and Run with Docker Compose
```bash
docker-compose up -d --build
```

This will start:
- MySQL database on port 3306
- Backend API on port 3000
- phpMyAdmin on port 8080

### Environment Variables for Docker
Create a `.env` file in the root directory:
```env
MYSQL_ROOT_PASSWORD=your_secure_password
MYSQL_DATABASE=valuehills
MYSQL_USER=valuehills_user
MYSQL_PASSWORD=your_secure_password
BACKEND_PORT=3000
PHPMYADMIN_PORT=8080
```

## Production Deployment

### Using Docker
```bash
docker build -t valuehills-backend .
docker run -d -p 3000:3000 --env-file .env.production valuehills-backend
```

### Environment Variables for Production
```env
DATABASE_URL=mysql://user:password@hostname:3306/valuehills
JWT_SECRET=your-very-secure-random-string
PORT=3000
NODE_ENV=production
```

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

## Testing
```bash
npm test
```

## License
MIT
