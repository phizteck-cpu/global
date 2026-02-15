# ValueHills - Premium Wealth Management Platform

A full-stack real estate investment platform built with React, Node.js, and MongoDB.

## Features

- **Landing Page**: Premium UI with hero, features, properties showcase
- **User Portal**: Browse properties, make investments, track portfolio
- **Admin Dashboards**:
  - Superadmin: System settings, staff management
  - Admin: Property management, user management
  - Accountant: Financial reports, ROI distribution
  - Frontdesk: KYC verification, registrations

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

1. **Install dependencies**
```bash
cd valuehills/server
npm install

cd ../client
npm install
```

2. **Configure environment**
```bash
cd ../server
# Edit .env with your MongoDB URI
```

3. **Seed database**
```bash
npm run seed
```

4. **Start development servers**

Terminal 1 (Backend):
```bash
npm start
```

Terminal 2 (Frontend):
```bash
cd ../client
npm run dev
```

5. **Open browser**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Superadmin | superadmin@valuehills.com | admin123 |
| Admin | admin@valuehills.com | admin123 |
| Accountant | accountant@valuehills.com | admin123 |
| Frontdesk | frontdesk@valuehills.com | admin123 |
| User | user@example.com | user123 |

## API Endpoints

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/properties` - List properties
- `GET /api/investments` - User investments
- `GET /api/wallets` - Wallet info
- `GET /api/dashboard/user` - User dashboard data
- `GET /api/dashboard/admin` - Admin dashboard data

## Project Structure

```
valuehills/
├── client/           # React frontend
│   ├── src/
│   │   ├── pages/    # Page components
│   │   ├── context/  # React context
│   │   └── services/ # API calls
│   └── public/
└── server/           # Express backend
    ├── models/       # Mongoose models
    ├── routes/      # API routes
    └── middleware/  # Auth middleware
```
