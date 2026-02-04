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

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : (process.env.NODE_ENV === 'production' ? '.env.production' : '.env');
dotenv.config({ path: path.resolve(__dirname, envFile) });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// 🩺 Health Check
app.get('/api/health', (req, res) => res.json({ status: 'up', timestamp: new Date() }));

// ⚙️ Contribution Automation Scheduler (Daily at Midnight)
if (process.env.NODE_ENV !== 'test') {
    cron.schedule('0 0 * * *', () => {
        runDailyContributions();
    });
}

// Admin: Manual Automation Trigger
app.post('/api/admin/automation/run', authenticateToken, isSuperAdmin, async (req, res) => {
    await runDailyContributions();
    res.json({ message: 'Automation worker triggered manually' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/bonuses', bonusRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api', redemptionRoutes); // Handles /inventory and /redemptions
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);

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
