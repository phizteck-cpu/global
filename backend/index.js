import './loadEnv.js';
import app from './app.js';
import prisma from './prisma/client.js';

const PORT = process.env.PORT || 5000;

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Check database connection and start server
async function startServer() {
    try {
        console.log('Checking database connection...');

        // Debug: Show which DB we are trying to connect to (Masked)
        const dbUrl = process.env.DATABASE_URL || '';
        const maskedUrl = dbUrl.replace(/:[^:@]*@/, ':****@');
        console.log(`DEBUG: Connecting to [${maskedUrl}]`);

        await prisma.$queryRaw`SELECT 1`;
        console.log('Database connected successfully');

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('Failed to connect to database:', error.message);
        // Do not exit! Start server anyway so we can show the error to the user
        // process.exit(1); 

        // Store error in app for debugging endpoint
        app.locals.dbError = error.message;

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`⚠️ Server running in FALLBACK mode on port ${PORT}`);
            console.log(`❌ Database connection failed: ${error.message}`);
        });
    }
}

startServer();
