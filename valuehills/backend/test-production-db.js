import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.production manually for this test script
dotenv.config({ path: path.resolve(__dirname, '.env.production') });

console.log('Testing DB connection with config:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@')); // Mask password

const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.$connect();
        console.log('✅ Connection successful!');
        const tables = await prisma.$queryRaw`SHOW TABLES`;
        console.log('Tables:', tables);
    } catch (e) {
        console.error('❌ Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
