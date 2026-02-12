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
import inventoryRoutes from './routes/inventory.js';
import cron from 'node-cron';
import { runDailyContributions } from './services/contributionAutomation.js';
import { enforceContributionPolicy } from './services/contributionEnforcement.js';
import { authenticateToken, isAdmin, isSuperAdmin } from './middleware/auth.js';
import { authRateLimiter, apiRateLimiter, adminRateLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = process.env.NODE_ENV === 'test'
    ? '.env.test'
    : (process.env.NODE_ENV === 'production' ? '.env.production' : '.env');
dotenv.config({ path: path.resolve(__dirname, envFile) });

const app = express();

// CORS Configuration - Restrict to specific domains in production
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://valuehills.shop', 'https://www.valuehills.shop', 'https://1api.valuehills.shop']
        : '*',
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 📝 Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// ⚠️ Database Connection Guard Middleware
app.use((req, res, next) => {
    if (app.locals.dbError) {
        // Allow static files, frontend assets, and API health checks
        if (req.path.startsWith('/assets') || 
            req.path === '/health' || 
            req.path === '/debug/db' ||
            req.path.startsWith('/assets/') ||
            req.path.endsWith('.js') ||
            req.path.endsWith('.css') ||
            req.path.endsWith('.ico') ||
            req.path.endsWith('.png') ||
            req.path.endsWith('.svg') ||
            req.path.endsWith('.jpg') ||
            req.path === '/' ||
            req.path === '/login' ||
            req.path === '/signup') {
            return next();
        }

        // Return 503 for API requests
        if (req.path.startsWith('/api') || req.xhr) {
            return res.status(503).json({
                error: 'Service Unavailable',
                message: 'Database connection failed',
                details: process.env.NODE_ENV === 'development' ? app.locals.dbError : 'Please contact support or try again later.'
            });
        }

        // Redirect to home for browser requests
        return res.redirect('/');
    }
    next();
});

// 🐛 Debug DB Endpoint
app.get('/debug/db', (req, res) => {
    res.json({
        status: app.locals.dbError ? 'error' : 'connected',
        error: app.locals.dbError || null,
        env: {
            NODE_ENV: process.env.NODE_ENV,
            DB_URL_CONFIGURED: !!process.env.DATABASE_URL
        }
    });
});

const apiRouter = express.Router();

// ⚙️ Contribution Automation Scheduler (Daily at Midnight)
if (process.env.NODE_ENV !== 'test') {
    cron.schedule('0 0 * * *', () => {
        runDailyContributions();
    });
    
    // ⚙️ Contribution Enforcement Scheduler (Daily at 1 AM)
    cron.schedule('0 1 * * *', async () => {
        console.log('\n🔍 Running scheduled contribution enforcement...');
        await enforceContributionPolicy();
    });
    
    console.log('✓ Scheduled jobs initialized:');
    console.log('  - Daily contributions: 00:00 (midnight)');
    console.log('  - Enforcement check: 01:00 (1 AM)');
}

// 🩺 Health Check
apiRouter.get('/health', (req, res) => res.json({ status: 'up', timestamp: new Date() }));

// Admin Automation
apiRouter.post('/admin/automation/run', authenticateToken, isSuperAdmin, async (req, res) => {
    await runDailyContributions();
    res.json({ message: 'Automation worker triggered manually' });
});

// Admin Enforcement (manual trigger)
apiRouter.post('/admin/enforcement/run', authenticateToken, isSuperAdmin, async (req, res) => {
    const result = await enforceContributionPolicy();
    res.json({ message: 'Enforcement completed', ...result });
});

// API Route Mount Points (with rate limiting on auth)
apiRouter.use('/auth', authRateLimiter, authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/wallet', walletRoutes);
apiRouter.use('/packages', packageRoutes);
apiRouter.use('/contributions', contributionRoutes);
apiRouter.use('/referrals', referralRoutes);
apiRouter.use('/bonuses', bonusRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/withdrawals', withdrawalRoutes);
apiRouter.use('/redemptions', redemptionRoutes);
apiRouter.use('/inventory', inventoryRoutes);
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
// Check multiple locations for the frontend build
const possiblePaths = [
    path.resolve(__dirname, '../dist'),                    // ../dist from server/
    path.resolve(__dirname, '../../dist'),                 // ../../dist from server/services/
    path.resolve(__dirname, 'dist'),                      // dist/ in server folder
];

let distPath = null;
let indexPath = null;

for (const p of possiblePaths) {
    const testIndex = path.join(p, 'index.html');
    if (fs.existsSync(testIndex)) {
        distPath = p;
        indexPath = testIndex;
        console.log(`[SPA] Found frontend build at: ${distPath}`);
        break;
    }
}

if (!distPath) {
    console.error('[SPA ERROR] Frontend build not found!');
    console.error('[SPA ERROR] Searched in:');
    possiblePaths.forEach(p => console.error(`[SPA ERROR]   - ${p}`));
}

if (distPath && process.env.API_ONLY !== 'true') {
    // Only serve static files if NOT in API-only mode
    // 3. Serve Static Assets (excluding index.html)
    app.use(express.static(distPath, { index: false }));

    // 4. Fallback API Mount (for proxies stripping /api)
    const apiPaths = ['/auth', '/users', '/wallet', '/packages', '/contributions', '/referrals', '/bonuses', '/notifications', '/withdrawals', '/redemptions', '/admin', '/dashboard', '/health'];
    app.use((req, res, next) => {
        // Skip fallback if the request accepts HTML (likely a browser page load)
        const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
        if (acceptsHtml) {
            return next();
        }

        const isApiPath = apiPaths.some(p => req.path.startsWith(p) || req.originalUrl.startsWith(p));
        if (isApiPath) {
            return apiRouter(req, res, next);
        }
        next();
    });

    // 5. Catch-all for SPA (Frontend Routes)
    app.use((req, res, next) => {
        // If it's an /api path that wasn't caught, return JSON 404
        if (req.path.startsWith('/api') || req.originalUrl.startsWith('/api')) {
            return res.status(404).json({ error: 'API endpoint not found', path: req.url });
        }

        // Dedicated check for root path in development to show status message
        if (process.env.NODE_ENV === 'development' && req.path === '/') {
            return res.send('Backend API is running. Access frontend at http://localhost:5173');
        }

        // Serve index.html for all other routes to let React handle routing
        if (process.env.API_ONLY === 'true') {
            // API-only mode - don't serve frontend
            return res.status(404).json({ error: 'API endpoint not found', path: req.url });
        }
        if (indexPath && fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else if (process.env.NODE_ENV === 'development') {
            // In development, redirect to Vite dev server
            res.redirect(`http://localhost:5173${req.originalUrl}`);
        } else {
            res.status(500).send('Frontend build missing or inaccessible.');
        }
    });
} else {
    // API-only mode - no frontend served
    app.get('/', (req, res) => {
        res.json({ 
            status: 'ok', 
            message: 'Backend API is running',
            endpoints: ['/api/auth', '/api/users', '/api/wallet', '/api/dashboard', '/api/admin']
        });
    });
}

export default app;
