import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import adminRoutes from './routes/admin.js';
import packageRoutes from './routes/packages.js';
import walletRoutes from './routes/wallet.js';
import contributionRoutes from './routes/contributions.js';
import redemptionRoutes from './routes/redemptions.js';
import userRoutes from './routes/users.js';
import referralRoutes from './routes/referrals.js';
import bonusRoutes from './routes/bonuses.js';
import notificationRoutes from './routes/notifications.js';
import withdrawalRoutes from './routes/withdrawals.js';
import cron from 'node-cron';
import { runDailyContributions } from './services/contributionAutomation.js';
import { authenticateToken, isAdmin, isSuperAdmin } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = process.env.NODE_ENV === 'test'
    ? '.env.test'
    : (process.env.NODE_ENV === 'production' ? '.env.production' : '.env');
dotenv.config({ path: path.resolve(__dirname, envFile) });

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// 📝 Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

const apiRouter = express.Router();

// ⚙️ Contribution Automation Scheduler (Daily at Midnight)
if (process.env.NODE_ENV !== 'test') {
    cron.schedule('0 0 * * *', () => {
        runDailyContributions();
    });
}

// 🩺 Health Check
apiRouter.get('/health', (req, res) => res.json({ status: 'up', timestamp: new Date() }));

// Admin Automation
apiRouter.post('/admin/automation/run', authenticateToken, isSuperAdmin, async (req, res) => {
    await runDailyContributions();
    res.json({ message: 'Automation worker triggered manually' });
});

// API Route Mount Points
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/wallet', walletRoutes);
apiRouter.use('/packages', packageRoutes);
apiRouter.use('/contributions', contributionRoutes);
apiRouter.use('/referrals', referralRoutes);
apiRouter.use('/bonuses', bonusRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/withdrawals', withdrawalRoutes);
apiRouter.use('/redemptions', redemptionRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/dashboard', dashboardRoutes);

// Mount the API Router
app.use('/api', apiRouter);
app.use('/', apiRouter); // Fallback for proxies that strip /api

// 404 for any unmatched /api route
app.use('/api', (req, res) => {
    console.log(`404 at /api: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'API endpoint not found', method: req.method, path: req.url });
});

// Serve Static Files (Frontend)
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
    // Only serve index.html if not an API route
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    } else {
        res.status(404).json({ error: 'Endpoint not found' });
    }
});

export default app;
