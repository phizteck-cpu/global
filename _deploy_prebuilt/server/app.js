import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
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

apiRouter.get('/debug/paths', (req, res) => {
    const distPath = path.resolve(__dirname, '../dist');
    const indexPath = path.join(distPath, 'index.html');
    res.json({
        __dirname,
        cwd: process.cwd(),
        distPath,
        indexPath,
        distExists: fs.existsSync(distPath),
        indexExists: fs.existsSync(indexPath)
    });
});

// 1. Primary API Mount
app.use('/api', apiRouter);

// 2. Resolve Static Path
const distPath = path.resolve(__dirname, '../dist');
const indexPath = path.join(distPath, 'index.html');

// 3. Serve Static Assets
app.use(express.static(distPath));

// 4. Fallback API Mount (for proxies stripping /api)
const apiPaths = ['/auth', '/users', '/wallet', '/packages', '/contributions', '/referrals', '/bonuses', '/notifications', '/withdrawals', '/redemptions', '/admin', '/dashboard', '/health'];
app.use((req, res, next) => {
    const isApiPath = apiPaths.some(p => req.path.startsWith(p) || req.originalUrl.startsWith(p));
    if (isApiPath) {
        return apiRouter(req, res, next);
    }
    next();
});

// 5. Catch-all for SPA (Frontend Routes)
app.get('*', (req, res) => {
    console.log(`SPA Request: ${req.method} ${req.url} -> Sending ${indexPath}`);
    // If it's an /api path that wasn't caught, return JSON 404
    if (req.path.startsWith('/api') || req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found', path: req.url });
    }
    // Otherwise serve the React app
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error sending index.html:', err);
            res.status(500).send('Frontend build missing or inaccessible.');
        }
    });
});

export default app;
