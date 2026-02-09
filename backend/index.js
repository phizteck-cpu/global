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
        await prisma.$queryRaw`SELECT 1`;
        console.log('Database connected successfully');

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('Failed to start server:');
        console.error(error.message);
        process.exit(1);
    }
}

startServer();
