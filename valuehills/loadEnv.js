import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = process.env.NODE_ENV === 'test'
    ? '.env.test'
    : (process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local');

console.log(`Loading environment from ${envFile}...`);
dotenv.config({ path: path.resolve(__dirname, envFile) });

// 🛠️ Auto-fix Hostinger Database Connection
// Hostinger dashboard often forces the public domain, but the app (running locally on the same server)
// must use 127.0.0.1 (localhost) to connect successfully.
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('khaki-termite-134516.hostingersite.com')) {
    console.log('⚠️ DETECTED EXTERNAL DB HOSTNAME ON HOSTINGER');
    console.log('🔄 Auto-switching DATABASE_URL host to 127.0.0.1 for local connection...');
    process.env.DATABASE_URL = process.env.DATABASE_URL.replace('khaki-termite-134516.hostingersite.com', '127.0.0.1');
}
