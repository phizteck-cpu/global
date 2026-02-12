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

        // Try to connect to database
        await prisma.$queryRaw`SELECT 1`;
        console.log('Database connected successfully');

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('Failed to connect to database:', error.message);
        console.error('Attempting to initialize database...');
        
        try {
            // Try to push schema to create database
            const { execSync } = await import('child_process');
            console.log('Running prisma db push...');
            execSync('npx prisma db push --accept-data-loss', { 
                stdio: 'inherit',
                cwd: process.cwd()
            });
            
            console.log('Database initialized successfully');
            
            // Try connecting again
            await prisma.$queryRaw`SELECT 1`;
            console.log('Database connection successful after initialization');
            
            // Start server
            app.listen(PORT, '0.0.0.0', () => {
                console.log(`🚀 Server running on port ${PORT}`);
                console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
                console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
            });
        } catch (initError) {
            console.error('Failed to initialize database:', initError.message);
            console.error('Starting server in fallback mode...');
            
            // Store error in app for debugging endpoint
            app.locals.dbError = error.message;

            app.listen(PORT, '0.0.0.0', () => {
                console.log(`⚠️ Server running in FALLBACK mode on port ${PORT}`);
                console.log(`❌ Database connection failed: ${error.message}`);
                console.log(`📋 To fix: Run 'npx prisma db push' manually`);
            });
        }
    }
}

startServer();
