# ValueHills MySQL Database Setup Guide

This guide explains how to set up the MySQL database for the ValueHills platform replica/prototype.

## Prerequisites

- Docker Desktop installed on your system
- Node.js (v18 or higher)
- npm or yarn

## Quick Start

### Option 1: Using Docker (Recommended)

1. **Start MySQL and phpMyAdmin containers:**
   ```bash
   docker-compose up -d
   ```

2. **Wait for MySQL to be ready** (usually takes 10-20 seconds)

3. **Initialize the database:**
   ```bash
   # For Linux/macOS
   chmod +x backend/setup-db.sh
   ./backend/setup-db.sh

   # For Windows (Command Prompt)
   cd backend
   setup-db.cmd
   ```

4. **Start the application:**
   ```bash
   # Terminal 1 - Start backend
   cd backend
   npm start

   # Terminal 2 - Start frontend
   npm run dev
   ```

### Option 2: Manual MySQL Setup

If you prefer to use your own MySQL installation:

1. **Create the database:**
   ```sql
   CREATE DATABASE valuehills CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Run the schema:**
   ```bash
   mysql -u your_user -p valuehills < backend/prisma/schema.sql
   ```

3. **Update .env file:**
   Update the `DATABASE_URL` in `backend/.env` with your MySQL connection string:
   ```
   DATABASE_URL=mysql://username:password@localhost:3306/valuehills
   ```

4. **Generate Prisma client:**
   ```bash
   cd backend
   npx prisma generate
   ```

## Database Credentials

### Docker MySQL
- **Host:** localhost
- **Port:** 3306
- **Database:** valuehills
- **Username:** valuehills_user
- **Password:** valuehills_password
- **Root Password:** rootpassword

### phpMyAdmin
- **URL:** http://localhost:8080
- **Username:** root
- **Password:** rootpassword

## Default Test Accounts

After database initialization, the following test accounts are created:

| Role | Email | Username | Password |
|------|-------|----------|----------|
| Super Admin | admin@valuehills.com | admin | MyPassword123 |
| Member | member@example.com | member | user123 |

## Database Schema

The database consists of the following tables:

1. **User** - User accounts with roles, balances, and KYC info
2. **Tier** - Membership tiers (STARTER, PRO, ELITE)
3. **Contribution** - Weekly contribution tracking
4. **Transaction** - Ledger system for all financial transactions
5. **Withdrawal** - Withdrawal request management
6. **AuditLog** - Admin action logging
7. **SystemConfig** - System configuration key-value store

## Environment Variables

Update the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_secure_jwt_secret_key

# Database Configuration (MySQL)
DATABASE_URL=mysql://valuehills_user:valuehills_password@localhost:3306/valuehills

# Paystack Configuration (Optional)
PAYSTACK_SECRET=sk_test_your_secret_key
PAYSTACK_PUBLIC=pk_test_your_public_key
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/referrals` - Get user referrals

### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/deposit` - Deposit funds
- `POST /api/wallet/withdraw` - Request withdrawal

### Contributions
- `GET /api/contributions` - Get contributions
- `POST /api/contributions` - Create contribution

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/withdrawals` - Get withdrawal requests
- `PUT /api/admin/withdrawals/:id` - Process withdrawal

## Troubleshooting

### MySQL Connection Issues

1. **Check if MySQL container is running:**
   ```bash
   docker ps | grep mysql
   ```

2. **View MySQL logs:**
   ```bash
   docker-compose logs mysql
   ```

3. **Restart MySQL container:**
   ```bash
   docker-compose restart mysql
   ```

### Prisma Client Issues

1. **Regenerate Prisma client:**
   ```bash
   cd server
   npx prisma generate
   ```

2. **Push schema to database:**
   ```bash
   npx prisma db push
   ```

### Port Conflicts

If port 3306 or 8080 is already in use, modify the `docker-compose.yml` to use different ports.

## Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: Deletes all data)
docker-compose down -v

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f mysql
```
