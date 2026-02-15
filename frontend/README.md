# ValueHills Frontend

## Setup Instructions

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
Create `.env` file based on your backend URL:
```
VITE_API_URL=http://localhost:3000/api
```

### 3. Start Development Server
```bash
npm run dev
```

The frontend will run on http://localhost:5173

## Pages

- `/` - Home page
- `/login` - User login
- `/signup` - User registration
- `/dashboard` - User dashboard
- `/packages` - Investment packages
- `/wallet` - Wallet management
- `/network` - Network/referrals
- `/redeem` - Redeem points/inventory
- `/profile` - User profile

### Admin Pages
- `/admin/login` - Admin login
- `/admin/overview` - Admin dashboard
- `/admin/users` - User management
- `/admin/packages` - Package management
- `/admin/approvals` - Pending approvals
- `/admin/withdrawals` - Withdrawal management
- `/admin/audit` - Audit logs
- `/admin/inventory` - Inventory management

## Tech Stack
- React
- React Router
- Axios for API calls
- Tailwind CSS
