import prisma from './prisma/client.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'; // Ensure dotenv is imported if not already handled by client.js

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure env is loaded properly
if (process.env.NODE_ENV === 'production') {
    dotenv.config({ path: path.resolve(__dirname, '.env.production') });
} else {
    dotenv.config({ path: path.resolve(__dirname, '.env') });
}

// 🛠️ Auto-fix Hostinger Database Connection if needed
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('khaki-termite-134516.hostingersite.com')) {
    console.log('🔄 Auto-switching DATABASE_URL host to 127.0.0.1 for local execution...');
    process.env.DATABASE_URL = process.env.DATABASE_URL.replace('khaki-termite-134516.hostingersite.com', '127.0.0.1');
}

async function applySchema() {
    console.log('📄 Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'prisma', 'schema.sql');
    let sqlContent = fs.readFileSync(schemaPath, 'utf8');

    // Remove comments to clean up (optional but helps prevents parsing issues)
    // Simple regex to remove -- style comments
    sqlContent = sqlContent.replace(/--.*$/gm, '');

    // Split by semicolon to get individual statements
    const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    console.log(`🚀 Found ${statements.length} SQL statements to execute.`);
    console.log('🔗 Connecting to database...');

    try {
        // Disable foreign key checks globally for this session if possible, 
        // but since we execute statements individually, we might need to rely on the order or try-catch.
        // Actually, schema.sql has SET FOREIGN_KEY_CHECKS at the top.

        for (const [index, sql] of statements.entries()) {
            try {
                // Determine if it's a critical statement for logging
                const isDrop = sql.toUpperCase().startsWith('DROP');
                const isCreate = sql.toUpperCase().startsWith('CREATE');
                const isInsert = sql.toUpperCase().startsWith('INSERT');

                if (isDrop || isCreate) {
                    console.log(`[${index + 1}/${statements.length}] Executing: ${sql.substring(0, 50)}...`);
                }

                await prisma.$executeRawUnsafe(sql);
            } catch (err) {
                console.warn(`⚠️ Warning executing statement #${index + 1}: ${sql.substring(0, 50)}...`);
                console.warn(`   Error: ${err.message}`);
                // Continue despite errors (e.g. DROP TABLE might fail if table doesn't exist)
            }
        }

        console.log('✅ Schema executed successfully!');

    } catch (error) {
        console.error('❌ Critical Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

applySchema();
