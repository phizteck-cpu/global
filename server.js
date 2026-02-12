#!/usr/bin/env node

/**
 * Hostinger Entry Point
 * This file serves as the entry point for Hostinger Cloud Hosting
 * It loads the backend application from the backend directory
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from backend directory
const envPath = join(__dirname, 'backend', '.env.production');
config({ path: envPath });

console.log('🚀 Starting Valuehills Backend Server...');
console.log(`📁 Root Directory: ${__dirname}`);
console.log(`📝 Environment: ${process.env.NODE_ENV || 'production'}`);
console.log(`🔧 Loading backend from: ${join(__dirname, 'backend')}`);

// Change working directory to backend
process.chdir(join(__dirname, 'backend'));

// Import and start the backend server
import('./backend/index.js').catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});
