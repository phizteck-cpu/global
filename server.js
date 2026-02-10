#!/usr/bin/env node

// Hostinger-compatible entry point
// Entry Point: server.js
// Start Command: node server.js

import './backend/loadEnv.js';
import backendApp from './backend/app.js';
import prisma from './backend/prisma/client.js';

const PORT = process.env.PORT || 5000;

console.log('🚀 Starting ValueHills API Server...');
console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
async function start() {
    try {
        console.log('Checking database connection...');
        await prisma.$queryRaw`SELECT 1`;
        console.log('✅ Database connected');

        backendApp.listen(PORT, '0.0.0.0', () => {
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('⚠️ Starting server anyway (limited functionality)');

        backendApp.listen(PORT, '0.0.0.0', () => {
            console.log(`✅ Server running on port ${PORT} (no database)`);
        });
    }
}

start();
