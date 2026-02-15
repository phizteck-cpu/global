/**
 * Database Initialization Script
 * Runs before server starts to ensure database is ready
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Initializing database...');

try {
    // Check if database file exists
    const dbPath = path.join(__dirname, 'prisma', 'dev.db');
    const dbExists = fs.existsSync(dbPath);

    if (!dbExists) {
        console.log('📦 Database file not found. Creating...');
        
        // Ensure prisma directory exists
        const prismaDir = path.join(__dirname, 'prisma');
        if (!fs.existsSync(prismaDir)) {
            fs.mkdirSync(prismaDir, { recursive: true });
        }
    }

    // Run prisma db push to create/update database
    console.log('🔄 Running prisma db push...');
    execSync('npx prisma db push --skip-generate', { 
        stdio: 'inherit',
        cwd: __dirname 
    });

    console.log('✅ Database initialized successfully');

    // Only seed if database was just created
    if (!dbExists) {
        console.log('🌱 Seeding database with initial data...');
        try {
            execSync('npm run seed', { 
                stdio: 'inherit',
                cwd: __dirname 
            });
            console.log('✅ Database seeded successfully');
        } catch (seedError) {
            console.warn('⚠️ Seeding failed (this is okay if data already exists):', seedError.message);
        }
    }

} catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('The server will start but may not function correctly.');
    console.error('Please run these commands manually:');
    console.error('  1. npx prisma db push');
    console.error('  2. npm run seed');
    console.error('  3. node create-superadmin.js');
}

console.log('✅ Database initialization complete\n');
